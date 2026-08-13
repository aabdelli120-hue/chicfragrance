import "server-only";

import {
  createSessionForUser,
  setSessionCookie,
  toSessionUser,
  buildAuthSession,
  AuthError,
} from "@/lib/platform/session";
import { verifyPassword, hashPassword } from "@/lib/platform/crypto";
import { createId, createToken, daysFromNow, nowIso } from "@/lib/platform/ids";
import { createOrganizationWithOwner, ensurePlatformSeeded } from "@/lib/platform/seed";
import { readDatabase, updateDatabase } from "@/lib/platform/store";
import type { AuthSession, PlatformUser } from "@/lib/platform/types";

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthSession> {
  await ensurePlatformSeeded();
  const db = await readDatabase();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!user || user.status === "suspended") {
    throw new AuthError("INVALID_CREDENTIALS", "Email ou mot de passe incorrect.", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AuthError("INVALID_CREDENTIALS", "Email ou mot de passe incorrect.", 401);
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

  const token = await createSessionForUser(user);
  await setSessionCookie(token);

  await updateDatabase((d) => {
    const org = d.organizations.find((o) => o.id === user.organizationId);
    if (org) {
      org.lastActivityAt = nowIso();
    }
    d.auditLogs.push({
      id: createId("log"),
      actorUserId: user.id,
      organizationId: user.organizationId,
      action: "auth.login",
      meta: {},
      createdAt: nowIso(),
    });
  });

  return session;
}

export async function signupOwner(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  storeName: string;
  currency?: string;
  country?: string;
}): Promise<AuthSession> {
  await ensurePlatformSeeded();

  if (input.password.length < 8) {
    throw new AuthError("WEAK_PASSWORD", "Le mot de passe doit contenir au moins 8 caractères.", 400);
  }

  try {
    const { owner } = await createOrganizationWithOwner({
      storeName: input.storeName,
      ownerName: input.name,
      ownerEmail: input.email,
      ownerPassword: input.password,
      phone: input.phone ?? null,
      currency: input.currency,
      country: input.country,
    });

    const session = await buildAuthSession(owner);
    if (!session) {
      throw new AuthError("FORBIDDEN", "Impossible de créer la session.", 500);
    }

    const token = await createSessionForUser(owner);
    await setSessionCookie(token);
    return session;
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      throw new AuthError("EMAIL_TAKEN", "Cet email est déjà utilisé.", 409);
    }
    throw error;
  }
}

export async function requestPasswordReset(email: string): Promise<{
  ok: true;
  /** Dev-only fallback when email infrastructure is not ready. */
  devResetPath?: string;
}> {
  await ensurePlatformSeeded();
  const normalized = email.trim().toLowerCase();
  const db = await readDatabase();
  const user = db.users.find((u) => u.email === normalized);

  // Always return ok to avoid email enumeration.
  if (!user) return { ok: true };

  const token = createToken();
  await updateDatabase((d) => {
    d.passwordResets = d.passwordResets.filter((r) => r.userId !== user.id || r.usedAt);
    d.passwordResets.push({
      id: createId("rst"),
      userId: user.id,
      token,
      expiresAt: daysFromNow(1),
      usedAt: null,
      createdAt: nowIso(),
    });
  });

  const allowDev =
    process.env.NODE_ENV !== "production" ||
    process.env.CHIC_DEV_AUTH_FALLBACK === "true";

  return {
    ok: true,
    ...(allowDev ? { devResetPath: `/reset-password?token=${token}` } : {}),
  };
}

export async function resetPasswordWithToken(
  token: string,
  password: string,
): Promise<void> {
  if (password.length < 8) {
    throw new AuthError("WEAK_PASSWORD", "Le mot de passe doit contenir au moins 8 caractères.", 400);
  }

  await ensurePlatformSeeded();
  const hash = await hashPassword(password);

  await updateDatabase((db) => {
    const reset = db.passwordResets.find(
      (r) => r.token === token && !r.usedAt && r.expiresAt > nowIso(),
    );
    if (!reset) {
      throw new AuthError("INVALID_TOKEN", "Lien de réinitialisation invalide ou expiré.", 400);
    }
    const user = db.users.find((u) => u.id === reset.userId);
    if (!user) {
      throw new AuthError("INVALID_TOKEN", "Lien de réinitialisation invalide.", 400);
    }
    user.passwordHash = hash;
    user.updatedAt = nowIso();
    reset.usedAt = nowIso();
  });
}

export async function findUserByEmail(email: string): Promise<PlatformUser | null> {
  const db = await readDatabase();
  return (
    db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ??
    null
  );
}

export { toSessionUser };
