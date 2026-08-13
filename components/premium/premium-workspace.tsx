"use client";

import Link from "next/link";
import { DataArchitecture, EcosystemFlow } from "@/components/premium/system-flow";
import { FeatureGrid } from "@/components/premium/feature-grid";
import { ModulePreviews } from "@/components/premium/module-previews";
import { PlanComparison } from "@/components/premium/plan-comparison";
import { PricingSection } from "@/components/premium/pricing-section";
import { LiveDataRail, SystemStatusStrip } from "@/components/premium/system-status";
import { StatusDot } from "@/components/premium/plan-badge";
import { useSystemStatus } from "@/lib/use-system-status";

const NAV = [
  { href: "#plans", label: "Plans" },
  { href: "#modules", label: "Modules" },
  { href: "#ecosysteme", label: "Écosystème" },
  { href: "#comparer", label: "Comparer" },
];

export function PremiumWorkspace() {
  const status = useSystemStatus();
  const sheetsOk = status.connected && status.source === "google-sheets";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Premium</h1>
          <p className="mt-1 max-w-xl text-sm text-chic-muted">
            Débloquez des outils avancés pour développer et automatiser votre activité.
          </p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full border border-chic-line bg-white px-3 py-1.5 text-xs">
          <StatusDot tone={sheetsOk ? "ok" : "warn"} />
          {sheetsOk ? "Votre espace est connecté" : "Espace à connecter"}
        </p>
      </header>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-chic-line bg-white px-3 py-1.5 text-xs font-medium"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <SystemStatusStrip status={status} />
      <LiveDataRail status={status} />
      <DataArchitecture />
      <PricingSection />
      <FeatureGrid />
      <EcosystemFlow />
      <ModulePreviews />
      <PlanComparison />

      <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Prêt à étendre le système ?</p>
          <p className="text-sm text-chic-muted">
            Les outils existants restent disponibles. Premium ajoute l’IA, l’automatisation et le store.
          </p>
        </div>
        <Link
          href="#plans"
          className="inline-flex rounded-xl bg-chic-emerald px-4 py-2.5 text-sm font-semibold text-white"
        >
          Voir les plans
        </Link>
      </div>
    </div>
  );
}
