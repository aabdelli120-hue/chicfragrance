"use client";

import { formatDzd, formatPercent } from "@/lib/format";
import type { DashboardComparison, DashboardMetrics } from "@/lib/metrics";

function Trend({ change }: { change: number | null }) {
  if (change === null) {
    return <span className="text-[11px] text-chic-muted">— vs période préc.</span>;
  }
  const up = change >= 0;
  return (
    <span className={`text-[11px] font-medium ${up ? "text-emerald-700" : "text-red-600"}`}>
      {up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function KpiCards({
  metrics,
  deltas,
  rangeLabel,
}: {
  metrics: DashboardMetrics;
  deltas?: DashboardComparison;
  rangeLabel: string;
}) {
  const modules = [
    {
      label: "Commandes",
      value: String(metrics.orderCount),
      hint: "Total sur la période",
      change: deltas?.orderCount.change ?? null,
      className: "bg-white",
    },
    {
      label: "Livrées",
      value: String(metrics.deliveredCount),
      hint: formatPercent(metrics.deliveryRate),
      change: deltas?.deliveredCount.change ?? null,
      className: "bg-[#f3faf6]",
    },
    {
      label: "En livraison",
      value: String(metrics.inDeliveryCount),
      hint: "En cours",
      change: deltas?.inDeliveryCount.change ?? null,
      className: "bg-[#fbf7ec]",
    },
    {
      label: "Retours",
      value: String(metrics.returnCount),
      hint: formatPercent(metrics.returnRate),
      change: deltas?.returnCount.change ?? null,
      className: "bg-[#fdf4f3]",
    },
    {
      label: "Injoignables",
      value: String(metrics.unreachableCount),
      hint: `${metrics.reporterCount} reportée${metrics.reporterCount > 1 ? "s" : ""}`,
      change: deltas?.unreachableCount.change ?? null,
      className: "bg-[#f8f3ec]",
    },
    {
      label: "Dépenses Ads",
      value: formatDzd(metrics.adSpend),
      hint: "Spend Dz",
      change: deltas?.adSpend.change ?? null,
      className: "bg-chic-cream/80",
    },
  ];

  return (
    <section className="space-y-4">
      <article className="card relative overflow-hidden p-6 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-chic-emerald/10" />
        <div className="pointer-events-none absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-chic-gold/50 to-transparent" />
        <p className="text-xs uppercase tracking-[0.18em] text-chic-muted">Chiffre d&apos;affaires</p>
        <p className="mt-3 font-serif text-4xl tracking-tight text-chic-forest lg:text-5xl">
          {formatDzd(metrics.collected)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <Trend change={deltas?.revenue.change ?? null} />
          <span className="text-chic-muted">{rangeLabel}</span>
        </div>
        <p className="mt-2 text-xs text-chic-muted">
          Encaissés = somme des totaux des commandes livrées uniquement.
        </p>
      </article>

      <div className="flex gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible">
        {modules.map((item) => (
          <article
            key={item.label}
            className={`card min-w-[160px] flex-1 p-4 transition hover:-translate-y-0.5 hover:shadow-md ${item.className}`}
          >
            <p className="text-[11px] uppercase tracking-wide text-chic-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
            <div className="mt-2 flex flex-col gap-1">
              <Trend change={item.change} />
              <p className="text-xs text-chic-muted">{item.hint}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
