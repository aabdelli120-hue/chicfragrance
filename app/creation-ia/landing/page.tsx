import { AppShell } from "@/components/app-shell";
import { FeatureBadge } from "@/components/premium/feature-badge";
import { PremiumGate } from "@/components/premium/premium-gate";

export default function LandingStudioPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <h1 className="font-serif text-4xl">Landing Pages IA</h1>
          <FeatureBadge feature="AI_LANDING_PAGE" />
        </div>
        <PremiumGate
          feature="AI_LANDING_PAGE"
          title="Création de Landing Page IA"
          description="Générez une page d'offre à partir du produit, du prix et de l'angle marketing."
        >
          <LandingForm />
        </PremiumGate>
      </main>
    </AppShell>
  );
}

function LandingForm() {
  return (
    <form className="card grid gap-4 p-6 md:grid-cols-2">
      <label className="text-sm">
        Nom du produit
        <input className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2" />
      </label>
      <label className="text-sm">
        Prix
        <input className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2" />
      </label>
      <label className="text-sm md:col-span-2">
        Description
        <textarea className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2" rows={4} />
      </label>
      <label className="text-sm">
        Audience
        <input className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2" />
      </label>
      <label className="text-sm">
        Angle marketing
        <input className="mt-1 w-full rounded-xl border border-chic-line px-3 py-2" />
      </label>
      <button type="button" disabled className="rounded-2xl bg-chic-forest px-4 py-3 text-sm text-white opacity-60 md:col-span-2">
        Générer · Bientôt disponible avec Pro
      </button>
    </form>
  );
}
