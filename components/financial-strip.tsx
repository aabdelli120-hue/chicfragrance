"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { formatDzd, formatEur, formatInt, formatUsd } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";

export function FinancialStrip({ metrics }: { metrics: DashboardMetrics }) {
  const items = [
    {
      label: "Dépensé USD",
      value: formatUsd(metrics.spendUsd),
      raw: metrics.spendUsd,
      tone: "text-chic-forest",
    },
    {
      label: "Dépensé EUR",
      value: formatEur(metrics.spendEur),
      raw: metrics.spendEur,
      tone: "text-chic-forest",
    },
    {
      label: "Dépensé DZD",
      value: formatDzd(metrics.adSpend),
      raw: metrics.adSpend,
      tone: "text-chic-forest",
    },
    {
      label: "Encaissés DZD",
      value: formatDzd(metrics.collected),
      raw: metrics.collected,
      tone: "text-chic-emerald",
    },
    {
      label: "Net après publicité",
      value: formatDzd(metrics.netAfterAds),
      raw: metrics.netAfterAds,
      tone: metrics.netAfterAds >= 0 ? "text-chic-forest" : "text-red-700",
    },
    {
      label: "Commandes confirmées",
      value: formatInt(metrics.confirmedOrders),
      raw: metrics.confirmedOrders ?? 0,
      tone: "text-chic-forest",
      empty: metrics.confirmedOrders === null,
    },
  ];

  return (
    <section>
      <h2 className="font-serif text-xl">Performance financière</h2>
      <p className="mt-1 text-xs text-chic-muted">
        Encaissés = totaux des commandes livrées. Net après publicité = Encaissés − Spend Dz.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {items.map((item) => (
          <article key={item.label} className="card p-4">
            <p className="text-[11px] uppercase tracking-wide text-chic-muted">{item.label}</p>
            <p className={`mt-2 font-serif text-xl ${item.tone}`}>
              {item.empty ? (
                "—"
              ) : item.label === "Commandes confirmées" ? (
                <AnimatedNumber value={item.raw} format={formatInt} />
              ) : (
                item.value
              )}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdPerformance({ metrics }: { metrics: DashboardMetrics }) {
  const items = [
    { label: "CPA réel", value: formatDzd(metrics.cpaReel), hint: "Spend Dz / commandes confirmées" },
    { label: "Coût par livraison", value: formatDzd(metrics.costPerDelivery), hint: "Spend Dz / livrées" },
    { label: "ROAS", value: metrics.roas === null ? "—" : `${metrics.roas.toFixed(2)}x`, hint: "Encaissés / Spend Dz" },
    {
      label: "Taux de livraison",
      value: metrics.deliveryRate === null ? "—" : `${metrics.deliveryRate.toFixed(1)}%`,
      hint: "Livrées / total commandes",
    },
  ];

  return (
    <article className="card p-5">
      <h2 className="font-serif text-xl">Performance publicitaire</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-chic-cream/80 p-4">
            <p className="text-xs text-chic-muted">{item.label}</p>
            <p className="mt-2 font-serif text-2xl text-chic-forest">{item.value}</p>
            <p className="mt-1 text-[11px] text-chic-muted">{item.hint}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
