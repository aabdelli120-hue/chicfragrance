import type { PlanId } from "@/lib/plans";

/**
 * Centralized plan capabilities for Landing Pages and future modules.
 * Do not scatter plan checks in UI components — use these helpers.
 *
 * Commercial names: START, GROW, ELITE.
 */
export type PlanCapability =
  | "landing_pages"
  | "landing_pages_ai"
  | "landing_pages_advanced"
  | "ai_product_studio"
  | "store_builder"
  | "multi_store"
  | "team_members"
  | "automations";

const PLAN_CAPS: Record<PlanId, Partial<Record<PlanCapability, number | boolean>>> = {
  FREE: {
    landing_pages: 1,
    landing_pages_ai: false,
    landing_pages_advanced: false,
    ai_product_studio: false,
    store_builder: false,
    multi_store: false,
    team_members: 2,
    automations: false,
  },
  ESSENTIAL: {
    landing_pages: 3,
    landing_pages_ai: false,
    landing_pages_advanced: false,
    ai_product_studio: false,
    store_builder: false,
    multi_store: false,
    team_members: 3,
    automations: false,
  },
  PRO: {
    landing_pages: 15,
    landing_pages_ai: true,
    landing_pages_advanced: false,
    ai_product_studio: true,
    store_builder: false,
    multi_store: false,
    team_members: 10,
    automations: true,
  },
  ELITE: {
    landing_pages: 100,
    landing_pages_ai: true,
    landing_pages_advanced: true,
    ai_product_studio: true,
    store_builder: true,
    multi_store: true,
    team_members: 50,
    automations: true,
  },
};

/** Display names shown in the product UI. */
export const PLAN_PUBLIC_NAME: Record<PlanId, string> = {
  FREE: "Gratuit",
  ESSENTIAL: "START",
  PRO: "GROW",
  ELITE: "ELITE",
};

export function planHasCapability(plan: PlanId, capability: PlanCapability): boolean {
  const value = PLAN_CAPS[plan]?.[capability];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return false;
}

export function planLimit(plan: PlanId, capability: PlanCapability): number {
  const value = PLAN_CAPS[plan]?.[capability];
  if (typeof value === "number") return value;
  if (value === true) return Number.POSITIVE_INFINITY;
  return 0;
}

export function canCreateLandingPage(plan: PlanId, currentCount: number): boolean {
  return currentCount < planLimit(plan, "landing_pages");
}
