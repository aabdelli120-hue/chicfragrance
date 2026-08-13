"use client";

import Link from "next/link";
import { hasFeature, isFeatureAvailable, requiredPlanFor } from "@/lib/entitlements";
import type { FeatureId } from "@/lib/features";
import { useCurrentPlan } from "@/lib/use-current-plan";
import { PremiumLock } from "@/components/premium/feature-badge";

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
    return <div className="card p-8 text-sm text-chic-muted">Chargement…</div>;
  }

  if (!hasFeature(plan, feature)) {
    return <PremiumLock feature={feature} title={title} description={description} />;
  }

  if (!isFeatureAvailable(feature)) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-[11px] tracking-[0.2em] text-chic-gold">BIENTÔT DISPONIBLE</p>
        <h2 className="mt-2 font-serif text-3xl">{title}</h2>
        <p className="mt-3 text-sm text-chic-muted">{description}</p>
        <p className="mt-2 text-sm">Inclus dans le plan {required === "ELITE" ? "Elite" : "Pro"}, lancement prochain.</p>
        <Link href="/premium" className="mt-6 inline-flex text-sm text-chic-emerald">
          Voir les plans
        </Link>
      </div>
    );
  }

  return children;
}
