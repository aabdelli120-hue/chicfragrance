"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Réinitialisation impossible.");
        return;
      }
      router.replace("/login");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!token ? (
        <p className="text-sm text-rose-700">Token manquant.</p>
      ) : null}
      <div>
        <label className="text-xs font-medium tracking-wide text-chic-muted">
          Nouveau mot de passe
        </label>
        <input
          type="password"
          required
          minLength={8}
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
        disabled={loading || !token}
        className="w-full rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Enregistrement…" : "Réinitialiser"}
      </button>
      <p className="text-center text-sm text-chic-muted">
        <Link href="/login" className="text-chic-emerald hover:underline">
          Connexion
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nouveau mot de passe">
      <Suspense fallback={<p className="text-sm text-chic-muted">Chargement…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
