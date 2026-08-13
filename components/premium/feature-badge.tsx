import Link from "next/link";
import { requiredPlanFor } from "@/lib/entitlements";
import type { FeatureId } from "@/lib/features";

export function FeatureBadge({
  feature,
  className = "",
}: {
  feature: FeatureId;
  className?: string;
}) {
  const plan = requiredPlanFor(feature);
  if (plan === "FREE" || plan === "ESSENTIAL") return null;
  return (
    <span
      className={`rounded-full border border-chic-gold/50 bg-chic-gold/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-chic-gold ${className}`}
    >
      {plan === "ELITE" ? "ELITE" : "PRO"}
    </span>
  );
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
  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-chic-gold/40 bg-chic-gold/10 text-chic-gold">
        <LockIcon />
      </div>
      <p className="mt-4 text-[11px] tracking-[0.2em] text-chic-gold">PREMIUM</p>
      <h2 className="mt-2 font-serif text-3xl">{title}</h2>
      <p className="mt-3 text-sm text-chic-muted">{description}</p>
      <p className="mt-2 text-sm">Disponible avec le plan {plan === "ELITE" ? "Elite" : "Pro"}.</p>
      <Link
        href="/premium"
        className="mt-6 inline-flex rounded-2xl bg-chic-gold px-5 py-3 text-sm font-semibold text-chic-forest-deep"
      >
        Découvrir {plan === "ELITE" ? "Elite" : "Pro"}
      </Link>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
