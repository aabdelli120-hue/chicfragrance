import { ModuleFrame } from "@/components/premium/module-frame";
import { Workflow } from "@/components/premium/system-flow";

const ACTIONS = ["Créer une scène", "Changer le décor", "Générer une publicité", "Créer plusieurs formats"];

export default function ProductStudioPage() {
  return (
    <ModuleFrame
      feature="AI_PRODUCT_IMAGES"
      title="AI Product Studio"
      description="Pipeline visuel produit. L’API de génération n’est pas encore branchée."
    >
      <div className="card p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-chic-muted">Workflow</p>
        <div className="mt-3">
          <Workflow steps={["PRODUCT IMAGE", "AI PROCESSING", "PRODUCT SCENE", "AD CREATIVE"]} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              disabled
              className="rounded-lg border border-chic-line px-3 py-1.5 text-xs opacity-80"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </ModuleFrame>
  );
}
