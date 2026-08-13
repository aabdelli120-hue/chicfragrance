"use client";

import { formatPercent } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";
import { CANONICAL_STATUSES, toUiLabel } from "@/lib/status";
import { STATUS_BAR_COLORS } from "@/lib/status-styles";

export function OrderDonut({ metrics }: { metrics: DashboardMetrics }) {
  const slices = CANONICAL_STATUSES.map((status) => ({
    status,
    label: toUiLabel(status),
    count: metrics.statusCounts[status] ?? 0,
    color: STATUS_BAR_COLORS[status],
  }));
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <article className="card p-5">
      <h2 className="font-serif text-xl">Répartition des commandes</h2>
      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
        <svg width="168" height="168" viewBox="0 0 168 168" className="shrink-0">
          <circle cx="84" cy="84" r={radius} fill="none" stroke="#eef2f0" strokeWidth="18" />
          {total === 0 ? null : (
            slices.map((slice) => {
              const length = (slice.count / total) * circumference;
              const circle = (
                <circle
                  key={slice.status}
                  cx="84"
                  cy="84"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="18"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 84 84)"
                  className="progress-ring"
                />
              );
              offset += length;
              return circle;
            })
          )}
          <circle cx="84" cy="84" r="42" fill="white" />
          <text x="84" y="80" textAnchor="middle" fill="#134e3a" fontSize="18" fontFamily="Georgia, serif">
            {total}
          </text>
          <text x="84" y="98" textAnchor="middle" fill="#5d7269" fontSize="9">
            COMMANDES
          </text>
        </svg>
        <div className="w-full space-y-2.5 text-sm">
          {slices.map((slice) => (
            <div key={slice.status} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
                {slice.label}
              </span>
              <span className="text-chic-muted">
                {slice.count} · {formatPercent(total ? (slice.count / total) * 100 : null)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
