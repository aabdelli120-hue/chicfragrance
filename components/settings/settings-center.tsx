"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CANONICAL_STATUSES, SHEET_STATUS, UI_STATUS } from "@/lib/status";
import { PLANS } from "@/lib/plans";
import { FEATURES } from "@/lib/features";
import { formatDzd } from "@/lib/format";
import { useToast } from "@/components/toast-provider";

type Section = "general" | "sheets" | "status" | "premium" | "account";

type SettingsPayload = {
  general: {
    storeName: string;
    currency: string;
    timezone: string;
    dateFormat: string;
  };
  sheets: {
    spreadsheetId: string;
    ordersSheet: string;
    ordersRange: string;
    expensesSheet: string;
    expensesRange: string;
  };
  account: {
    name: string;
    email: string;
    role: string;
  };
  subscription: {
    plan: string;
    status: string;
  };
  secrets: {
    serviceAccountConfigured: boolean;
    privateKeyConfigured: boolean;
  };
};

const NAV: Array<{ id: Section; label: string }> = [
  { id: "general", label: "Général" },
  { id: "sheets", label: "Google Sheets" },
  { id: "status", label: "Statuts" },
  { id: "premium", label: "Premium" },
  { id: "account", label: "Compte" },
];

export function SettingsCenter() {
  const { notify } = useToast();
  const [section, setSection] = useState<Section>("sheets");
  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        setSettings(payload.settings);
        setConnected(Boolean(payload.connection?.configured));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });
    return () => controller.abort();
  }, []);

  async function save(patch: Partial<SettingsPayload>) {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Enregistrement impossible.");
      setSettings(payload.settings);
      setConnected(Boolean(payload.connection?.configured));
      notify("success", "Paramètres enregistrés.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Erreur d'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    if (!settings) return;
    setTesting(true);
    try {
      const response = await fetch("/api/settings/sheets/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings.sheets, save: true }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Connexion impossible.");
      setConnected(true);
      notify(
        "success",
        `Connexion vérifiée · ${payload.orders} commandes · ${payload.expenses} dépenses`,
      );
    } catch (error) {
      setConnected(false);
      notify("error", error instanceof Error ? error.message : "Échec de connexion.");
    } finally {
      setTesting(false);
    }
  }

  if (!settings) {
    return <div className="card p-8 text-sm text-chic-muted">Chargement des paramètres…</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="card h-fit p-3">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm ${
              section === item.id ? "bg-chic-forest text-white" : "hover:bg-chic-cream"
            }`}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <div className="space-y-5">
        {section === "general" ? (
          <section className="card p-6">
            <h2 className="font-serif text-2xl">Général</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nom du magasin" value={settings.general.storeName} onChange={(storeName) => setSettings({ ...settings, general: { ...settings.general, storeName } })} />
              <Field label="Devise" value={settings.general.currency} onChange={(currency) => setSettings({ ...settings, general: { ...settings.general, currency } })} />
              <Field label="Fuseau horaire" value={settings.general.timezone} onChange={(timezone) => setSettings({ ...settings, general: { ...settings.general, timezone } })} />
              <Field label="Format de date" value={settings.general.dateFormat} onChange={(dateFormat) => setSettings({ ...settings, general: { ...settings.general, dateFormat } })} />
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-chic-muted">Logo officiel</p>
              <div className="mt-2 w-56 overflow-hidden rounded-2xl">
                <Image src="/logo.png" alt="Chic Fragrance" width={320} height={200} />
              </div>
            </div>
            <button type="button" disabled={saving} onClick={() => save({ general: settings.general })} className="mt-5 rounded-2xl bg-chic-forest px-4 py-2 text-sm text-white">
              Enregistrer
            </button>
          </section>
        ) : null}

        {section === "sheets" ? (
          <section className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">Google Sheets</h2>
              <span className={`rounded-full px-3 py-1 text-xs ${connected ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                {connected ? "● Connecté" : "⚠ Connexion requise"}
              </span>
            </div>
            <p className="mt-2 text-sm text-chic-muted">
              Les identifiants du compte de service restent côté serveur. Ils ne sont jamais affichés ici.
            </p>
            <div className="mt-5 grid gap-4">
              <Field label="Spreadsheet ID" value={settings.sheets.spreadsheetId} onChange={(spreadsheetId) => setSettings({ ...settings, sheets: { ...settings.sheets, spreadsheetId } })} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Onglet commandes" value={settings.sheets.ordersSheet} onChange={(ordersSheet) => setSettings({ ...settings, sheets: { ...settings.sheets, ordersSheet } })} />
                <Field label="Plage commandes" value={settings.sheets.ordersRange} onChange={(ordersRange) => setSettings({ ...settings, sheets: { ...settings.sheets, ordersRange } })} />
                <Field label="Onglet dépenses" value={settings.sheets.expensesSheet} onChange={(expensesSheet) => setSettings({ ...settings, sheets: { ...settings.sheets, expensesSheet } })} />
                <Field label="Plage dépenses" value={settings.sheets.expensesRange} onChange={(expensesRange) => setSettings({ ...settings, sheets: { ...settings.sheets, expensesRange } })} />
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-chic-cream/80 p-4 text-sm text-chic-muted">
              Compte de service: {settings.secrets.serviceAccountConfigured ? "configuré" : "manquant"} · Clé privée: {settings.secrets.privateKeyConfigured ? "configurée" : "manquante"}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" disabled={saving} onClick={() => save({ sheets: settings.sheets })} className="rounded-2xl bg-chic-forest px-4 py-2 text-sm text-white">
                Enregistrer
              </button>
              <button type="button" disabled={testing} onClick={() => void testConnection()} className="rounded-2xl border border-chic-line px-4 py-2 text-sm">
                {testing ? "Test…" : "Tester la connexion"}
              </button>
            </div>
          </section>
        ) : null}

        {section === "status" ? (
          <section className="card overflow-hidden">
            <div className="p-6">
              <h2 className="font-serif text-2xl">Statuts commandes</h2>
              <p className="mt-2 text-sm text-chic-muted">
                Mapping centralisé. Les valeurs Google Sheets restent exactes et ne sont pas renommées.
              </p>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-chic-line text-xs uppercase tracking-wide text-chic-muted">
                  <th className="px-6 py-3 font-medium">Interne</th>
                  <th className="px-6 py-3 font-medium">Affichage</th>
                  <th className="px-6 py-3 font-medium">Google Sheets</th>
                </tr>
              </thead>
              <tbody>
                {CANONICAL_STATUSES.map((status) => (
                  <tr key={status} className="border-b border-chic-line/70">
                    <td className="px-6 py-3 font-mono text-xs">{status}</td>
                    <td className="px-6 py-3">{UI_STATUS[status]}</td>
                    <td className="px-6 py-3">{SHEET_STATUS[status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {section === "premium" ? (
          <section className="card p-6">
            <h2 className="font-serif text-2xl">Premium</h2>
            <p className="mt-2 text-sm text-chic-muted">Plan actuel: {settings.subscription.plan}</p>
            <p className="mt-1 text-sm text-chic-muted">Paiement: bientôt disponible. Aucun abonnement n&apos;est facturé pour le moment.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-chic-line p-4">
                  <p className="text-xs uppercase tracking-wide text-chic-gold">{plan.name}</p>
                  <p className="mt-2 font-serif text-2xl">{formatDzd(plan.price)}</p>
                  <p className="mt-2 text-sm text-chic-muted">{plan.description}</p>
                </div>
              ))}
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {FEATURES.filter((feature) => feature.requiredPlan !== "ESSENTIAL").map((feature) => (
                <li key={feature.id}>
                  {feature.label} · {feature.requiredPlan} · {feature.available ? "disponible" : "bientôt"}
                </li>
              ))}
            </ul>
            <Link href="/premium" className="mt-6 inline-flex rounded-xl bg-chic-emerald px-4 py-2 text-sm font-semibold text-white">
              Voir les plans
            </Link>
          </section>
        ) : null}

        {section === "account" ? (
          <section className="card p-6">
            <h2 className="font-serif text-2xl">Compte</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nom" value={settings.account.name} onChange={(name) => setSettings({ ...settings, account: { ...settings.account, name } })} />
              <Field label="Email" value={settings.account.email} onChange={(email) => setSettings({ ...settings, account: { ...settings.account, email } })} />
              <Field label="Rôle" value={settings.account.role} onChange={(role) => setSettings({ ...settings, account: { ...settings.account, role } })} />
            </div>
            <div className="mt-5 rounded-2xl bg-chic-cream p-4 text-sm text-chic-muted">
              Sécurité: la clé privée Google et l&apos;email du compte de service ne sont jamais exposés dans l&apos;interface.
            </div>
            <button type="button" disabled={saving} onClick={() => save({ account: settings.account })} className="mt-5 rounded-2xl bg-chic-forest px-4 py-2 text-sm text-white">
              Enregistrer
            </button>
          </section>
        ) : null}
      </div>
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
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-chic-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2"
      />
    </label>
  );
}
