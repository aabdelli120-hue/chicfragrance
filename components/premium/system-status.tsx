"use client";

import { formatInt } from "@/lib/format";
import { PLAN_RANK, planLabel, type PlanId } from "@/lib/plans";
import { StatusDot } from "@/components/premium/plan-badge";
import type { DataSource } from "@/lib/types";

type Status = {
  plan: PlanId;
  connected: boolean;
  source: DataSource;
  orderCount: number | null;
  loaded: boolean;
};

/** Compact technical strip: what the workspace does today, per capability. */
export function PricingRail({ status }: { status: Status }) {
  const sheetsOk = status.connected && status.source === "google-sheets";
  const hasPro = PLAN_RANK[status.plan] >= PLAN_RANK.PRO;
  const hasElite = PLAN_RANK[status.plan] >= PLAN_RANK.ELITE;

  const cells: Array<{
    label: string;
    value: string;
    meta: string;
    tone: "ok" | "warn" | "idle" | "gold";
  }> = [
    {
      label: "Données",
      value: "Google Sheets",
      meta: sheetsOk ? "Connecté" : status.loaded ? "Connexion requise" : "…",
      tone: sheetsOk ? "ok" : "warn",
    },
    {
      label: "Commandes",
      value: status.orderCount != null ? formatInt(status.orderCount) : "—",
      meta: "Synchronisation automatique",
      tone: sheetsOk ? "ok" : "idle",
    },
    {
      label: "Analytics",
      value: hasPro ? "Avancé" : "Basique",
      meta: hasPro ? "Inclus dans votre offre" : "Avancé avec GROW",
      tone: sheetsOk ? "ok" : "idle",
    },
    {
      label: "IA",
      value: hasPro ? "Inclus" : "Avec GROW",
      meta: "Bientôt disponible",
      tone: "gold",
    },
    {
      label: "Automation",
      value: hasElite ? "Inclus" : "Avec ELITE",
      meta: "Bientôt disponible",
      tone: "gold",
    },
    {
      label: "Store",
      value: "Bientôt",
      meta: "Module ELITE",
      tone: "idle",
    },
    {
      label: "Offre",
      value: planLabel(status.plan),
      meta: status.loaded ? "Activation manuelle" : "…",
      tone: status.plan === "FREE" ? "idle" : "ok",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-stretch gap-px rounded-2xl border border-chic-line bg-chic-line">
        {cells.map((cell) => (
          <div key={cell.label} className="min-w-[150px] flex-1 bg-white px-4 py-3">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-chic-muted">
              <StatusDot tone={cell.tone} />
              {cell.label}
            </p>
            <p className="mt-1 text-sm font-medium tabular-nums">{cell.value}</p>
            <p className="text-xs text-chic-muted">{cell.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
