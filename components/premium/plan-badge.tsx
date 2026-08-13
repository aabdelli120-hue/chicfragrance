export function PlanBadge({
  plan,
  className = "",
}: {
  plan: "ESSENTIAL" | "PRO" | "ELITE" | string;
  className?: string;
}) {
  const elite = plan === "ELITE";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] ${
        elite
          ? "border border-chic-gold/40 bg-chic-gold/12 text-chic-gold"
          : plan === "PRO"
            ? "border border-chic-emerald/25 bg-chic-mint text-chic-emerald"
            : "border border-chic-line bg-white text-chic-muted"
      } ${className}`}
    >
      {plan}
    </span>
  );
}

export function ComingSoonNote({ plan = "PRO" }: { plan?: "PRO" | "ELITE" }) {
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-chic-muted">
      <PlanBadge plan={plan} />
      <span>Bientôt disponible</span>
    </div>
  );
}

export function StatusDot({
  tone = "ok",
}: {
  tone?: "ok" | "warn" | "idle" | "gold";
}) {
  const color =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : tone === "gold"
          ? "bg-chic-gold"
          : "bg-chic-muted/50";
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      {tone === "ok" ? (
        <span className={`absolute inset-0 rounded-full ${color} status-pulse`} />
      ) : null}
      <span className={`relative h-1.5 w-1.5 rounded-full ${color}`} />
    </span>
  );
}
