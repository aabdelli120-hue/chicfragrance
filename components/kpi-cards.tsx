import { formatDzd, formatPercent } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";

export function KpiCards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      label: "Chiffre d'affaires",
      value: formatDzd(metrics.collected),
      hint: "Commandes livrées / encaissés",
      tone: "text-chic-emerald",
    },
    {
      label: "Commandes",
      value: String(metrics.orderCount),
      hint: "Total commandes",
      tone: "text-foreground",
    },
    {
      label: "Livrées",
      value: String(metrics.deliveredCount),
      hint: `${formatPercent(metrics.deliveryRate)} de taux de livraison`,
      tone: "text-emerald-700",
    },
    {
      label: "En livraison",
      value: String(metrics.inDeliveryCount),
      hint: "En cours",
      tone: "text-amber-700",
    },
    {
      label: "Retours",
      value: String(metrics.returnCount),
      hint: `${formatPercent(metrics.returnRate)} des commandes`,
      tone: "text-red-600",
    },
    {
      label: "Dépenses (Ads)",
      value: formatDzd(metrics.adSpend),
      hint: "Spend Dz sur la période",
      tone: "text-foreground",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <article key={card.label} className="card p-4">
          <p className="text-xs uppercase tracking-wide text-chic-muted">{card.label}</p>
          <p className={`mt-3 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
          <p className="mt-2 text-xs text-chic-muted">{card.hint}</p>
        </article>
      ))}
    </section>
  );
}
