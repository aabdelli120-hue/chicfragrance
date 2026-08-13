"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { LandingPage } from "@/lib/platform/types";

const OBJECTIVES = ["Conversion", "Lead generation", "Product launch", "Promotion"];
const ANGLES = ["Offre", "Urgence", "Problème / Solution", "Premium", "Social proof", "Prix"];

export default function LandingPagesStudioPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-chic-muted">Module · Landing Page Studio</p>
            <h1 className="mt-2 font-serif text-4xl">Landing Page Studio</h1>
            <p className="mt-2 max-w-2xl text-sm text-chic-muted">
              Créez, éditez et publiez des pages de vente rattachées à votre organisation.
            </p>
          </div>
        </div>
        <LandingStudio />
      </main>
    </AppShell>
  );
}

function LandingStudio() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    productName: "",
    productDescription: "",
    price: "",
    offer: "",
    objective: OBJECTIVES[0],
    angle: ANGLES[0],
    cta: "Commander maintenant",
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/landing-pages", { cache: "no-store" });
      const data = await res.json();
      if (cancelled) return;
      if (res.ok) setPages(data.pages || []);
      else setError(data.error || "Impossible de charger les landing pages.");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const drafts = useMemo(() => pages.filter((p) => p.status === "DRAFT"), [pages]);
  const published = useMemo(() => pages.filter((p) => p.status === "PUBLISHED"), [pages]);

  async function reload() {
    const res = await fetch("/api/landing-pages", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setPages(data.pages || []);
    else setError(data.error || "Impossible de charger les landing pages.");
  }

  async function createPage(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name || form.productName || "Nouvelle landing",
        objective: form.objective,
        angle: form.angle,
        generate: true,
        productName: form.productName || form.name,
        productDescription: form.productDescription,
        price: form.price,
        offer: form.offer,
        cta: form.cta,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Création impossible.");
      return;
    }
    setCreating(false);
    setStep(0);
    await reload();
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total" value={pages.length} />
        <Stat label="Brouillons" value={drafts.length} />
        <Stat label="Publiées" value={published.length} />
        <Stat label="Performance" value="—" />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white"
        >
          + Nouvelle landing page
        </button>
      </div>

      {creating ? (
        <form onSubmit={createPage} className="card space-y-4 p-5">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full ${n <= step + 1 ? "bg-chic-emerald" : "bg-chic-line"}`}
              />
            ))}
          </div>
          <p className="text-xs tracking-[0.16em] text-chic-muted">
            ÉTAPE {step + 1} —{" "}
            {["Produit", "Objectif", "Angle", "Générer"][step]}
          </p>

          {step === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nom de la page" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Produit" value={form.productName} onChange={(v) => setForm({ ...form, productName: v })} />
              <Field label="Prix" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
              <Field label="Offre" value={form.offer} onChange={(v) => setForm({ ...form, offer: v })} />
              <div className="sm:col-span-2">
                <Field
                  label="Description"
                  value={form.productDescription}
                  onChange={(v) => setForm({ ...form, productDescription: v })}
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="flex flex-wrap gap-2">
              {OBJECTIVES.map((o) => (
                <Chip
                  key={o}
                  active={form.objective === o}
                  label={o}
                  onClick={() => setForm({ ...form, objective: o })}
                />
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-wrap gap-2">
              {ANGLES.map((a) => (
                <Chip
                  key={a}
                  active={form.angle === a}
                  label={a}
                  onClick={() => setForm({ ...form, angle: a })}
                />
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <Field label="CTA" value={form.cta} onChange={(v) => setForm({ ...form, cta: v })} />
              <p className="text-sm text-chic-muted">
                La structure sera générée via `generateLandingPage()` (template tant qu’aucune clé AI
                n’est configurée).
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (step === 0 ? setCreating(false) : setStep((s) => s - 1))}
              className="rounded-xl border border-chic-line px-4 py-2 text-sm"
            >
              {step === 0 ? "Annuler" : "Retour"}
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-xl bg-chic-forest px-4 py-2 text-sm font-semibold text-white"
              >
                Continuer
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-xl bg-chic-forest px-4 py-2 text-sm font-semibold text-white"
              >
                Générer la structure
              </button>
            )}
          </div>
        </form>
      ) : null}

      <section className="card p-5">
        <h2 className="font-medium">Pages récentes</h2>
        <div className="mt-4 space-y-3">
          {pages.length === 0 ? (
            <p className="text-sm text-chic-muted">Aucune landing page pour le moment.</p>
          ) : (
            pages.map((page) => (
              <div
                key={page.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-chic-line px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{page.name}</p>
                  <p className="text-xs text-chic-muted">
                    /{page.slug} · {page.status}
                    {page.angle ? ` · ${page.angle}` : ""}
                  </p>
                </div>
                <Link
                  href={`/app/landing-pages/${page.id}`}
                  className="rounded-xl border border-chic-line px-3 py-1.5 text-xs font-medium"
                >
                  Éditer
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] tracking-[0.14em] text-chic-muted">{label.toUpperCase()}</p>
      <p className="mt-2 font-serif text-3xl text-chic-forest-deep">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-[10px] uppercase tracking-wide text-chic-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-chic-line px-3 py-2 text-sm"
      />
    </label>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm ${
        active
          ? "border-chic-emerald bg-chic-mint text-chic-forest"
          : "border-chic-line bg-white text-chic-muted"
      }`}
    >
      {label}
    </button>
  );
}
