import { NextResponse } from "next/server";
import {
  AuthError,
  authErrorResponse,
  buildAuthSession,
  homePathForRole,
} from "@/lib/platform/session";
import {
  getSessionCookieName,
  sessionCookieOptions,
  signSessionToken,
  verifyPassword,
} from "@/lib/platform/crypto";
import { createId, nowIso } from "@/lib/platform/ids";
import { ensurePlatformSeeded } from "@/lib/platform/seed";
import { readDatabase, updateDatabase } from "@/lib/platform/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      throw new AuthError("VALIDATION", "Email et mot de passe requis.", 400);
    }

    await ensurePlatformSeeded();
    const db = await readDatabase();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === body.email!.trim().toLowerCase(),
    );

    if (!user || user.status === "suspended") {
      throw new AuthError(
        "INVALID_CREDENTIALS",
        "Email ou mot de passe incorrect.",
        401,
      );
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      throw new AuthError(
        "INVALID_CREDENTIALS",
        "Email ou mot de passe incorrect.",
        401,
      );
    }

    if (user.status === "invited") {
      throw new AuthError(
        "INVITE_PENDING",
        "Acceptez d'abord votre invitation pour activer le compte.",
        403,
      );
    }

    const session = await buildAuthSession(user);
    if (!session) {
      throw new AuthError("FORBIDDEN", "Compte ou organisation suspendu.", 403);
    }

    const token = await signSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    const response = NextResponse.json({
      ok: true,
      user: session.user,
      organization: session.organization,
      permissions: session.permissions,
      redirectTo: homePathForRole(session.user.role),
    });
    response.cookies.set(getSessionCookieName(), token, sessionCookieOptions());

    try {
      await updateDatabase((d) => {
        const org = d.organizations.find((o) => o.id === user.organizationId);
        if (org) org.lastActivityAt = nowIso();
        d.auditLogs.push({
          id: createId("log"),
          actorUserId: user.id,
          organizationId: user.organizationId,
          action: "auth.login",
          meta: {},
          createdAt: nowIso(),
        });
      });
    } catch (auditError) {
      console.error("[auth.login.audit]", auditError);
    }

    return response;
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
