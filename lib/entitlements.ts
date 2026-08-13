import { FEATURES, type FeatureId } from "@/lib/features";
import { PLAN_RANK, type PlanId } from "@/lib/plans";

export function requiredPlanFor(feature: FeatureId): PlanId {
  return FEATURES.find((item) => item.id === feature)?.requiredPlan ?? "PRO";
}

export function isFeatureAvailable(feature: FeatureId): boolean {
  return FEATURES.find((item) => item.id === feature)?.available ?? false;
}

export function hasFeature(plan: PlanId, feature: FeatureId): boolean {
  const definition = FEATURES.find((item) => item.id === feature);
  if (!definition) return false;
  return PLAN_RANK[plan] >= PLAN_RANK[definition.requiredPlan];
}

export function canUseFeature(plan: PlanId, feature: FeatureId): boolean {
  return hasFeature(plan, feature) && isFeatureAvailable(feature);
}

export function comparisonValue(plan: PlanId, feature: FeatureId): "yes" | "no" | "soon" {
  if (!hasFeature(plan, feature)) return "no";
  if (!isFeatureAvailable(feature)) return "soon";
  return "yes";
}
