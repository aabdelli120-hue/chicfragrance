"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { formatInt, formatPercent } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";

function share(part: number, total: number) {
  return total ? (part / total) * 100 : null;
}

export function StatusKpis({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      label: "Commandes totales",
      value: metrics.orderCount,
      percent: metrics.orderCount ? 100 : null,
      bar: "bg-chic-forest-deep",
      soft: "bg-chic-mint",
    },
    {
      label: "Livré",
      value: metrics.deliveredCount,
      percent: share(metrics.deliveredCount, metrics.orderCount),
      bar: "bg-emerald-600",
      soft: "bg-emerald-50",
    },
    {
      label: "En Livraison",
      value: metrics.inDeliveryCount,
      percent: share(metrics.inDeliveryCount, metrics.orderCount),
      bar: "bg-chic-gold",
      soft: "bg-[#fbf7ec]",
    },
    {
      label: "Retour",
      value: metrics.returnCount,
      percent: share(metrics.returnCount, metrics.orderCount),
      bar: "bg-rose-500",
      soft: "bg-rose-50",
    },
    {
      label: "Injoignable",
      value: metrics.unreachableCount,
      percent: share(metrics.unreachableCount, metrics.orderCount),
      bar: "bg-orange-500",
      soft: "bg-orange-50",
    },
    {
      label: "Reporter",
      value: metrics.reporterCount,
      percent: share(metrics.reporterCount, metrics.orderCount),
      bar: "bg-amber-600",
      soft: "bg-amber-50",
    },
  ];

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-chic-forest-deep">Statuts commandes</h2>
          <p className="text-xs text-chic-muted">
            Valeurs alignées sur Google Sheets · exactes
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card, index) => (
          <article
            key={card.label}
            className={`card animate-fade-up p-4 ${card.soft}`}
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <p className="text-[11px] font-semibold tracking-[0.14em] text-chic-muted uppercase">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-bold tabular text-chic-forest-deep">
              <AnimatedNumber value={card.value} format={formatInt} />
            </p>
            <p className="mt-2 text-xs font-medium text-chic-muted">
              {formatPercent(card.percent)} du total
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/80">
              <div
                className={`kpi-bar h-full rounded-full ${card.bar}`}
                style={{ width: `${Math.min(100, card.percent ?? 0)}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
