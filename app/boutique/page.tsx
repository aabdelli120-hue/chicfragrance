import { AppShell } from "@/components/app-shell";
import { FeatureBadge } from "@/components/premium/feature-badge";
import { PremiumGate } from "@/components/premium/premium-gate";

const FUTURE = [
  "Store generation",
  "Theme generation",
  "Product pages",
  "Collections",
  "Checkout",
  "Mobile optimization",
  "SEO",
  "Custom domain",
  "Analytics",
  "Order management",
];

export default function StoreBuilderPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <h1 className="font-serif text-4xl">Créer ma boutique</h1>
          <FeatureBadge feature="AI_STORE_BUILDER" />
          <span className="rounded-full bg-chic-cream px-3 py-1 text-[11px] uppercase tracking-wide text-chic-muted">
            Bientôt disponible
          </span>
        </div>
        <p className="max-w-2xl text-sm text-chic-muted">
          Créez une boutique e-commerce complète à partir de vos produits et de votre identité visuelle.
        </p>
        <div className="mt-6">
          <PremiumGate
            feature="AI_STORE_BUILDER"
            title="Création de boutique"
            description="Différenciateur Elite. La génération de boutique n'est pas encore active."
          >
            <div className="card p-6">
              <div className="flex flex-wrap gap-2">
                {FUTURE.map((item) => (
                  <span key={item} className="rounded-full bg-chic-cream px-3 py-1 text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </PremiumGate>
        </div>
      </main>
    </AppShell>
  );
}
