"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { formatDzd, formatInt, formatPercent } from "@/lib/format";
import type { DashboardComparison, DashboardMetrics } from "@/lib/metrics";

function share(part: number, total: number) {
  return total ? (part / total) * 100 : null;
}

export function HeroStrip({
  metrics,
  deltas,
}: {
  metrics: DashboardMetrics;
  deltas?: DashboardComparison;
}) {
  const items = [
    {
      label: "Chiffre d'affaires",
      value: metrics.collected,
      format: formatDzd,
      hint: deltas?.revenue.change ?? null,
      spark: true,
    },
    {
      label: "Commandes",
      value: metrics.orderCount,
      format: formatInt,
      hint: "100% du total",
    },
    {
      label: "Livrées",
      value: metrics.deliveredCount,
      format: formatInt,
      hint: formatPercent(share(metrics.deliveredCount, metrics.orderCount)),
    },
    {
      label: "En livraison",
      value: metrics.inDeliveryCount,
      format: formatInt,
      hint: formatPercent(share(metrics.inDeliveryCount, metrics.orderCount)),
    },
    {
      label: "Retours",
      value: metrics.returnCount,
      format: formatInt,
      hint: formatPercent(share(metrics.returnCount, metrics.orderCount)),
    },
  ];

  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item, index) => (
        <article
          key={item.label}
          className="glass-kpi animate-fade-up relative overflow-hidden rounded-2xl p-4"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">{item.label}</p>
          <p className="mt-2 font-serif text-2xl text-white lg:text-[28px]">
            <AnimatedNumber value={item.value} format={item.format} />
          </p>
          <p className="mt-2 text-[11px] text-white/65">
            {typeof item.hint === "number" ? (
              <span className={item.hint >= 0 ? "text-emerald-200" : "text-red-200"}>
                {item.hint >= 0 ? "+" : ""}
                {item.hint.toFixed(1)}% vs période préc.
              </span>
            ) : (
              item.hint
            )}
          </p>
          {item.spark ? <Sparkline series={metrics.dailySeries.map((point) => point.collected)} /> : null}
        </article>
      ))}
    </div>
  );
}

export function DeliveryStage({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <article className="card relative overflow-hidden p-5 lg:p-7">
      <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-chic-emerald/8" />
      <p className="text-[11px] uppercase tracking-[0.18em] text-chic-muted">Performance livraison</p>
      <div className="mt-5 grid items-center gap-6 lg:grid-cols-[1.1fr_auto_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-chic-muted">Livrées</p>
          <p className="mt-2 font-serif text-6xl leading-none text-chic-forest lg:text-7xl">
            <AnimatedNumber value={metrics.deliveredCount} format={formatInt} />
          </p>
          <p className="mt-3 text-sm text-chic-muted">
            Commandes livrées uniquement · encaissés {formatDzd(metrics.collected)}
          </p>
        </div>

        <DeliveryRing
          percent={metrics.deliveryRate}
          delivered={metrics.deliveredCount}
          total={metrics.orderCount}
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <MiniStat
            label="En livraison"
            value={metrics.inDeliveryCount}
            tone="gold"
          />
          <MiniStat label="Retours" value={metrics.returnCount} tone="rose" />
        </div>
      </div>
    </article>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gold" | "rose";
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${
        tone === "gold" ? "bg-[#fbf6e8]" : "bg-[#fdf4f3]"
      }`}
    >
      <p className="text-[11px] uppercase tracking-wide text-chic-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl">
        <AnimatedNumber value={value} format={formatInt} />
      </p>
    </div>
  );
}

export function DeliveryRing({
  percent,
  delivered,
  total,
  size = 188,
}: {
  percent: number | null;
  delivered: number;
  total: number;
  size?: number;
}) {
  const value = percent ?? 0;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 188 188" className="rotate-[-90deg]">
        <circle cx="94" cy="94" r={radius} fill="none" stroke="#e7f0ea" strokeWidth="12" />
        <circle
          cx="94"
          cy="94"
          r={radius}
          fill="none"
          stroke="url(#deliveryGold)"
          strokeWidth="3"
          opacity="0.35"
        />
        <circle
          cx="94"
          cy="94"
          r={radius}
          fill="none"
          stroke="#1b6e4e"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring"
        />
        <defs>
          <linearGradient id="deliveryGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#1b6e4e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-serif text-4xl text-chic-forest">
          <AnimatedNumber
            value={value}
            format={(current) => (percent === null ? "—" : `${current.toFixed(1)}%`)}
          />
        </p>
        <p className="mt-1 text-[11px] leading-4 text-chic-muted">
          {delivered} / {total}
          <br />
          commandes livrées
        </p>
      </div>
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  if (series.length < 2) return null;
  const max = Math.max(1, ...series);
  const width = 140;
  const height = 28;
  const d = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute bottom-2 right-3 h-7 w-24 opacity-70"
    >
      <path d={d} fill="none" stroke="#9fe0bf" strokeWidth="1.6" />
    </svg>
  );
}
