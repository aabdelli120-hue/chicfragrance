import "server-only";

import { cookies } from "next/headers";
import {
  getSessionCookieName,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from "@/lib/platform/crypto";
import { permissionsForRole, type Permission } from "@/lib/platform/permissions";
import { ensurePlatformSeeded } from "@/lib/platform/seed";
import { readDatabase } from "@/lib/platform/store";
import type {
  AuthSession,
  PlatformRole,
  PlatformUser,
  SessionOrganization,
  SessionUser,
} from "@/lib/platform/types";

export function toSessionUser(user: PlatformUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    organizationId: user.organizationId,
    role: user.role,
    status: user.status,
    permissions: user.permissions,
  };
}

export async function resolvePermissions(user: PlatformUser): Promise<Permission[]> {
  if (user.role === "PLATFORM_ADMIN") {
    return permissionsForRole("PLATFORM_ADMIN");
  }
  return permissionsForRole(user.role, user.permissions);
}

export async function buildAuthSession(
  user: PlatformUser,
): Promise<AuthSession | null> {
  if (user.status === "suspended") return null;

  const db = await ensurePlatformSeeded();
  let organization: SessionOrganization | null = null;

  if (user.organizationId) {
    const org = db.organizations.find((o) => o.id === user.organizationId);
    if (!org || org.status === "suspended") return null;
    organization = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      status: org.status,
      plan: org.plan,
      currency: org.currency,
      country: org.country,
    };
  }

  const permissions = await resolvePermissions(user);

  return {
    user: toSessionUser(user),
    organization,
    permissions,
  };
}

export async function createSessionForUser(user: PlatformUser): Promise<string> {
  return signSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  });
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(getSessionCookieName(), token, sessionCookieOptions());
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(getSessionCookieName(), "", sessionCookieOptions(0));
}

export async function getSessionFromCookies(): Promise<AuthSession | null> {
  await ensurePlatformSeeded();
  const jar = await cookies();
  const token = jar.get(getSessionCookieName())?.value;
  if (!token) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  const db = await readDatabase();
  const user = db.users.find((u) => u.id === claims.sub);
  if (!user) return null;

  return buildAuthSession(user);
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw new AuthError("UNAUTHENTICATED", "Authentification requise.", 401);
  }
  return session;
}

export async function requireRole(
  roles: PlatformRole[],
): Promise<AuthSession> {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new AuthError("FORBIDDEN", "Accès refusé.", 403);
  }
  return session;
}

export async function requirePermission(
  permission: Permission | Permission[],
): Promise<AuthSession> {
  const session = await requireSession();
  const needed = Array.isArray(permission) ? permission : [permission];
  const ok = needed.every((p) => session.permissions.includes(p));
  if (!ok) {
    throw new AuthError("FORBIDDEN", "Permission insuffisante.", 403);
  }
  return session;
}

/** Organization context for tenant-scoped APIs. Never trust client org id. */
export async function requireOrganizationContext(): Promise<
  AuthSession & { organizationId: string }
> {
  const session = await requireSession();
  if (session.user.role === "PLATFORM_ADMIN") {
    throw new AuthError(
      "FORBIDDEN",
      "Utilisez le panneau admin pour gérer les organisations.",
      403,
    );
  }
  if (!session.organization?.id) {
    throw new AuthError("FORBIDDEN", "Aucune organisation associée.", 403);
  }
  return { ...session, organizationId: session.organization.id };
}

export class AuthError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return {
      body: { ok: false, error: error.message, code: error.code },
      status: error.status,
    };
  }
  const message = error instanceof Error ? error.message : "Erreur serveur.";
  console.error("[auth]", error);
  return {
    body: {
      ok: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Erreur serveur."
          : message,
      code: "INTERNAL",
    },
    status: 500,
  };
}

export function homePathForRole(role: PlatformRole): string {
  return role === "PLATFORM_ADMIN" ? "/admin" : "/app";
}
