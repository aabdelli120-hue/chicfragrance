"use client";

import { StatusDot } from "@/components/premium/plan-badge";
import { usePremium } from "@/components/premium/premium-provider";
import { formatInt } from "@/lib/format";
import { PLAN_RANK, isPlanId, type PlanId } from "@/lib/plans";
import type { ResolvedPlan } from "@/lib/premium-config";

export function CurrentPlanPanel({ orderCount }: { orderCount: number | null }) {
  const { plans, subscription, selectPlan, openAssistant, loaded } = usePremium();
  const active = subscription.status === "active" ? subscription.plan : null;
  const plan = active ? plans.find((item) => item.id === active) ?? null : null;

  if (!loaded) {
    return <div className="card p-5 text-sm text-chic-muted">Chargement de votre offre…</div>;
  }

  if (!plan) {
    return (
      <section className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Offre actuelle</p>
          <p className="mt-1 text-base font-semibold tracking-tight">Aucune offre active</p>
          <p className="mt-1 text-sm text-chic-muted">
            Vos outils de gestion restent disponibles. Choisissez une offre pour débloquer
            l’analytics avancé, l’IA et les modules à venir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAssistant("recommendation")}
          className="rounded-xl border border-chic-line bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-chic-emerald/40 hover:bg-chic-mint/40"
        >
          Trouver mon offre
        </button>
      </section>
    );
  }

  const upgrade = active ? nextUpgrade(plans, active) : null;

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Plan actuel</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{plan.name}</h2>
          <p className="mt-1 text-sm text-chic-muted tabular-nums">
            {plan.priceLabel}
            {plan.periodLabel ? ` ${plan.periodLabel}` : ""}
          </p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full border border-chic-emerald/25 bg-chic-mint px-3 py-1 text-xs font-medium text-chic-emerald">
          <StatusDot tone="ok" />
          Actif
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Tile
          label="Renouvellement"
          value={subscription.expiresAt ?? "Suivi par notre équipe"}
        />
        <Tile label="Fonctionnalités" value={`${plan.featureCount} incluses`} />
        <Tile
          label="Usage"
          value={orderCount != null ? `${formatInt(orderCount)} commandes` : "En attente de synchronisation"}
        />
      </div>

      {upgrade ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-chic-line bg-chic-cream/50 px-4 py-3">
          <p className="text-sm">
            Passer à <span className="font-semibold">{upgrade.name}</span> ·{" "}
            <span className="tabular-nums text-chic-muted">
              {upgrade.priceLabel}
              {upgrade.periodLabel ?? ""}
            </span>
          </p>
          <button
            type="button"
            onClick={() => selectPlan(upgrade.id)}
            className="rounded-xl bg-chic-emerald px-4 py-2 text-sm font-semibold text-white transition hover:bg-chic-forest"
          >
            Upgrade
          </button>
        </div>
      ) : null}
    </section>
  );
}

/** SUR MESURE has no rank, so it is never proposed as an automatic upgrade. */
function nextUpgrade(plans: ResolvedPlan[], current: PlanId): ResolvedPlan | null {
  const rank = PLAN_RANK[current];
  const rankable = plans.flatMap((plan) => {
    if (!isPlanId(plan.id)) return [];
    const planId = plan.id as PlanId;
    return [{ plan, rank: PLAN_RANK[planId] }];
  });
  return (
    rankable.filter((entry) => entry.rank > rank).sort((a, b) => a.rank - b.rank)[0]?.plan ?? null
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-chic-line px-3.5 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-chic-muted">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}
