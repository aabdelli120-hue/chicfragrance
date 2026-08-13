import Link from "next/link";
import { requiredPlanFor } from "@/lib/entitlements";
import type { FeatureId } from "@/lib/features";
import { PLAN_DISPLAY_NAME } from "@/lib/plans";
import { PlanBadge } from "@/components/premium/plan-badge";

export function FeatureBadge({
  feature,
  className = "",
}: {
  feature: FeatureId;
  className?: string;
}) {
  const plan = requiredPlanFor(feature);
  if (plan === "FREE" || plan === "ESSENTIAL") return null;
  return <PlanBadge plan={plan} className={className} />;
}

export function PremiumLock({
  feature,
  title,
  description,
}: {
  feature: FeatureId;
  title: string;
  description: string;
}) {
  const plan = requiredPlanFor(feature);
  const label = PLAN_DISPLAY_NAME[plan];

  return (
    <div className="card max-w-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-chic-line bg-chic-cream text-chic-muted">
          <LockIcon />
        </div>
        <PlanBadge plan={plan} />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-chic-muted">Disponible avec {label}</p>
      <p className="mt-2 text-sm">{description}</p>
      <Link
        href="/app/premium#plans"
        className="mt-4 inline-flex rounded-xl bg-chic-emerald px-4 py-2.5 text-sm font-semibold text-white"
      >
        Voir le plan {label}
      </Link>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
