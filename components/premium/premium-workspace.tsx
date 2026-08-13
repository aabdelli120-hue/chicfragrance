"use client";

import { ActivationDialog } from "@/components/premium/activation-dialog";
import { AssistantCard, ChicAssistant } from "@/components/premium/chic-assistant";
import { CurrentPlanPanel } from "@/components/premium/current-plan";
import { FeatureGrid } from "@/components/premium/feature-grid";
import { ModuleShowcase } from "@/components/premium/module-showcase";
import { PlanComparison } from "@/components/premium/plan-comparison";
import { PremiumProvider } from "@/components/premium/premium-provider";
import { PricingSection } from "@/components/premium/pricing-section";
import { PricingRail } from "@/components/premium/system-status";
import { StatusDot } from "@/components/premium/plan-badge";
import { TrustNote } from "@/components/premium/trust-note";
import { EcosystemFlow } from "@/components/premium/system-flow";
import { useSystemStatus } from "@/lib/use-system-status";

const NAV = [
  { href: "#plans", label: "Offres" },
  { href: "#comparer", label: "Comparer" },
  { href: "#modules", label: "Modules" },
  { href: "#ecosysteme", label: "Écosystème" },
];

export function PremiumWorkspace() {
  const status = useSystemStatus();
  const sheetsOk = status.connected && status.source === "google-sheets";

  return (
    <PremiumProvider>
      <div className="space-y-6 pb-20 lg:pb-0">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Premium</h1>
            <p className="mt-1 max-w-xl text-sm text-chic-muted">
              Débloquez des outils avancés pour développer et automatiser votre activité.
            </p>
          </div>
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-chic-line bg-white px-3 py-1.5 text-xs">
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

        <PricingRail status={status} />
        <CurrentPlanPanel orderCount={status.orderCount} />
        <PricingSection />
        <TrustNote />
        <PlanComparison />
        <AssistantCard />
        <ModuleShowcase />
        <FeatureGrid />
        <EcosystemFlow />

        <ActivationDialog />
        <ChicAssistant />
      </div>
    </PremiumProvider>
  );
}
