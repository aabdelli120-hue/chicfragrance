import { AppShell } from "@/components/app-shell";
import { FeatureBadge } from "@/components/premium/feature-badge";
import { PremiumGate } from "@/components/premium/premium-gate";

export default function ContentPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <h1 className="font-serif text-4xl">Contenus</h1>
          <FeatureBadge feature="AI_AD_CREATIVES" />
        </div>
        <PremiumGate
          feature="AI_AD_CREATIVES"
          title="Contenus IA"
          description="Copies, angles et scripts publicitaires. Bientôt disponible avec Pro."
        >
          <div className="card p-6 text-sm text-chic-muted">Module préparé, sans génération fictive.</div>
        </PremiumGate>
      </main>
    </AppShell>
  );
}
