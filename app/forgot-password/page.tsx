"use client";

import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devPath, setDevPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setDevPath(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(
        "Si un compte existe pour cet email, un lien de réinitialisation a été préparé.",
      );
      if (data.devResetPath) setDevPath(data.devResetPath);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Mot de passe oublié" subtitle="Réinitialisation sécurisée — aucun mot de passe n'est affiché.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium tracking-wide text-chic-muted">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-chic-line bg-white px-3 py-2.5 text-sm outline-none focus:border-chic-emerald"
          />
        </div>
        {message ? (
          <p className="rounded-xl border border-chic-mint bg-chic-mint/40 px-3 py-2 text-sm text-chic-forest">
            {message}
          </p>
        ) : null}
        {devPath ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Fallback développement :{" "}
            <Link href={devPath} className="font-medium underline">
              ouvrir le lien de reset
            </Link>
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Envoi…" : "Envoyer le lien"}
        </button>
        <p className="text-center text-sm text-chic-muted">
          <Link href="/login" className="text-chic-emerald hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
