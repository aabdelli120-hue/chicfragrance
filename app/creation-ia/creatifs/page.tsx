import { ModuleFrame } from "@/components/premium/module-frame";
import { Workflow } from "@/components/premium/system-flow";

export default function CreativesPage() {
  return (
    <ModuleFrame
      feature="AI_AD_CREATIVES"
      title="Créatifs publicitaires"
      description="Variations de visuels et de textes pour vos campagnes."
    >
      <div className="card p-5">
        <Workflow steps={["Produit", "Angle", "Visuel", "Texte", "Variation"]} />
        <p className="mt-4 text-sm text-chic-muted">Module préparé. Aucune génération n’est simulée.</p>
      </div>
    </ModuleFrame>
  );
}
