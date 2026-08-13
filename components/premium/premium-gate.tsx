"use client";

import { hasFeature, isFeatureAvailable, requiredPlanFor } from "@/lib/entitlements";
import type { FeatureId } from "@/lib/features";
import { useCurrentPlan } from "@/lib/use-current-plan";
import { PremiumLock } from "@/components/premium/feature-badge";
import { PlanBadge } from "@/components/premium/plan-badge";

export function PremiumGate({
  feature,
  title,
  description,
  children,
}: {
  feature: FeatureId;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { plan, loaded } = useCurrentPlan();
  const required = requiredPlanFor(feature);

  if (!loaded) {
    return <div className="card p-6 text-sm text-chic-muted">Chargement du module…</div>;
  }

  if (!hasFeature(plan, feature)) {
    return <PremiumLock feature={feature} title={title} description={description} />;
  }

  if (!isFeatureAvailable(feature)) {
    return (
      <div className="card max-w-lg p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-chic-muted">Module préparé</p>
          <PlanBadge plan={required} />
        </div>
        <h2 className="mt-3 text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-chic-muted">{description}</p>
        <p className="mt-2 text-sm">Bientôt disponible · inclus dans {required}.</p>
      </div>
    );
  }

  return children;
}
