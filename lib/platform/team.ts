import "server-only";

import { createId, createToken, daysFromNow, nowIso } from "@/lib/platform/ids";
import {
  DEFAULT_EMPLOYEE_PERMISSIONS,
  permissionsForRole,
  type Permission,
} from "@/lib/platform/permissions";
import { AuthError } from "@/lib/platform/session";
import { readDatabase, updateDatabase } from "@/lib/platform/store";
import type { Invitation, PlatformRole, PlatformUser } from "@/lib/platform/types";
import { hashPassword } from "@/lib/platform/crypto";

export async function listTeamMembers(organizationId: string) {
  const db = await readDatabase();
  const users = db.users
    .filter((u) => u.organizationId === organizationId)
    .map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      role: u.role,
      status: u.status,
      permissions: u.permissions,
      createdAt: u.createdAt,
    }));

  const invitations = db.invitations.filter(
    (i) => i.organizationId === organizationId && i.status === "pending",
  );

  return { users, invitations };
}

export async function createInvitation(input: {
  organizationId: string;
  invitedBy: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Exclude<PlatformRole, "PLATFORM_ADMIN">;
  permissions?: Permission[];
}): Promise<{ invitation: Invitation; devInvitePath?: string }> {
  const email = input.email.trim().toLowerCase();
  const db = await readDatabase();

  if (db.users.some((u) => u.email === email)) {
    throw new AuthError("EMAIL_TAKEN", "Cet email appartient déjà à un compte.", 409);
  }
  if (
    db.invitations.some(
      (i) => i.email === email && i.status === "pending" && i.expiresAt > nowIso(),
    )
  ) {
    throw new AuthError("INVITE_EXISTS", "Une invitation est déjà en cours pour cet email.", 409);
  }

  if (input.role === "OWNER") {
    throw new AuthError("FORBIDDEN", "Impossible d'inviter un second propriétaire.", 403);
  }

  const permissions =
    input.role === "EMPLOYEE"
      ? input.permissions?.length
        ? input.permissions
        : DEFAULT_EMPLOYEE_PERMISSIONS
      : permissionsForRole(input.role);

  const invitation: Invitation = {
    id: createId("inv"),
    organizationId: input.organizationId,
    email,
    name: input.name.trim(),
    phone: input.phone ?? null,
    role: input.role,
    permissions,
    token: createToken(),
    status: "pending",
    invitedBy: input.invitedBy,
    createdAt: nowIso(),
    expiresAt: daysFromNow(7),
  };

  await updateDatabase((d) => {
    d.invitations.push(invitation);
    d.auditLogs.push({
      id: createId("log"),
      actorUserId: input.invitedBy,
      organizationId: input.organizationId,
      action: "team.invite",
      meta: { email, role: input.role },
      createdAt: nowIso(),
    });
  });

  const allowDev =
    process.env.NODE_ENV !== "production" ||
    process.env.CHIC_DEV_AUTH_FALLBACK === "true";

  return {
    invitation,
    ...(allowDev ? { devInvitePath: `/invite/${invitation.token}` } : {}),
  };
}

export async function acceptInvitation(input: {
  token: string;
  password: string;
}): Promise<PlatformUser> {
  if (input.password.length < 8) {
    throw new AuthError("WEAK_PASSWORD", "Le mot de passe doit contenir au moins 8 caractères.", 400);
  }

  const passwordHash = await hashPassword(input.password);
  let created!: PlatformUser;

  await updateDatabase((db) => {
    const invitation = db.invitations.find(
      (i) =>
        i.token === input.token &&
        i.status === "pending" &&
        i.expiresAt > nowIso(),
    );
    if (!invitation) {
      throw new AuthError("INVALID_TOKEN", "Invitation invalide ou expirée.", 400);
    }
    if (db.users.some((u) => u.email === invitation.email)) {
      throw new AuthError("EMAIL_TAKEN", "Cet email est déjà utilisé.", 409);
    }

    const timestamp = nowIso();
    created = {
      id: createId("usr"),
      email: invitation.email,
      name: invitation.name,
      phone: invitation.phone,
      avatarUrl: null,
      organizationId: invitation.organizationId,
      role: invitation.role,
      status: "active",
      permissions: invitation.permissions,
      passwordHash,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.users.push(created);
    invitation.status = "accepted";
  });

  return created;
}

export async function updateMemberPermissions(input: {
  organizationId: string;
  actorId: string;
  memberId: string;
  permissions: Permission[];
  role?: Exclude<PlatformRole, "PLATFORM_ADMIN">;
}): Promise<void> {
  await updateDatabase((db) => {
    const member = db.users.find(
      (u) => u.id === input.memberId && u.organizationId === input.organizationId,
    );
    if (!member) {
      throw new AuthError("NOT_FOUND", "Membre introuvable.", 404);
    }
    if (member.role === "OWNER") {
      throw new AuthError("FORBIDDEN", "Impossible de modifier le propriétaire.", 403);
    }
    if (input.role) {
      if (input.role === "OWNER") {
        throw new AuthError("FORBIDDEN", "Impossible de promouvoir en propriétaire.", 403);
      }
      member.role = input.role;
      member.permissions =
        input.role === "EMPLOYEE"
          ? input.permissions
          : permissionsForRole(input.role);
    } else {
      member.permissions = input.permissions;
    }
    member.updatedAt = nowIso();
    db.auditLogs.push({
      id: createId("log"),
      actorUserId: input.actorId,
      organizationId: input.organizationId,
      action: "team.permissions_updated",
      meta: { memberId: member.id },
      createdAt: nowIso(),
    });
  });
}

export async function setMemberStatus(input: {
  organizationId: string;
  actorId: string;
  memberId: string;
  status: "active" | "suspended";
}): Promise<void> {
  await updateDatabase((db) => {
    const member = db.users.find(
      (u) => u.id === input.memberId && u.organizationId === input.organizationId,
    );
    if (!member) {
      throw new AuthError("NOT_FOUND", "Membre introuvable.", 404);
    }
    if (member.role === "OWNER") {
      throw new AuthError("FORBIDDEN", "Impossible de suspendre le propriétaire.", 403);
    }
    member.status = input.status;
    member.updatedAt = nowIso();
  });
}

export async function getInvitationByToken(token: string) {
  const db = await readDatabase();
  const invitation = db.invitations.find((i) => i.token === token);
  if (!invitation || invitation.status !== "pending" || invitation.expiresAt <= nowIso()) {
    return null;
  }
  const org = db.organizations.find((o) => o.id === invitation.organizationId);
  return { invitation, organizationName: org?.name ?? "Organisation" };
}
