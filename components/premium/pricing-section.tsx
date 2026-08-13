"use client";

import { PlanCard } from "@/components/premium/plan-card";
import { usePremium } from "@/components/premium/premium-provider";

export function PricingSection() {
  const { plans, openAssistant } = usePremium();
  const tiers = plans.filter((plan) => plan.id !== "CUSTOM");

  return (
    <section id="plans" className="scroll-mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Plans</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Choisissez le niveau d’outils</h2>
          <p className="mt-1 max-w-2xl text-sm text-chic-muted">
            Une suite d’outils pour gérer, analyser, automatiser et développer votre activité e-commerce.
            Paiement bientôt disponible.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAssistant("recommendation")}
          className="rounded-xl border border-chic-line bg-white px-3.5 py-2 text-sm font-medium transition hover:border-chic-emerald/40 hover:bg-chic-mint/40"
        >
          Obtenir une recommandation
        </button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {tiers.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
