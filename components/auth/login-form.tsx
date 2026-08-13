"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Connexion impossible.");
        return;
      }
      router.replace(data.redirectTo || "/app");
      router.refresh();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium tracking-wide text-chic-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-chic-line bg-white px-3 py-2.5 text-sm outline-none focus:border-chic-emerald"
          placeholder="sofiane@chicfragrance.dz"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium tracking-wide text-chic-muted">
            Mot de passe
          </label>
          <Link href="/forgot-password" className="text-xs text-chic-emerald hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-chic-line bg-white px-3 py-2.5 text-sm outline-none focus:border-chic-emerald"
        />
      </div>
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
      <p className="text-center text-sm text-chic-muted">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-medium text-chic-emerald hover:underline">
          Créer une organisation
        </Link>
      </p>
    </form>
  );
}
