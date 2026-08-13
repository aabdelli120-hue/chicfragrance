function points(values: number[], width: number, height: number, padding = 2) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  return values.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - ((value - min) / span) * (height - padding * 2);
    return { x, y };
  });
}

export function Sparkline({
  values,
  tone = "emerald",
}: {
  values: number[];
  tone?: "emerald" | "gold";
}) {
  const width = 120;
  const height = 36;
  const coords = points(values, width, height);
  const line = coords.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const area = `${line} ${width - 2},${height} 2,${height}`;
  const color = tone === "gold" ? "var(--chic-gold)" : "var(--chic-emerald)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-9 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={area} fill={color} opacity="0.1" />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MiniBars({
  values,
  tone = "emerald",
}: {
  values: number[];
  tone?: "emerald" | "gold";
}) {
  const max = Math.max(...values) || 1;
  const color = tone === "gold" ? "bg-chic-gold/70" : "bg-chic-emerald/70";

  return (
    <div className="flex h-9 items-end gap-1" aria-hidden="true">
      {values.map((value, index) => (
        <span
          key={index}
          className={`flex-1 rounded-sm ${color}`}
          style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function MiniGauge({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex items-center gap-2.5">
      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
        <circle cx="19" cy="19" r={radius} fill="none" stroke="var(--chic-line)" strokeWidth="4" />
        <circle
          cx="19"
          cy="19"
          r={radius}
          fill="none"
          stroke="var(--chic-emerald)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 19 19)"
          className="progress-ring"
        />
      </svg>
      <div>
        <p className="text-sm font-semibold tabular-nums">{clamped}%</p>
        <p className="text-[10px] uppercase tracking-[0.12em] text-chic-muted">{label}</p>
      </div>
    </div>
  );
}
