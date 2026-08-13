"use client";

import { useEffect, useMemo, useState } from "react";
import { PlanBadge } from "@/components/premium/plan-badge";
import { usePremium, usePremiumPlan } from "@/components/premium/premium-provider";
import { useToast } from "@/components/toast-provider";
import {
  SUBSCRIPTION_STEP_LABEL,
  SUBSCRIPTION_STEPS,
  buildWhatsappMessage,
  emptyActivationRequest,
  getActivationChannels,
  type ActivationRequest,
} from "@/lib/subscription-flow";
import { VOLUME_OPTIONS } from "@/lib/premium-assistant";

export function ActivationDialog() {
  const { activationPlan, closeActivation, contact, identity, subscription } = usePremium();
  const plan = usePremiumPlan(activationPlan);
  const { notify } = useToast();
  const [request, setRequest] = useState<ActivationRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [boundPlan, setBoundPlan] = useState<string | null>(null);

  if (activationPlan !== boundPlan) {
    setBoundPlan(activationPlan);
    setShowDetails(false);
    setRequest(
      activationPlan
        ? emptyActivationRequest(activationPlan, identity.ownerName, identity.storeName)
        : null,
    );
  }

  useEffect(() => {
    if (!activationPlan) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeActivation();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activationPlan, closeActivation]);

  const channels = useMemo(() => {
    if (!plan || !request) return [];
    return getActivationChannels(contact, plan, request);
  }, [contact, plan, request]);

  const preview = useMemo(() => {
    if (!plan || !request) return "";
    return buildWhatsappMessage(plan, request);
  }, [plan, request]);

  if (!activationPlan || !plan || !request) return null;

  const currentStep = subscription.status === "active" && subscription.plan === plan.id ? "active" : "contact";

  function update(patch: Partial<ActivationRequest>) {
    setRequest((current) => (current ? { ...current, ...patch } : current));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={closeActivation}
        className="absolute inset-0 bg-chic-ink/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activation-title"
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-chic-line bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">
              Étape · {SUBSCRIPTION_STEP_LABEL[currentStep]}
            </p>
            <h2 id="activation-title" className="mt-0.5 text-lg font-semibold tracking-tight">
              Demande d’activation
            </h2>
          </div>
          <button
            type="button"
            onClick={closeActivation}
            className="rounded-lg border border-chic-line px-2 py-1 text-sm text-chic-muted transition hover:bg-chic-cream"
          >
            Fermer
          </button>
        </header>

        <div className="px-5 pb-5 pt-4">
          <ol className="flex flex-wrap items-center gap-1.5">
            {SUBSCRIPTION_STEPS.map((step) => {
              const index = SUBSCRIPTION_STEPS.indexOf(step);
              const reached = index <= SUBSCRIPTION_STEPS.indexOf(currentStep);
              return (
                <li
                  key={step}
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                    reached
                      ? "bg-chic-mint text-chic-emerald"
                      : "border border-chic-line text-chic-muted"
                  }`}
                >
                  {SUBSCRIPTION_STEP_LABEL[step]}
                </li>
              );
            })}
          </ol>

          <dl className="mt-4 divide-y divide-chic-line/70 rounded-2xl border border-chic-line">
            <Row label="Offre sélectionnée">
              <span className="flex items-center gap-2 font-semibold">
                {plan.name}
                {plan.badge ? <PlanBadge plan={plan.badge} /> : null}
              </span>
            </Row>
            <Row label="Prix">
              <span className="font-semibold tabular-nums">
                {plan.priceLabel}
                {plan.periodLabel ? (
                  <span className="ml-1 font-normal text-chic-muted">{plan.periodLabel}</span>
                ) : null}
              </span>
            </Row>
            <Row label="Compte">{identity.ownerName || "—"}</Row>
            <Row label="Boutique">{identity.storeName || "—"}</Row>
            <Row label="Statut du module">{plan.statusLabel}</Row>
          </dl>

          <p className="mt-4 text-sm">
            Pour finaliser votre abonnement, contactez notre équipe.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {channels
              .filter((channel) => channel.id !== "payment")
              .map((channel) => (
                <a
                  key={channel.id}
                  href={channel.href ?? undefined}
                  target={channel.id === "whatsapp" ? "_blank" : undefined}
                  rel={channel.id === "whatsapp" ? "noopener noreferrer" : undefined}
                  onClick={(event) => {
                    if (!channel.enabled) {
                      event.preventDefault();
                      notify(
                        "error",
                        channel.id === "whatsapp"
                          ? "Numéro WhatsApp non configuré (Paramètres → Premium)."
                          : "Email professionnel non configuré (Paramètres → Premium).",
                      );
                      return;
                    }
                    notify("success", `Demande préparée · ${plan.name} · ${channel.label}`);
                  }}
                  className={`flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    channel.id === "whatsapp"
                      ? "bg-chic-emerald text-white hover:bg-chic-forest"
                      : "border border-chic-line bg-white hover:border-chic-emerald/40 hover:bg-chic-mint/40"
                  } ${channel.enabled ? "" : "opacity-60"}`}
                >
                  <span>{channel.label}</span>
                  <span
                    className={`text-[10px] font-normal ${
                      channel.id === "whatsapp" ? "text-white/70" : "text-chic-muted"
                    }`}
                  >
                    {channel.hint}
                  </span>
                </a>
              ))}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-dashed border-chic-line px-4 py-2.5">
            <p className="text-sm text-chic-muted">Paiement en ligne</p>
            <span className="rounded-full bg-chic-cream px-2 py-0.5 text-[10px] uppercase tracking-wide text-chic-muted">
              Bientôt disponible
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((value) => !value)}
            className="mt-4 text-sm font-medium text-chic-emerald"
          >
            {showDetails ? "Masquer les détails de la demande" : "Compléter la demande (optionnel)"}
          </button>

          {showDetails ? (
            <div className="mt-3 space-y-3 rounded-2xl border border-chic-line bg-chic-cream/40 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Nom"
                  value={request.ownerName}
                  onChange={(ownerName) => update({ ownerName })}
                />
                <Field
                  label="Téléphone"
                  value={request.phone}
                  inputMode="tel"
                  placeholder="0555 00 00 00"
                  onChange={(phone) => update({ phone })}
                />
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-chic-muted">Offre</span>
                  <input
                    value={plan.name}
                    readOnly
                    className="mt-1 w-full rounded-xl border border-chic-line bg-white/60 px-3 py-2 text-chic-muted"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-chic-muted">
                    Commandes / mois (optionnel)
                  </span>
                  <select
                    value={request.monthlyOrders}
                    onChange={(event) => update({ monthlyOrders: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-chic-line bg-white px-3 py-2"
                  >
                    <option value="">Non précisé</option>
                    {VOLUME_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-chic-muted">Message</span>
                <textarea
                  value={request.message}
                  onChange={(event) => update({ message: event.target.value })}
                  rows={3}
                  placeholder="Précisez votre activité ou vos besoins."
                  className="mt-1 w-full rounded-xl border border-chic-line bg-white px-3 py-2"
                />
              </label>
              <div>
                <p className="text-xs uppercase tracking-wide text-chic-muted">Aperçu du message</p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-chic-line bg-white px-3 py-2 text-xs text-chic-muted">
                  {preview}
                </pre>
              </div>
            </div>
          ) : null}

          <p className="mt-4 rounded-xl bg-chic-mint/50 px-4 py-3 text-xs text-chic-muted">
            Nous ne demandons aucune information bancaire dans l’application. Aucune donnée de
            paiement n’est enregistrée.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
      <dt className="text-chic-muted">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "tel" | "numeric";
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-chic-muted">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-chic-line bg-white px-3 py-2"
      />
    </label>
  );
}
