"use client";

import { useMemo, useState } from "react";
import { formatDzd } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index === 0 ? index : index - 1];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function PerformanceChart({ metrics }: { metrics: DashboardMetrics }) {
  const points = metrics.dailySeries;
  const width = 640;
  const height = 248;
  const padding = 32;
  const [hover, setHover] = useState<number | null>(null);

  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => [point.collected, point.spend, Math.abs(point.net)]),
  );

  const mapped = useMemo(
    () =>
      points.map((point, index) => ({
        ...point,
        x:
          padding +
          (points.length <= 1 ? (width - padding * 2) / 2 : (index / (points.length - 1)) * (width - padding * 2)),
        collectedY: height - padding - (Math.max(0, point.collected) / maxValue) * (height - padding * 2),
        spendY: height - padding - (Math.max(0, point.spend) / maxValue) * (height - padding * 2),
        netY: height - padding - (Math.max(0, point.net) / maxValue) * (height - padding * 2),
      })),
    [points, maxValue],
  );

  const collectedPath = smoothPath(mapped.map((point) => ({ x: point.x, y: point.collectedY })));
  const spendPath = smoothPath(mapped.map((point) => ({ x: point.x, y: point.spendY })));
  const netPath = smoothPath(mapped.map((point) => ({ x: point.x, y: point.netY })));
  const active = hover !== null ? mapped[hover] : null;

  return (
    <article className="card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl">Évolution des performances</h2>
          <p className="text-xs text-chic-muted">Encaissés, dépenses ads et net après publicité</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-chic-muted">
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-chic-emerald" /> Encaissés
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-[#c45b4a]" /> Dépenses Ads
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-chic-gold" /> Net après publicité
          </span>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-chic-muted">
          Pas encore de série à afficher.
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-56 w-full"
            onMouseLeave={() => setHover(null)}
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              const ratio = (event.clientX - bounds.left) / bounds.width;
              const index = Math.min(
                mapped.length - 1,
                Math.max(0, Math.round(ratio * (mapped.length - 1))),
              );
              setHover(index);
            }}
          >
            {[0.25, 0.5, 0.75, 1].map((step) => (
              <line
                key={step}
                x1={padding}
                x2={width - 12}
                y1={padding + (height - padding * 2) * (1 - step)}
                y2={padding + (height - padding * 2) * (1 - step)}
                stroke="#e8eeea"
                strokeWidth="1"
              />
            ))}
            <path d={collectedPath} fill="none" stroke="#1b6e4e" strokeWidth="2.4" className="flow-line" pathLength="1" />
            <path d={spendPath} fill="none" stroke="#c45b4a" strokeWidth="2" className="flow-line" pathLength="1" />
            <path d={netPath} fill="none" stroke="#c9a227" strokeWidth="2.2" className="flow-line" pathLength="1" />
            {mapped.map((point) => (
              <text
                key={point.date}
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#5d7269"
              >
                {point.date.slice(8)}/{point.date.slice(5, 7)}
              </text>
            ))}
            {active ? (
              <>
                <line
                  x1={active.x}
                  x2={active.x}
                  y1={padding}
                  y2={height - padding}
                  stroke="#c9a227"
                  strokeDasharray="3 3"
                />
                <circle cx={active.x} cy={active.collectedY} r="4" fill="#1b6e4e" />
                <circle cx={active.x} cy={active.spendY} r="4" fill="#c45b4a" />
                <circle cx={active.x} cy={active.netY} r="4" fill="#c9a227" />
              </>
            ) : null}
          </svg>
          {active ? (
            <div className="pointer-events-none absolute left-4 top-2 rounded-xl border border-chic-line bg-white/95 px-3 py-2 text-[11px] shadow-sm">
              <p className="font-medium">{active.date}</p>
              <p>Encaissés · {formatDzd(active.collected)}</p>
              <p>Dépenses · {formatDzd(active.spend)}</p>
              <p>Net · {formatDzd(active.net)}</p>
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}
