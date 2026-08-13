"use client";

import { AppShell } from "@/components/app-shell";
import { FeatureBadge, PremiumLock } from "@/components/premium/feature-badge";
import { PlanBadge } from "@/components/premium/plan-badge";
import { hasFeature, isFeatureAvailable, requiredPlanFor } from "@/lib/entitlements";
import type { FeatureId } from "@/lib/features";
import { useCurrentPlan } from "@/lib/use-current-plan";

export function ModuleFrame({
  title,
  description,
  feature,
  children,
}: {
  title: string;
  description: string;
  feature: FeatureId;
  children: React.ReactNode;
}) {
  const { plan, loaded } = useCurrentPlan();
  const required = requiredPlanFor(feature);
  const locked = loaded && !hasFeature(plan, feature);
  const soon = loaded && hasFeature(plan, feature) && !isFeatureAvailable(feature);

  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8">
        <header className="mb-5 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
          <FeatureBadge feature={feature} />
          {soon || locked ? (
            <span className="rounded-full bg-chic-cream px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-chic-muted">
              Bientôt disponible
            </span>
          ) : null}
        </header>
        <p className="mb-5 max-w-2xl text-sm text-chic-muted">{description}</p>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>{children}</div>
          <aside>
            {!loaded ? (
              <div className="card p-5 text-sm text-chic-muted">Chargement du module…</div>
            ) : locked ? (
              <PremiumLock feature={feature} title={title} description={description} />
            ) : (
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-chic-muted">Statut</p>
                  <PlanBadge plan={required} />
                </div>
                <p className="mt-3 text-sm font-medium">Bientôt disponible</p>
                <p className="mt-1 text-sm text-chic-muted">
                  Module préparé. Aucune génération fictive n’est produite.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
