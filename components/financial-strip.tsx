"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { formatDzd, formatEur, formatInt, formatUsd } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";

function safe(value: string | null | undefined) {
  if (!value || value === "NaN" || value.includes("Infinity") || value.includes("DIV")) {
    return "—";
  }
  return value;
}

export function FinancialStrip({ metrics }: { metrics: DashboardMetrics }) {
  const avgNetPerDay =
    metrics.dailySeries.length > 0
      ? metrics.netAfterAds / metrics.dailySeries.length
      : null;

  const items = [
    {
      label: "Dépenses USD",
      value: safe(formatUsd(metrics.spendUsd)),
    },
    {
      label: "Dépenses EUR",
      value: safe(formatEur(metrics.spendEur)),
    },
    {
      label: "Dépenses DZD",
      value: safe(formatDzd(metrics.adSpend)),
    },
    {
      label: "Encaissés DZD",
      value: safe(formatDzd(metrics.collected)),
      accent: true,
    },
    {
      label: "Net",
      value: safe(formatDzd(metrics.netAfterAds)),
      tone: metrics.netAfterAds >= 0 ? "text-chic-forest-deep" : "text-rose-700",
    },
    {
      label: "CPA réel",
      value: safe(formatDzd(metrics.costPerDelivery)),
      hint: "Spend Dz / Livré",
    },
    {
      label: "CPA période",
      value: safe(formatDzd(metrics.cpaReel)),
      hint: "Spend Dz / confirmées",
    },
    {
      label: "Net moyen / jour",
      value: avgNetPerDay === null ? "—" : safe(formatDzd(avgNetPerDay)),
    },
    {
      label: "Orders Confirmed",
      value:
        metrics.confirmedOrders === null
          ? "—"
          : formatInt(metrics.confirmedOrders),
    },
  ];

  return (
    <section>
      <h2 className="text-lg font-semibold text-chic-forest-deep">
        Performance financière
      </h2>
      <p className="mt-1 text-xs text-chic-muted">
        Encaissés = totaux des commandes au statut « Livré ». Net = Encaissés − Spend Dz.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => (
          <article key={item.label} className="card p-4">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-chic-muted uppercase">
              {item.label}
            </p>
            <p
              className={`mt-2 text-xl font-bold tabular ${
                item.tone ?? (item.accent ? "text-chic-emerald" : "text-chic-forest-deep")
              }`}
            >
              {item.label === "Orders Confirmed" && metrics.confirmedOrders !== null ? (
                <AnimatedNumber value={metrics.confirmedOrders} format={formatInt} />
              ) : (
                item.value
              )}
            </p>
            {item.hint ? (
              <p className="mt-1 text-[11px] text-chic-muted">{item.hint}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdPerformance({ metrics }: { metrics: DashboardMetrics }) {
  const items = [
    {
      label: "CPA réel",
      value: safe(formatDzd(metrics.costPerDelivery)),
      hint: "Spend Dz / Livré",
    },
    {
      label: "CPA période",
      value: safe(formatDzd(metrics.cpaReel)),
      hint: "Spend Dz / confirmées",
    },
    {
      label: "ROAS",
      value: metrics.roas === null ? "—" : `${metrics.roas.toFixed(2)}x`,
      hint: "Encaissés / Spend Dz",
    },
    {
      label: "Taux de livraison",
      value:
        metrics.deliveryRate === null ? "—" : `${metrics.deliveryRate.toFixed(1)}%`,
      hint: "Livré / total commandes",
    },
  ];

  return (
    <article className="card p-5">
      <h2 className="text-lg font-semibold text-chic-forest-deep">
        Indicateurs publicitaires
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-chic-mint/60 p-4">
            <p className="text-xs font-medium text-chic-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-bold tabular text-chic-forest-deep">
              {item.value}
            </p>
            <p className="mt-1 text-[11px] text-chic-muted">{item.hint}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
