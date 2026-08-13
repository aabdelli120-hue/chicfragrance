"use client";

import { formatInt } from "@/lib/format";
import { planLabel, type PlanId } from "@/lib/plans";
import { StatusDot } from "@/components/premium/plan-badge";
import type { DataSource } from "@/lib/types";

type Status = {
  plan: PlanId;
  connected: boolean;
  source: DataSource;
  orderCount: number | null;
  loaded: boolean;
};

export function SystemStatusStrip({ status }: { status: Status }) {
  const sheetsOk = status.connected && status.source === "google-sheets";

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-stretch gap-px rounded-2xl border border-chic-line bg-chic-line">
        <StatusCell
          label="Données synchronisées"
          value="Google Sheets"
          meta={sheetsOk ? "Connecté" : status.loaded ? "Connexion requise" : "…"}
          tone={sheetsOk ? "ok" : "warn"}
        />
        <StatusCell
          label="Analytics"
          value={sheetsOk ? "Actif" : "En attente"}
          meta={status.orderCount != null ? `${formatInt(status.orderCount)} commandes` : "Synchronisation automatique"}
          tone={sheetsOk ? "ok" : "idle"}
        />
        <StatusCell
          label="IA"
          value={status.plan === "PRO" || status.plan === "ELITE" ? "Inclus" : "Disponible avec Pro"}
          meta="Bientôt disponible"
          tone="gold"
        />
        <StatusCell
          label="Espace"
          value={planLabel(status.plan)}
          meta={sheetsOk ? "Votre espace est connecté" : "Configurer Sheets"}
          tone={sheetsOk ? "ok" : "idle"}
        />
      </div>
    </div>
  );
}

function StatusCell({
  label,
  value,
  meta,
  tone,
}: {
  label: string;
  value: string;
  meta: string;
  tone: "ok" | "warn" | "idle" | "gold";
}) {
  return (
    <div className="min-w-[180px] flex-1 bg-white px-4 py-3">
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-chic-muted">
        <StatusDot tone={tone} />
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
      <p className="text-xs text-chic-muted">{meta}</p>
    </div>
  );
}

export function LiveDataRail({ status }: { status: Status }) {
  const sheetsOk = status.connected && status.source === "google-sheets";

  const items = [
    { label: "Google Sheets", value: sheetsOk ? "Connected" : "Setup", tone: sheetsOk ? "ok" as const : "warn" as const },
    { label: "Orders", value: status.orderCount != null ? formatInt(status.orderCount) : "—" },
    { label: "Data sync", value: "Synchronisation automatique" },
    { label: "Analytics", value: sheetsOk ? "Active" : "Idle" },
    { label: "AI", value: status.plan === "PRO" || status.plan === "ELITE" ? "Inclus" : "Available on Pro" },
    { label: "Store Builder", value: "Coming soon" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-[140px] rounded-xl border border-chic-line bg-white px-3 py-2.5"
        >
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-chic-muted">
            {"tone" in item && item.tone ? <StatusDot tone={item.tone} /> : null}
            {item.label}
          </p>
          <p className="mt-1 text-sm font-medium tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
