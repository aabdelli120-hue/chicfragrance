import "server-only";

import { hashPassword } from "@/lib/platform/crypto";
import { createId, nowIso, slugify } from "@/lib/platform/ids";
import { OWNER_PERMISSIONS } from "@/lib/platform/permissions";
import { emptyDatabase, readDatabase, replaceDatabase } from "@/lib/platform/store";
import type {
  Integration,
  Organization,
  PlatformDatabase,
  PlatformUser,
  Subscription,
} from "@/lib/platform/types";
import { getWorkspaceSettings } from "@/lib/workspace-settings";

const CHIC_ORG_SLUG = "chic-fragrance";

function env(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export async function ensurePlatformSeeded(): Promise<PlatformDatabase> {
  const existing = await readDatabase();
  if (existing.organizations.length > 0 && existing.users.length > 0) {
    return existing;
  }

  const settings = await getWorkspaceSettings();
  const timestamp = nowIso();

  const orgId = createId("org");
  const ownerId = createId("usr");
  const adminId = createId("usr");
  const subId = createId("sub");
  const integrationId = createId("int");

  const organization: Organization = {
    id: orgId,
    name: settings.general.storeName || "Chic Fragrance",
    slug: CHIC_ORG_SLUG,
    logoUrl: "/logo.png",
    status: "active",
    plan: settings.subscription.plan || "FREE",
    currency: settings.general.currency || "DZD",
    country: "Algeria",
    timezone: settings.general.timezone || "Africa/Algiers",
    createdAt: timestamp,
    updatedAt: timestamp,
    lastActivityAt: timestamp,
  };

  const ownerPassword = env("SEED_OWNER_PASSWORD", "ChangeMeOwner123!");
  const adminPassword = env("PLATFORM_ADMIN_PASSWORD", "ChangeMeAdmin123!");

  const owner: PlatformUser = {
    id: ownerId,
    email: env("SEED_OWNER_EMAIL", "sofiane@chicfragrance.dz").toLowerCase(),
    name: settings.account.name || "Sofiane",
    phone: null,
    avatarUrl: null,
    organizationId: orgId,
    role: "OWNER",
    status: "active",
    permissions: OWNER_PERMISSIONS,
    passwordHash: await hashPassword(ownerPassword),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const admin: PlatformUser = {
    id: adminId,
    email: env("PLATFORM_ADMIN_EMAIL", "admin@platform.local").toLowerCase(),
    name: "Platform Admin",
    phone: null,
    avatarUrl: null,
    organizationId: null,
    role: "PLATFORM_ADMIN",
    status: "active",
    permissions: [],
    passwordHash: await hashPassword(adminPassword),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const subscription: Subscription = {
    id: subId,
    organizationId: orgId,
    planId: settings.subscription.plan || "FREE",
    status: settings.subscription.status === "active" ? "active" : "inactive",
    startedAt: settings.subscription.startedAt,
    expiresAt: settings.subscription.expiresAt,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const spreadsheetId =
    settings.sheets.spreadsheetId.trim() ||
    process.env.GOOGLE_SHEET_ID?.trim() ||
    "";

  const integration: Integration = {
    id: integrationId,
    organizationId: orgId,
    provider: "google_sheets",
    type: "orders_expenses",
    configuration: {
      spreadsheetId,
      ordersSheet: settings.sheets.ordersSheet,
      ordersRange: settings.sheets.ordersRange,
      expensesSheet: settings.sheets.expensesSheet,
      expensesRange: settings.sheets.expensesRange,
    },
    status: spreadsheetId ? "connected" : "disconnected",
    lastSyncAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const db = emptyDatabase();
  db.organizations = [organization];
  db.users = [admin, owner];
  db.subscriptions = [subscription];
  db.integrations = [integration];
  db.auditLogs = [
    {
      id: createId("log"),
      actorUserId: adminId,
      organizationId: orgId,
      action: "platform.seeded",
      meta: {
        organization: organization.name,
        owner: owner.email,
      },
      createdAt: timestamp,
    },
  ];

  await replaceDatabase(db);
  return db;
}

export async function createOrganizationWithOwner(input: {
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  phone?: string | null;
  currency?: string;
  country?: string;
  logoUrl?: string | null;
}): Promise<{ organization: Organization; owner: PlatformUser }> {
  const timestamp = nowIso();
  const orgId = createId("org");
  const ownerId = createId("usr");
  const baseSlug = slugify(input.storeName) || "store";

  const { readDatabase: read, updateDatabase } = await import("@/lib/platform/store");
  const existing = await read();
  let slug = baseSlug;
  let i = 2;
  while (existing.organizations.some((o) => o.slug === slug)) {
    slug = `${baseSlug}-${i}`;
    i += 1;
  }

  const organization: Organization = {
    id: orgId,
    name: input.storeName.trim(),
    slug,
    logoUrl: input.logoUrl ?? null,
    status: "trial",
    plan: "FREE",
    currency: input.currency || "DZD",
    country: input.country || "Algeria",
    timezone: "Africa/Algiers",
    createdAt: timestamp,
    updatedAt: timestamp,
    lastActivityAt: timestamp,
  };

  const owner: PlatformUser = {
    id: ownerId,
    email: input.ownerEmail.trim().toLowerCase(),
    name: input.ownerName.trim(),
    phone: input.phone ?? null,
    avatarUrl: null,
    organizationId: orgId,
    role: "OWNER",
    status: "active",
    permissions: OWNER_PERMISSIONS,
    passwordHash: await hashPassword(input.ownerPassword),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await updateDatabase((db) => {
    if (db.users.some((u) => u.email === owner.email)) {
      throw new Error("EMAIL_TAKEN");
    }
    db.organizations.push(organization);
    db.users.push(owner);
    db.subscriptions.push({
      id: createId("sub"),
      organizationId: orgId,
      planId: "FREE",
      status: "inactive",
      startedAt: null,
      expiresAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    db.integrations.push({
      id: createId("int"),
      organizationId: orgId,
      provider: "google_sheets",
      type: "orders_expenses",
      configuration: {
        spreadsheetId: "",
        ordersSheet: "COMMANDES",
        ordersRange: "A:K",
        expensesSheet: "DEPENSES",
        expensesRange: "A:K",
      },
      status: "disconnected",
      lastSyncAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    db.auditLogs.push({
      id: createId("log"),
      actorUserId: ownerId,
      organizationId: orgId,
      action: "organization.created",
      meta: { slug },
      createdAt: timestamp,
    });
  });

  return { organization, owner };
}
