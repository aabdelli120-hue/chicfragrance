import "server-only";

import { ensurePlatformSeeded } from "@/lib/platform/seed";
import { readDatabase, updateDatabase } from "@/lib/platform/store";
import { createId, nowIso } from "@/lib/platform/ids";
import type { OrgStatus } from "@/lib/platform/types";
import type { PlanId } from "@/lib/plans";

export async function adminOverview() {
  await ensurePlatformSeeded();
  const db = await readDatabase();
  const orgs = db.organizations;
  const activeOrgs = orgs.filter((o) => o.status === "active");
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newOrgs = orgs.filter(
    (o) => new Date(o.createdAt).getTime() >= weekAgo,
  );
  const activeSubs = db.subscriptions.filter((s) => s.status === "active");

  const planPrices: Partial<Record<PlanId, number>> = {
    ESSENTIAL: 900,
    PRO: 1900,
    ELITE: 2900,
  };

  const mrr = activeSubs.reduce((sum, s) => sum + (planPrices[s.planId] ?? 0), 0);

  return {
    totalOrganizations: orgs.length,
    activeOrganizations: activeOrgs.length,
    newOrganizations: newOrgs.length,
    activeSubscriptions: activeSubs.length,
    mrr,
    totalUsers: db.users.filter((u) => u.role !== "PLATFORM_ADMIN").length,
    landingPages: db.landingPages.length,
    aiUsage: 0,
    recentActivity: db.auditLogs.slice(-20).reverse(),
  };
}

export async function listOrganizationsForAdmin() {
  await ensurePlatformSeeded();
  const db = await readDatabase();
  return db.organizations.map((org) => {
    const owner = db.users.find(
      (u) => u.organizationId === org.id && u.role === "OWNER",
    );
    const users = db.users.filter((u) => u.organizationId === org.id).length;
    const sub = db.subscriptions.find((s) => s.organizationId === org.id);
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      status: org.status,
      plan: org.plan,
      ownerName: owner?.name ?? "—",
      ownerEmail: owner?.email ?? "—",
      users,
      createdAt: org.createdAt,
      lastActivityAt: org.lastActivityAt,
      subscriptionStatus: sub?.status ?? "inactive",
    };
  });
}

export async function setOrganizationStatus(
  organizationId: string,
  status: OrgStatus,
  actorId: string,
): Promise<void> {
  await updateDatabase((db) => {
    const org = db.organizations.find((o) => o.id === organizationId);
    if (!org) throw new Error("NOT_FOUND");
    org.status = status;
    org.updatedAt = nowIso();
    db.auditLogs.push({
      id: createId("log"),
      actorUserId: actorId,
      organizationId,
      action: status === "suspended" ? "org.suspended" : "org.activated",
      meta: { status },
      createdAt: nowIso(),
    });
  });
}

export async function setOrganizationPlan(
  organizationId: string,
  plan: PlanId,
  actorId: string,
): Promise<void> {
  await updateDatabase((db) => {
    const org = db.organizations.find((o) => o.id === organizationId);
    if (!org) throw new Error("NOT_FOUND");
    org.plan = plan;
    org.updatedAt = nowIso();
    let sub = db.subscriptions.find((s) => s.organizationId === organizationId);
    const timestamp = nowIso();
    if (!sub) {
      sub = {
        id: createId("sub"),
        organizationId,
        planId: plan,
        status: "active",
        startedAt: timestamp,
        expiresAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      db.subscriptions.push(sub);
    } else {
      sub.planId = plan;
      sub.status = "active";
      sub.updatedAt = timestamp;
      if (!sub.startedAt) sub.startedAt = timestamp;
    }
    db.auditLogs.push({
      id: createId("log"),
      actorUserId: actorId,
      organizationId,
      action: "org.plan_updated",
      meta: { plan },
      createdAt: timestamp,
    });
  });
}

export async function listUsersForAdmin() {
  await ensurePlatformSeeded();
  const db = await readDatabase();
  return db.users.map((u) => {
    const org = db.organizations.find((o) => o.id === u.organizationId);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      organizationName: org?.name ?? (u.role === "PLATFORM_ADMIN" ? "Platform" : "—"),
      createdAt: u.createdAt,
    };
  });
}
