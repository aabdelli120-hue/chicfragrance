"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlanBadge } from "@/components/premium/plan-badge";
import {
  resolvePlans,
  type PlanOverride,
  type PremiumConfig,
} from "@/lib/premium-config";
import { AVAILABILITY_LABEL, PLANS, type OfferId, type PlanAvailability } from "@/lib/plans";

type Draft = Record<
  OfferId,
  {
    price: string;
    badge: string;
    availability: PlanAvailability;
    features: string;
  }
>;

const AVAILABILITY_OPTIONS: PlanAvailability[] = ["available", "partial", "coming-soon"];

function buildDraft(config: PremiumConfig): Draft {
  const resolved = resolvePlans(config);
  return resolved.reduce((draft, plan) => {
    draft[plan.id] = {
      price: plan.price === null ? "" : String(plan.price),
      badge: plan.badge ?? "",
      availability: plan.availability,
      features: plan.features.join("\n"),
    };
    return draft;
  }, {} as Draft);
}

export function PremiumSettings({
  config,
  saving,
  onSave,
}: {
  config: PremiumConfig;
  saving: boolean;
  onSave: (premium: PremiumConfig) => void;
}) {
  const [whatsappNumber, setWhatsappNumber] = useState(config.contact.whatsappNumber);
  const [email, setEmail] = useState(config.contact.email);
  const [draft, setDraft] = useState<Draft>(() => buildDraft(config));

  const defaults = useMemo(
    () => new Map(PLANS.map((plan) => [plan.id, plan] as const)),
    [],
  );

  function updatePlan(id: OfferId, patch: Partial<Draft[OfferId]>) {
    setDraft((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  function submit() {
    const plans: Partial<Record<OfferId, PlanOverride>> = {};

    for (const plan of PLANS) {
      const entry = draft[plan.id];
      const defaultPlan = defaults.get(plan.id);
      const features = entry.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const sameFeatures =
        defaultPlan !== undefined &&
        features.length === defaultPlan.features.length &&
        features.every((feature, index) => feature === defaultPlan.features[index]);
      const price = entry.price.trim() === "" ? null : Number(entry.price);

      plans[plan.id] = {
        price: Number.isFinite(price as number) ? price : null,
        badge: entry.badge.trim(),
        availability: entry.availability,
        // An empty list keeps the built-in feature list, so defaults keep flowing.
        features: sameFeatures ? [] : features,
      };
    }

    onSave({ contact: { whatsappNumber: whatsappNumber.trim(), email: email.trim() }, plans });
  }

  return (
    <section className="card p-6">
      <h2 className="font-serif text-2xl">Premium</h2>
      <p className="mt-2 text-sm text-chic-muted">
        Configuration commerciale et canaux de contact. Aucun identifiant Google n’est stocké ici:
        la clé privée et le compte de service restent côté serveur.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wide text-chic-muted">
            Numéro WhatsApp professionnel
          </span>
          <input
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(event.target.value)}
            placeholder="+213 770 00 00 00"
            inputMode="tel"
            className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wide text-chic-muted">
            Email professionnel
          </span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="contact@chicfragrance.dz"
            inputMode="email"
            className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-6 space-y-3">
        {PLANS.map((plan) => (
          <details
            key={plan.id}
            className="rounded-2xl border border-chic-line p-4"
            open={plan.id === "PRO"}
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm font-semibold">
              {plan.name}
              {draft[plan.id].badge ? <PlanBadge plan={draft[plan.id].badge} /> : null}
              <span className="text-xs font-normal text-chic-muted">
                {AVAILABILITY_LABEL[draft[plan.id].availability]}
              </span>
            </summary>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-chic-muted">
                  Prix mensuel (DZD)
                </span>
                <input
                  value={draft[plan.id].price}
                  onChange={(event) => updatePlan(plan.id, { price: event.target.value })}
                  placeholder="Vide = sur devis"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-chic-muted">Badge</span>
                <input
                  value={draft[plan.id].badge}
                  onChange={(event) => updatePlan(plan.id, { badge: event.target.value })}
                  placeholder="Aucun"
                  className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-chic-muted">
                  Disponibilité
                </span>
                <select
                  value={draft[plan.id].availability}
                  onChange={(event) =>
                    updatePlan(plan.id, {
                      availability: event.target.value as PlanAvailability,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-chic-line bg-white px-3 py-2"
                >
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {AVAILABILITY_LABEL[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm">
              <span className="text-xs uppercase tracking-wide text-chic-muted">
                Fonctionnalités (une par ligne)
              </span>
              <textarea
                value={draft[plan.id].features}
                onChange={(event) => updatePlan(plan.id, { features: event.target.value })}
                rows={6}
                className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2 font-mono text-xs"
              />
            </label>
          </details>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={submit}
          className="rounded-2xl bg-chic-forest px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          Enregistrer
        </button>
        <Link href="/premium" className="text-sm font-medium text-chic-emerald">
          Ouvrir Premium
        </Link>
      </div>

      <p className="mt-4 rounded-2xl bg-chic-cream p-4 text-sm text-chic-muted">
        Aucun paiement en ligne n’est activé. L’abonnement est confirmé manuellement par notre
        équipe après réception de la demande WhatsApp ou Email.
      </p>
    </section>
  );
}
