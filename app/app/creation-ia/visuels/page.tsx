import { ModuleFrame } from "@/components/premium/module-frame";
import { Workflow } from "@/components/premium/system-flow";

export default function AppVisuelsPage() {
  return (
    <ModuleFrame
      feature="AI_PRODUCT_IMAGES"
      title="AI Product Studio"
      description="Visuels produit — génération non branchée tant qu'aucune clé AI n'est configurée."
    >
      <div className="card p-5">
        <Workflow steps={["Produit", "Style", "Prompt", "Visuels", "Export"]} />
        <p className="mt-4 text-sm text-chic-muted">Bientôt disponible.</p>
      </div>
    </ModuleFrame>
  );
}
