import { PLAN_DISPLAY_NAME, type PlanId } from "@/lib/plans";

function labelFor(plan: PlanId | string): string {
  return plan in PLAN_DISPLAY_NAME ? PLAN_DISPLAY_NAME[plan as PlanId] : plan;
}

export function PlanBadge({
  plan,
  className = "",
}: {
  plan: PlanId | string;
  className?: string;
}) {
  const tone =
    plan === "ELITE"
      ? "border-chic-gold/45 bg-chic-gold/12 text-chic-gold"
      : plan === "PRO"
        ? "border-chic-emerald/25 bg-chic-mint text-chic-emerald"
        : "border-chic-line bg-white text-chic-muted";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] ${tone} ${className}`}
    >
      {labelFor(plan)}
    </span>
  );
}

export function ComingSoonNote({ plan = "PRO" }: { plan?: PlanId }) {
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
