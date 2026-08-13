import { formatDzd, formatMultiplier, formatPercent } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";
import { CANONICAL_STATUSES, toUiLabel } from "@/lib/status";
import { STATUS_BAR_COLORS } from "@/lib/status-styles";

export function RightPanels({ metrics }: { metrics: DashboardMetrics }) {
  const adShare = metrics.adSpend > 0 ? 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <article className="card p-5">
        <h2 className="font-serif text-xl">Taux de livraison</h2>
        <div className="mt-5 flex items-center gap-5">
          <DeliveryRing percent={metrics.deliveryRate} />
          <div>
            <p className="font-serif text-3xl">{formatPercent(metrics.deliveryRate)}</p>
            <p className="mt-1 text-sm text-chic-muted">
              {metrics.deliveredCount} commande{metrics.deliveredCount > 1 ? "s" : ""} livrée
              {metrics.deliveredCount > 1 ? "s" : ""} sur {metrics.orderCount}
            </p>
          </div>
        </div>
      </article>

      <article className="card p-5">
        <h2 className="font-serif text-xl">Répartition des dépenses</h2>
        <div className="mt-5 flex items-center gap-5">
          <div
            className="relative h-28 w-28 rounded-full"
            style={{
              background: `conic-gradient(#1b6e4e 0 ${adShare}%, #e5e7eb ${adShare}% 100%)`,
            }}
          >
            <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-center text-xs font-semibold">
              {formatDzd(metrics.adSpend)}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p>Publicité · {adShare}%</p>
            <p className="text-chic-muted">Net après publicité · {formatDzd(metrics.netAfterAds)}</p>
          </div>
        </div>
      </article>

      <article className="card p-5">
        <h2 className="font-serif text-xl">Performance publicitaire</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Metric label="CPA réel" value={formatDzd(metrics.cpaReel)} />
          <Metric label="Coût par livraison" value={formatDzd(metrics.costPerDelivery)} />
          <Metric label="ROAS" value={formatMultiplier(metrics.roas)} />
          <Metric label="Taux de livraison" value={formatPercent(metrics.deliveryRate)} />
        </div>
      </article>

      <article className="card p-5">
        <h2 className="font-serif text-xl">Commandes par statut</h2>
        <div className="mt-4 space-y-3">
          {CANONICAL_STATUSES.map((status) => {
            const count = metrics.statusCounts[status] ?? 0;
            const percent = metrics.orderCount ? (count / metrics.orderCount) * 100 : 0;
            return (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{toUiLabel(status)}</span>
                  <span className="text-chic-muted">
                    {count} · {percent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-chic-line">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${percent}%`,
                      background: STATUS_BAR_COLORS[status],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </article>

      <article className="card flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-chic-muted">Encaissés</p>
          <p className="mt-2 font-serif text-3xl">{formatDzd(metrics.collected)}</p>
          <p className="mt-1 text-xs text-chic-muted">Commandes livrées uniquement</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chic-cream text-chic-forest">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
      </article>
    </div>
  );
}

function DeliveryRing({ percent }: { percent: number | null }) {
  const value = percent ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <svg width="108" height="108" viewBox="0 0 108 108" className="shrink-0">
      <circle cx="54" cy="54" r={radius} fill="none" stroke="#e2e8e4" strokeWidth="8" />
      <circle
        cx="54"
        cy="54"
        r={radius}
        fill="none"
        stroke="#1b6e4e"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 54 54)"
        className="progress-ring"
      />
    </svg>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-chic-cream/70 p-3">
      <p className="text-xs text-chic-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
