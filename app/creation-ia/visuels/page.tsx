import { AppShell } from "@/components/app-shell";
import { FeatureBadge } from "@/components/premium/feature-badge";
import { PremiumGate } from "@/components/premium/premium-gate";

const ACTIONS = [
  "Studio produit",
  "Changer le décor",
  "Créer une mise en scène",
  "Générer une image publicitaire",
];
const RATIOS = ["1:1", "4:5", "9:16", "16:9"];

export default function ProductStudioPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <h1 className="font-serif text-4xl">AI Product Studio</h1>
          <FeatureBadge feature="AI_PRODUCT_IMAGES" />
        </div>
        <PremiumGate
          feature="AI_PRODUCT_IMAGES"
          title="AI Product Studio"
          description="Préparé pour une future API de génération d'images. Aucun visuel fictif n'est produit."
        >
          <div className="card p-6">
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((action) => (
                <span key={action} className="rounded-full bg-chic-cream px-3 py-1 text-sm">
                  {action}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {RATIOS.map((ratio) => (
                <span key={ratio} className="rounded-xl border border-chic-line px-3 py-2 text-sm">
                  {ratio}
                </span>
              ))}
            </div>
            <button type="button" disabled className="mt-6 rounded-2xl bg-chic-forest px-4 py-3 text-sm text-white opacity-60">
              Générer · Bientôt disponible avec Pro
            </button>
          </div>
        </PremiumGate>
      </main>
    </AppShell>
  );
}
