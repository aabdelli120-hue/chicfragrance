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
      hint: "Toutes les commandes de la période",
      icon: "orders",
      className: "bg-white",
    },
    {
      label: "Livrées",
      value: metrics.deliveredCount,
      percent: share(metrics.deliveredCount, metrics.orderCount),
      hint: "du total",
      icon: "done",
      className: "bg-[#f3faf6] lg:col-span-1",
      featured: true,
    },
    {
      label: "En livraison",
      value: metrics.inDeliveryCount,
      percent: share(metrics.inDeliveryCount, metrics.orderCount),
      hint: "du total",
      icon: "truck",
      className: "bg-[#fbf7ec]",
    },
    {
      label: "Retours",
      value: metrics.returnCount,
      percent: share(metrics.returnCount, metrics.orderCount),
      hint: "du total",
      icon: "return",
      className: "bg-[#fdf4f3]",
    },
    {
      label: "Injoignables",
      value: metrics.unreachableCount,
      percent: share(metrics.unreachableCount, metrics.orderCount),
      hint: "du total",
      icon: "phone",
      className: "bg-[#f8f3ec]",
    },
    {
      label: "Reportées",
      value: metrics.reporterCount,
      percent: share(metrics.reporterCount, metrics.orderCount),
      hint: "du total",
      icon: "later",
      className: "bg-[#f4f6f8]",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className={`card animate-fade-up p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.className}`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] uppercase tracking-wide text-chic-muted">{card.label}</p>
            <StatusIcon name={card.icon} />
          </div>
          <p className={`mt-3 font-serif ${card.featured ? "text-4xl text-chic-forest" : "text-2xl"}`}>
            <AnimatedNumber value={card.value} format={formatInt} />
          </p>
          <p className="mt-2 text-xs text-chic-muted">
            {formatPercent(card.percent)} {card.hint}
          </p>
        </article>
      ))}
    </section>
  );
}

function StatusIcon({ name }: { name: string }) {
  const common = "text-chic-forest/70";
  return (
    <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-white/70 ${common}`}>
      {name === "done" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : name === "truck" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 7h11v10H3V7Zm11 3h4l3 3v4h-7V10Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ) : name === "return" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M7 7H4v3M4 10c2-4 11-6 16 1M17 17h3v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : name === "phone" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M8 5h8v14H8V5Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ) : name === "later" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )}
    </span>
  );
}
