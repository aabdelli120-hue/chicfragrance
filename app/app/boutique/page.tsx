import { ModuleFrame } from "@/components/premium/module-frame";
import { Workflow } from "@/components/premium/system-flow";

export default function AppBoutiquePage() {
  return (
    <ModuleFrame
      feature="AI_STORE_BUILDER"
      title="Store Builder"
      description="Créer votre boutique e-commerce. Module Elite — bientôt disponible."
    >
      <div className="card p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-chic-muted">Pipeline boutique</p>
        <div className="mt-3">
          <Workflow steps={["Products", "Theme", "Store", "Domain", "Orders", "Analytics"]} />
        </div>
        <p className="mt-4 text-sm text-chic-muted">
          Bientôt disponible. Architecture multi-tenant prête — aucune boutique n’est générée.
        </p>
      </div>
    </ModuleFrame>
  );
}
