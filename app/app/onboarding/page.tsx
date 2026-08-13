"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOptionalWorkspace } from "@/lib/platform/workspace-context";

export default function OnboardingPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8 lg:py-8">
        <OnboardingContent />
      </main>
    </AppShell>
  );
}

function OnboardingContent() {
  const workspace = useOptionalWorkspace();
  const org = workspace?.session?.organization;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm text-chic-muted">Bienvenue</p>
      <h1 className="mt-2 font-serif text-4xl">
        {org?.name ? `${org.name} est prêt` : "Votre espace est prêt"}
      </h1>
      <p className="mt-3 text-sm text-chic-muted">
        Prochaine étape recommandée : connecter Google Sheets pour importer commandes et dépenses.
      </p>

      <ol className="mt-8 space-y-3">
        <Step done title="Compte créé" />
        <Step done title="Informations boutique" />
        <Step done title="Paramètres business" />
        <Step title="Connecter Google Sheets" href="/app/parametres" />
        <Step title="Ouvrir le dashboard" href="/app" />
      </ol>

      <div className="mt-8 flex gap-3">
        <Link
          href="/app/parametres"
          className="rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white"
        >
          Configurer Sheets
        </Link>
        <Link
          href="/app"
          className="rounded-xl border border-chic-line px-4 py-2.5 text-sm font-medium"
        >
          Aller au dashboard
        </Link>
      </div>
    </div>
  );
}

function Step({
  title,
  href,
  done,
}: {
  title: string;
  href?: string;
  done?: boolean;
}) {
  const inner = (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        done ? "border-chic-emerald/30 bg-chic-mint/40" : "border-chic-line bg-white"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
          done ? "bg-chic-emerald text-white" : "bg-chic-line text-chic-muted"
        }`}
      >
        {done ? "✓" : "•"}
      </span>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
