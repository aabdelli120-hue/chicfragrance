import { AppShell } from "@/components/app-shell";
import { FeatureBadge } from "@/components/premium/feature-badge";
import { PremiumGate } from "@/components/premium/premium-gate";

export default function CreativesPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <h1 className="font-serif text-4xl">Créatifs publicitaires</h1>
          <FeatureBadge feature="AI_AD_CREATIVES" />
        </div>
        <PremiumGate
          feature="AI_AD_CREATIVES"
          title="Ad Creative Generator"
          description="Variations de visuels et de textes pour vos campagnes. Intégration IA à venir."
        >
          <div className="card p-6 text-sm text-chic-muted">
            Module préparé. Aucune génération n&apos;est simulée.
          </div>
        </PremiumGate>
      </main>
    </AppShell>
  );
}
