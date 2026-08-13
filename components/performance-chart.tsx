import type { DashboardMetrics } from "@/lib/metrics";

export function PerformanceChart({ metrics }: { metrics: DashboardMetrics }) {
  const points = metrics.dailySeries;
  const width = 640;
  const height = 240;
  const padding = 28;
  const maxValue = Math.max(
    1,
    ...points.flatMap((point) => [point.collected, point.spend, Math.abs(point.net)]),
  );

  const x = (index: number) =>
    padding + (points.length <= 1 ? width / 2 : (index / (points.length - 1)) * (width - padding * 2));
  const y = (value: number) =>
    height - padding - (value / maxValue) * (height - padding * 2);

  const toPath = (key: "collected" | "spend" | "net") =>
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(Math.max(0, point[key]))}`)
      .join(" ");

  return (
    <article className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl">Évolution des performances</h2>
          <p className="text-xs text-chic-muted">Encaissés, dépenses et net issus de COMMANDES / DEPENSES</p>
        </div>
        <div className="flex gap-3 text-[11px] text-chic-muted">
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-chic-emerald" /> Encaissés</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red-500" /> Dépenses</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-chic-gold" /> Net</span>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-chic-muted">
          Pas encore de série à afficher.
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
          <line x1={padding} y1={height - padding} x2={width - 10} y2={height - padding} stroke="#e2e8e4" />
          <path d={toPath("collected")} fill="none" stroke="#1b6e4e" strokeWidth="2.5" />
          <path d={toPath("spend")} fill="none" stroke="#dc2626" strokeWidth="2.5" />
          <path d={toPath("net")} fill="none" stroke="#c9a227" strokeWidth="2.5" />
          {points.map((point, index) => (
            <text
              key={point.date}
              x={x(index)}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#5d7269"
            >
              {point.date.slice(8)}/{point.date.slice(5, 7)}
            </text>
          ))}
        </svg>
      )}
    </article>
  );
}
