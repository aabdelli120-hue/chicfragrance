"use client";

import { FEATURES } from "@/lib/features";
import { PLANS, type PlanId } from "@/lib/plans";
import { comparisonValue } from "@/lib/entitlements";
import { formatDzd } from "@/lib/format";

export function PricingSection() {
  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`relative overflow-hidden rounded-[28px] border bg-white p-6 text-foreground transition hover:-translate-y-1 ${
              plan.recommended
                ? "border-chic-gold shadow-[0_20px_60px_rgba(201,162,39,0.18)]"
                : "border-white/20"
            }`}
          >
            {plan.badge ? (
              <p className="absolute right-4 top-4 rounded-full bg-chic-gold px-3 py-1 text-[10px] font-semibold tracking-wide text-chic-forest-deep">
                {plan.badge}
              </p>
            ) : null}
            <p className="text-xs uppercase tracking-[0.18em] text-chic-gold">{plan.name}</p>
            <p className="mt-4 font-serif text-4xl text-chic-forest">
              {formatDzd(plan.price)}
              <span className="ml-1 text-sm font-sans text-chic-muted">/ mois</span>
            </p>
            <p className="mt-3 text-sm text-chic-muted">{plan.description}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
              {plan.comingSoon?.map((feature) => (
                <li key={feature} className="text-chic-muted">
                  {feature}{" "}
                  <span className="rounded-full bg-chic-cream px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    Bientôt
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold ${
                plan.recommended
                  ? "bg-chic-gold text-chic-forest-deep"
                  : "bg-chic-forest text-white"
              }`}
            >
              Bientôt disponible
            </button>
          </article>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-3xl text-white">Comparez les fonctionnalités</h2>
        <div className="mt-6 hidden overflow-hidden rounded-[24px] bg-white md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-chic-line text-xs uppercase tracking-wide text-chic-muted">
                <th className="px-5 py-4 font-medium">Fonctionnalité</th>
                {PLANS.map((plan) => (
                  <th key={plan.id} className="px-5 py-4 font-medium">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.id} className="border-b border-chic-line/70">
                  <td className="px-5 py-3">{feature.label}</td>
                  {PLANS.map((plan) => (
                    <td key={plan.id} className="px-5 py-3">
                      {mark(comparisonValue(plan.id, feature.id))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-3 md:hidden">
          {FEATURES.map((feature) => (
            <details key={feature.id} className="rounded-2xl bg-white p-4">
              <summary className="cursor-pointer font-medium">{feature.label}</summary>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                {PLANS.map((plan) => (
                  <div key={plan.id}>
                    <p className="text-chic-muted">{plan.name}</p>
                    <p className="mt-1">{mark(comparisonValue(plan.id as PlanId, feature.id))}</p>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function mark(value: "yes" | "no" | "soon") {
  if (value === "yes") return "✓";
  if (value === "soon") return "Bientôt";
  return "—";
}
