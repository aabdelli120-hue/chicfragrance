import { ModuleFrame } from "@/components/premium/module-frame";
import { Workflow } from "@/components/premium/system-flow";

export default function LandingStudioPage() {
  return (
    <ModuleFrame
      feature="AI_LANDING_PAGE"
      title="Landing Pages IA"
      description="Transformez un produit en page de vente en quelques secondes."
    >
      <div className="card p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-chic-muted">Workflow</p>
        <div className="mt-3">
          <Workflow steps={["Produit", "Audience", "Angle marketing", "Landing Page", "Conversion"]} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Produit" value="Good Girl EDP" />
          <Field label="Objectif" value="Conversion" />
          <Field label="Angle" value="Offre" />
          <Field label="CTA" value="Générer" />
        </div>
        <button
          type="button"
          disabled
          className="mt-4 rounded-xl bg-chic-forest px-4 py-2.5 text-sm font-semibold text-white opacity-55"
        >
          Générer avec IA
        </button>
      </div>
    </ModuleFrame>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-sm">
      <span className="text-[10px] uppercase tracking-wide text-chic-muted">{label}</span>
      <input
        defaultValue={value}
        readOnly
        className="mt-1 w-full rounded-lg border border-chic-line px-3 py-2 text-sm"
      />
    </label>
  );
}
