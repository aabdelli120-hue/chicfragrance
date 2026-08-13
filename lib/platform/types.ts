import type { PlanId } from "@/lib/plans";
import type { Permission } from "@/lib/platform/permissions";

export const PLATFORM_ROLES = [
  "PLATFORM_ADMIN",
  "OWNER",
  "MANAGER",
  "EMPLOYEE",
  "VIEWER",
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const ORG_ROLES: PlatformRole[] = ["OWNER", "MANAGER", "EMPLOYEE", "VIEWER"];

export const USER_STATUSES = ["active", "invited", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ORG_STATUSES = ["active", "suspended", "trial"] as const;
export type OrgStatus = (typeof ORG_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = [
  "inactive",
  "active",
  "past_due",
  "cancelled",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const INTEGRATION_PROVIDERS = [
  "google_sheets",
  "meta",
  "whatsapp",
  "email",
] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

export const LANDING_PAGE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type LandingPageStatus = (typeof LANDING_PAGE_STATUSES)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: OrgStatus;
  plan: PlanId;
  currency: string;
  country: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
};

export type PlatformUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  /** Null for PLATFORM_ADMIN (platform-scoped). */
  organizationId: string | null;
  role: PlatformRole;
  status: UserStatus;
  /** Custom permissions — used primarily for EMPLOYEE. */
  permissions: Permission[];
  passwordHash: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Invitation = {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  phone: string | null;
  role: Exclude<PlatformRole, "PLATFORM_ADMIN">;
  permissions: Permission[];
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
};

export type Subscription = {
  id: string;
  organizationId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Integration = {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  type: string;
  /** Non-secret configuration only (spreadsheet id, sheet names, etc.). */
  configuration: Record<string, string>;
  status: "connected" | "disconnected" | "error";
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LandingPageSection = {
  id: string;
  type: "hero" | "product" | "benefits" | "offer" | "testimonials" | "faq" | "cta" | "footer";
  visible: boolean;
  order: number;
  content: Record<string, unknown>;
};

export type LandingPage = {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  slug: string;
  status: LandingPageStatus;
  productId: string | null;
  objective: string | null;
  angle: string | null;
  content: {
    sections: LandingPageSection[];
  };
  theme: {
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type PasswordResetToken = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorUserId: string | null;
  organizationId: string | null;
  action: string;
  meta: Record<string, unknown>;
  createdAt: string;
};

export type PlatformDatabase = {
  version: number;
  organizations: Organization[];
  users: PlatformUser[];
  invitations: Invitation[];
  subscriptions: Subscription[];
  integrations: Integration[];
  landingPages: LandingPage[];
  passwordResets: PasswordResetToken[];
  auditLogs: AuditLog[];
};

/** Safe user payload for client / session (no password hash). */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  organizationId: string | null;
  role: PlatformRole;
  status: UserStatus;
  permissions: Permission[];
};

export type SessionOrganization = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: OrgStatus;
  plan: PlanId;
  currency: string;
  country: string;
};

export type AuthSession = {
  user: SessionUser;
  organization: SessionOrganization | null;
  permissions: Permission[];
};
