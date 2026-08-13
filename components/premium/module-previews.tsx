import Link from "next/link";
import { ComingSoonNote, PlanBadge } from "@/components/premium/plan-badge";
import { Workflow } from "@/components/premium/system-flow";

export function ModulePreviews() {
  return (
    <section className="grid gap-3 xl:grid-cols-2">
      <article className="card p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">AI Product Studio</h3>
          <PlanBadge plan="PRO" />
        </div>
        <p className="mt-1 text-sm text-chic-muted">Workflow de production visuelle.</p>
        <div className="mt-4">
          <Workflow steps={["PRODUCT IMAGE", "AI PROCESSING", "PRODUCT SCENE", "AD CREATIVE"]} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Créer une scène", "Changer le décor", "Générer une publicité", "Créer plusieurs formats"].map(
            (action) => (
              <span key={action} className="rounded-lg border border-chic-line px-2.5 py-1 text-xs">
                {action}
              </span>
            ),
          )}
        </div>
        <ComingSoonNote plan="PRO" />
        <Link href="/creation-ia/visuels" className="mt-3 inline-flex text-sm text-chic-emerald">
          Ouvrir le module
        </Link>
      </article>

      <article className="card p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Landing Page AI</h3>
          <PlanBadge plan="PRO" />
        </div>
        <p className="mt-1 text-sm text-chic-muted">Du produit à la page de conversion.</p>
        <div className="mt-4">
          <Workflow steps={["Produit", "Audience", "Angle marketing", "Landing Page", "Conversion"]} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <Field label="Produit" value="Good Girl EDP" />
          <Field label="Objectif" value="Conversion" />
          <Field label="Angle" value="Offre" />
          <button
            type="button"
            disabled
            className="rounded-lg bg-chic-forest px-3 py-2 text-white opacity-55"
          >
            Générer avec IA
          </button>
        </div>
        <ComingSoonNote plan="PRO" />
        <Link href="/creation-ia/landing" className="mt-3 inline-flex text-sm text-chic-emerald">
          Ouvrir le module
        </Link>
      </article>

      <article className="card p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Store Builder</h3>
          <PlanBadge plan="ELITE" />
        </div>
        <p className="mt-1 text-sm text-chic-muted">Créer votre boutique e-commerce.</p>
        <div className="mt-4">
          <Workflow steps={["Products", "Theme", "Store", "Domain", "Orders", "Analytics"]} />
        </div>
        <ComingSoonNote plan="ELITE" />
        <Link href="/boutique" className="mt-3 inline-flex text-sm text-chic-emerald">
          Ouvrir le module
        </Link>
      </article>

      <article className="card p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Automatisations</h3>
          <div className="flex gap-1">
            <PlanBadge plan="PRO" />
            <PlanBadge plan="ELITE" />
          </div>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {[
            "Nouvelle commande → mettre à jour le dashboard",
            "Commande livrée → recalculer les revenus",
            "Dépense publicitaire → actualiser les performances",
            "Rapport quotidien → générer automatiquement",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-chic-emerald">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <ComingSoonNote plan="PRO" />
        <Link href="/automatisations" className="mt-3 inline-flex text-sm text-chic-emerald">
          Ouvrir le module
        </Link>
      </article>

      <article className="card p-5 xl:col-span-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Business Intelligence</h3>
          <PlanBadge plan="PRO" />
        </div>
        <p className="mt-1 text-sm text-chic-muted">
          Aperçu du module. Ces cartes sont des placeholders, pas des insights du dashboard live.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Prévision des ventes",
            "Analyse du taux de livraison",
            "Détection des anomalies",
            "Analyse des dépenses",
            "Performance par période",
            "Insights produits",
            "Recommandations IA",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-chic-line px-3 py-2 text-xs">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-chic-line bg-chic-cream/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-chic-gold">Insight IA · Placeholder</p>
          <p className="mt-1 text-sm">Votre taux de livraison baisse de 8%</p>
        </div>
        <ComingSoonNote plan="PRO" />
        <Link href="/intelligence" className="mt-3 inline-flex text-sm text-chic-emerald">
          Ouvrir le module
        </Link>
      </article>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-chic-muted">{label}</span>
      <span className="mt-1 block rounded-lg border border-chic-line bg-white px-3 py-2">{value}</span>
    </label>
  );
}
