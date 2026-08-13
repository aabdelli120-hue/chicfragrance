"use client";

import { useToast } from "@/components/toast-provider";
import { formatDzd } from "@/lib/format";
import { PLANS } from "@/lib/plans";

export function PricingSection() {
  const { notify } = useToast();

  return (
    <section id="plans">
      <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Plans</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">Choisissez le niveau d’outils</h2>
      <p className="mt-1 text-sm text-chic-muted">
        Paiement bientôt disponible. Aucun abonnement n’est facturé pour le moment.
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`card relative p-5 transition duration-300 ${
              plan.recommended
                ? "border-chic-emerald/40 ring-1 ring-chic-emerald/15 lg:-translate-y-1"
                : ""
            }`}
          >
            {plan.badge ? (
              <p
                className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase ${
                  plan.recommended
                    ? "bg-chic-emerald text-white"
                    : "border border-chic-gold/40 bg-chic-gold/10 text-chic-gold"
                }`}
              >
                {plan.badge}
              </p>
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chic-muted">
              {plan.name}
            </p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
              {formatDzd(plan.price)}
              <span className="ml-1 text-sm font-normal text-chic-muted">/ mois</span>
            </p>
            <p className="mt-2 text-sm text-chic-muted">{plan.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {plan.capabilities.map((item) => (
                <div key={item.label} className="rounded-lg bg-chic-cream/80 px-2 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-chic-muted">{item.label}</p>
                  <p className="text-xs font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 space-y-1.5 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-chic-emerald">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
              {plan.comingSoon?.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-chic-muted">
                  <span>—</span>
                  <span>{feature}</span>
                  <span className="rounded-full bg-chic-cream px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    Bientôt
                  </span>
                </li>
              ))}
            </ul>
            {plan.id === "ELITE" ? (
              <div className="mt-3 rounded-lg border border-dashed border-chic-line px-3 py-2 text-xs text-chic-muted">
                Store Builder · Bientôt disponible
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => notify("success", "Le paiement sera bientôt disponible.")}
              className={`mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-300 ${
                plan.recommended
                  ? "bg-chic-emerald text-white hover:bg-chic-forest"
                  : "bg-chic-forest text-white hover:bg-chic-forest-deep"
              }`}
            >
              {plan.cta}
            </button>
            <p className="mt-2 text-center text-[11px] text-chic-muted">Bientôt disponible</p>
          </article>
        ))}
      </div>
    </section>
  );
}
