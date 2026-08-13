import { ModuleFrame } from "@/components/premium/module-frame";

export default function ContentPage() {
  return (
    <ModuleFrame
      feature="AI_AD_CREATIVES"
      title="Contenus"
      description="Copies, angles et scripts publicitaires."
    >
      <div className="card p-5 text-sm text-chic-muted">
        Module préparé, sans génération fictive.
      </div>
    </ModuleFrame>
  );
}
