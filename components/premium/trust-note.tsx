"use client";

import { usePremium } from "@/components/premium/premium-provider";

export function TrustNote() {
  const { contact, loaded } = usePremium();

  return (
    <section className="card border-chic-emerald/20 bg-chic-mint/30 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.16em] text-chic-emerald">Activation</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight">
            Paiement simple et accompagné
          </h2>
          <p className="mt-2 text-sm text-chic-muted">
            Nous ne demandons aucune information bancaire dans l’application. Après avoir choisi
            votre offre, contactez notre équipe via WhatsApp ou Email pour finaliser l’activation.
          </p>
        </div>
        <dl className="grid gap-2 text-sm">
          <div className="rounded-xl border border-chic-line bg-white px-3.5 py-2">
            <dt className="text-[10px] uppercase tracking-[0.14em] text-chic-muted">WhatsApp</dt>
            <dd className="mt-0.5 tabular-nums">{loaded ? contact.whatsappNumber : "…"}</dd>
          </div>
          <div className="rounded-xl border border-chic-line bg-white px-3.5 py-2">
            <dt className="text-[10px] uppercase tracking-[0.14em] text-chic-muted">Email</dt>
            <dd className="mt-0.5 break-all">{loaded ? contact.email : "…"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
