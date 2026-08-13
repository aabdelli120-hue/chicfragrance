import { ModuleFrame } from "@/components/premium/module-frame";

const CAPABILITIES = [
  "Prévision des ventes",
  "Analyse du taux de livraison",
  "Détection des anomalies",
  "Analyse des dépenses",
  "Performance par période",
  "Insights produits",
  "Recommandations IA",
];

export default function IntelligencePage() {
  return (
    <ModuleFrame
      feature="AI_INSIGHTS"
      title="Business Intelligence"
      description="Module d’analyse avancée. Les cartes ci-dessous sont des placeholders, pas des données live."
    >
      <div className="card p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {CAPABILITIES.map((item) => (
            <div key={item} className="rounded-xl border border-chic-line px-3 py-2 text-sm">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-chic-line bg-chic-cream/60 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-chic-gold">Insight IA · Placeholder</p>
          <p className="mt-1 text-sm">Votre taux de livraison baisse de 8%</p>
        </div>
      </div>
    </ModuleFrame>
  );
}
