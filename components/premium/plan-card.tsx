"use client";

import { PlanBadge } from "@/components/premium/plan-badge";
import { usePremium } from "@/components/premium/premium-provider";
import type { ResolvedPlan } from "@/lib/premium-config";
import type { PlanCapability } from "@/lib/plans";

const CAPABILITY_TONE: Record<NonNullable<PlanCapability["tone"]>, string> = {
  on: "text-chic-emerald",
  partial: "text-foreground",
  soon: "text-chic-gold",
  off: "text-chic-muted",
};

export function PlanCard({ plan, wide = false }: { plan: ResolvedPlan; wide?: boolean }) {
  const { selectPlan, subscription } = usePremium();
  const isCurrent = subscription.status === "active" && subscription.plan === plan.id;
  const recommended = Boolean(plan.recommended);

  return (
    <article
      className={`card relative flex flex-col p-5 transition duration-300 ${
        recommended
          ? "border-chic-emerald/45 ring-1 ring-chic-emerald/20 lg:-translate-y-1"
          : plan.accent === "gold"
            ? "border-chic-gold/30"
            : ""
      } ${wide ? "lg:flex-row lg:items-start lg:gap-8" : ""}`}
    >
      {recommended ? (
        <span className="absolute -top-2.5 left-5 rounded-full bg-chic-emerald px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          {plan.badge}
        </span>
      ) : null}

      <div className={wide ? "lg:w-72 lg:shrink-0" : ""}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chic-muted">
              {plan.category}
            </p>
            <h3
              className={`mt-1 text-xl font-semibold tracking-tight ${
                plan.accent === "gold" ? "text-chic-gold" : ""
              }`}
            >
              {plan.name}
            </h3>
          </div>
          {!recommended && plan.badge ? <PlanBadge plan={plan.badge} /> : null}
        </div>

        <p className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-semibold tabular-nums tracking-tight">
            {plan.priceLabel}
          </span>
          {plan.periodLabel ? (
            <span className="text-sm font-normal text-chic-muted">{plan.periodLabel}</span>
          ) : null}
        </p>
        <p className="mt-2 text-sm text-chic-muted">{plan.description}</p>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${wide ? "mt-5 lg:mt-0" : ""}`}>
        <div
          className={`mt-4 grid gap-2 ${
            wide ? "sm:grid-cols-3 lg:mt-0" : "grid-cols-2"
          }`}
        >
          {plan.capabilities.map((capability) => (
            <div
              key={capability.label}
              className="rounded-lg border border-chic-line/80 bg-chic-cream/60 px-2.5 py-2"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-chic-muted">
                {capability.label}
              </p>
              <p
                className={`mt-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] ${
                  CAPABILITY_TONE[capability.tone ?? "partial"]
                }`}
              >
                {capability.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-chic-line/70 pt-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-chic-muted">
            {plan.featureCount} fonctionnalités
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-chic-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                plan.availability === "available"
                  ? "bg-emerald-500"
                  : plan.availability === "partial"
                    ? "bg-chic-gold"
                    : "bg-chic-muted/50"
              }`}
            />
            {plan.statusLabel}
          </p>
        </div>

        <ul
          className={`mt-3 flex-1 space-y-1.5 text-sm ${
            wide ? "sm:columns-2 sm:space-y-0 sm:[&>li]:mb-1.5" : ""
          }`}
        >
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="text-chic-emerald">✓</span>
              <span>{feature}</span>
            </li>
          ))}
          {plan.comingSoon?.map((feature) => (
            <li key={feature} className="flex flex-wrap items-center gap-2 text-chic-muted">
              <span>—</span>
              <span>{feature}</span>
              <span className="rounded-full bg-chic-cream px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Bientôt disponible
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => selectPlan(plan.id)}
          className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-300 ${
            recommended
              ? "bg-chic-emerald text-white hover:bg-chic-forest"
              : plan.accent === "gold"
                ? "bg-chic-forest-deep text-white hover:bg-chic-ink"
                : "border border-chic-line bg-white text-foreground hover:border-chic-emerald/40 hover:bg-chic-mint/50"
          }`}
        >
          {plan.cta}
        </button>
        <p className="mt-2 text-center text-[11px] text-chic-muted">
          {isCurrent ? "Offre actuelle" : "Activation avec notre équipe"}
        </p>
      </div>
    </article>
  );
}
