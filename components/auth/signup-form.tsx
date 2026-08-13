"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    storeName: "",
    currency: "DZD",
    country: "Algeria",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Inscription impossible.");
        return;
      }
      router.replace("/app/onboarding");
      router.refresh();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="mb-2 flex gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-chic-emerald" : "bg-chic-line"}`}
          />
        ))}
      </div>
      <p className="text-xs tracking-[0.16em] text-chic-muted">
        ÉTAPE {step} / 3
      </p>

      {step === 1 ? (
        <>
          <Field label="Votre nom" value={form.name} onChange={(v) => update("name", v)} required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
          <Field label="Téléphone" value={form.phone} onChange={(v) => update("phone", v)} />
          <Field
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            required
          />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Field
            label="Nom de la boutique"
            value={form.storeName}
            onChange={(v) => update("storeName", v)}
            required
            placeholder="Ex: Chic Fragrance"
          />
          <p className="text-xs text-chic-muted">
            Le logo pourra être ajouté dans les paramètres après création.
          </p>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <Field label="Devise" value={form.currency} onChange={(v) => update("currency", v)} required />
          <Field label="Pays" value={form.country} onChange={(v) => update("country", v)} required />
        </>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl border border-chic-line px-4 py-2.5 text-sm font-medium"
          >
            Retour
          </button>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Création…" : step < 3 ? "Continuer" : "Créer mon espace"}
        </button>
      </div>

      <p className="text-center text-sm text-chic-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-chic-emerald hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium tracking-wide text-chic-muted">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-chic-line bg-white px-3 py-2.5 text-sm outline-none focus:border-chic-emerald"
      />
    </div>
  );
}
