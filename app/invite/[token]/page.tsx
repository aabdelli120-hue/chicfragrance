"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;
  const [meta, setMeta] = useState<{
    email: string;
    name: string;
    organizationName: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/team/invite/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setMeta({
            email: data.invitation.email,
            name: data.invitation.name,
            organizationName: data.organizationName,
          });
        } else {
          setError(data.error || "Invitation invalide.");
        }
      })
      .catch(() => setError("Impossible de charger l'invitation."));
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/team/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Activation impossible.");
        return;
      }
      router.replace(data.redirectTo || "/app");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Accepter l'invitation"
      subtitle={
        meta
          ? `${meta.name} — rejoindre ${meta.organizationName}`
          : "Définissez votre mot de passe pour activer le compte."
      }
    >
      {meta ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="rounded-xl bg-chic-mint/50 px-3 py-2 text-sm text-chic-forest">
            Compte : <strong>{meta.email}</strong>
          </p>
          <div>
            <label className="text-xs font-medium tracking-wide text-chic-muted">
              Mot de passe
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
            disabled={loading}
            className="w-full rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Activation…" : "Activer mon compte"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-chic-muted">{error || "Chargement…"}</p>
      )}
    </AuthShell>
  );
}
