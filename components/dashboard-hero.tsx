"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { formatDzd, formatInt, formatPercent } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";

function share(part: number, total: number) {
  return total ? (part / total) * 100 : null;
}

/** Emerald delivery performance hero — primary dashboard block. */
export function DeliveryStage({
  metrics,
  dateControl,
}: {
  metrics: DashboardMetrics;
  dateControl?: React.ReactNode;
}) {
  return (
    <article className="delivery-hero relative overflow-hidden rounded-[24px] p-5 text-white lg:p-7">
      <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-chic-gold/10 blur-2xl" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
            Performance livraison
          </p>
          <p className="mt-1 text-sm text-white/70">
            Période sélectionnée · synchronisée avec Google Sheets
          </p>
        </div>
        {dateControl}
      </div>

      <div className="relative z-10 mt-6 grid items-center gap-6 lg:grid-cols-[1.05fr_auto_0.95fr]">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-white/55 uppercase">
            Livré
          </p>
          <p className="mt-2 text-6xl font-bold leading-none tabular lg:text-7xl">
            <AnimatedNumber value={metrics.deliveredCount} format={formatInt} />
          </p>
          <p className="mt-3 text-sm text-white/70">
            Commandes livrées · encaissés{" "}
            <span className="font-semibold tabular text-white">
              {formatDzd(metrics.collected)}
            </span>
          </p>
        </div>

        <DeliveryRing
          percent={metrics.deliveryRate}
          delivered={metrics.deliveredCount}
          total={metrics.orderCount}
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <MiniStat
            label="En Livraison"
            value={metrics.inDeliveryCount}
            percent={share(metrics.inDeliveryCount, metrics.orderCount)}
          />
          <MiniStat
            label="Retour"
            value={metrics.returnCount}
            percent={share(metrics.returnCount, metrics.orderCount)}
            tone="rose"
          />
        </div>
      </div>
    </article>
  );
}

function MiniStat({
  label,
  value,
  percent,
  tone = "gold",
}: {
  label: string;
  value: number;
  percent: number | null;
  tone?: "gold" | "rose";
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        tone === "gold"
          ? "border-white/10 bg-white/8"
          : "border-rose-200/20 bg-rose-500/10"
      }`}
    >
      <p className="text-[11px] font-medium tracking-wide text-white/55 uppercase">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular">
        <AnimatedNumber value={value} format={formatInt} />
      </p>
      <p className="mt-1 text-xs text-white/55">{formatPercent(percent)}</p>
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
  const offset =
    circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 188 188" className="rotate-[-90deg]">
        <circle
          cx="94"
          cy="94"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="12"
        />
        <circle
          cx="94"
          cy="94"
          r={radius}
          fill="none"
          stroke="#C8A95A"
          strokeWidth="2.5"
          opacity="0.45"
        />
        <circle
          cx="94"
          cy="94"
          r={radius}
          fill="none"
          stroke="#E6F0EB"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-4xl font-bold tabular">
          <AnimatedNumber
            value={value}
            format={(current) => (percent === null ? "—" : `${current.toFixed(1)}%`)}
          />
        </p>
        <p className="mt-1 text-[11px] leading-4 text-white/65">
          Taux de livraison
          <br />
          <span className="tabular">
            {delivered} / {total}
          </span>
        </p>
      </div>
    </div>
  );
}

/** Kept for compatibility — dashboard no longer uses the silk hero strip. */
export function HeroStrip({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Commandes", value: metrics.orderCount },
        { label: "Livré", value: metrics.deliveredCount },
        { label: "En Livraison", value: metrics.inDeliveryCount },
        { label: "Retour", value: metrics.returnCount },
      ].map((item) => (
        <div key={item.label} className="rounded-2xl border border-chic-line bg-white p-4">
          <p className="text-[11px] text-chic-muted uppercase">{item.label}</p>
          <p className="mt-1 text-2xl font-bold tabular">
            <AnimatedNumber value={item.value} format={formatInt} />
          </p>
        </div>
      ))}
    </div>
  );
}
