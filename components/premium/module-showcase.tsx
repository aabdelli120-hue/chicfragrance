import Link from "next/link";
import { PlanBadge } from "@/components/premium/plan-badge";
import { MiniBars, MiniGauge, Sparkline } from "@/components/premium/mini-charts";
import { Workflow } from "@/components/premium/system-flow";

function ModuleHeader({
  eyebrow,
  title,
  description,
  badges,
  status,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badges: string[];
  status?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-chic-muted">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 max-w-xl text-sm text-chic-muted">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {badges.map((badge) => (
          <PlanBadge key={badge} plan={badge} />
        ))}
        {status ? (
          <span className="rounded-full bg-chic-cream px-2 py-0.5 text-[10px] uppercase tracking-wide text-chic-muted">
            {status}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function StoreBuilderModule() {
  return (
    <article id="store-builder" className="card scroll-mt-6 border-chic-gold/25 p-5">
      <ModuleHeader
        eyebrow="Module"
        title="Store Builder"
        description="Créez prochainement votre boutique directement depuis Chic Fragrance."
        badges={["ELITE"]}
        status="Bientôt disponible"
      />
      <div className="mt-4 rounded-2xl border border-dashed border-chic-gold/30 bg-chic-gold/[0.04] p-4">
        <Workflow
          steps={["Produits", "Design", "Boutique", "Domaine", "Commandes", "Analytics"]}
        />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          { label: "Catalogue", value: "Produits synchronisés" },
          { label: "Design", value: "Thèmes de marque" },
          { label: "Domaine", value: "Nom personnalisé" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-chic-line px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-chic-muted">{item.label}</p>
            <p className="mt-0.5 text-xs">{item.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-chic-muted">
        Le module est présenté comme fonctionnalité à venir. Aucune boutique n’est générée
        aujourd’hui.
      </p>
      <Link href="/boutique" className="mt-3 inline-flex text-sm font-medium text-chic-emerald">
        Ouvrir le module
      </Link>
    </article>
  );
}

export function ProductStudioModule() {
  return (
    <article className="card p-5">
      <ModuleHeader
        eyebrow="Module"
        title="AI Product Studio"
        description="Du visuel produit à la publicité, dans un seul flux de production."
        badges={["PRO", "ELITE"]}
        status="Bientôt disponible"
      />
      <div className="mt-4">
        <Workflow steps={["Produit", "Image", "AI", "Creative", "Publicité"]} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[
          "Générer une scène",
          "Créer une image produit",
          "Créer une publicité",
          "Créer plusieurs formats",
        ].map((capability) => (
          <div
            key={capability}
            className="flex items-center gap-2 rounded-xl border border-chic-line px-3 py-2 text-xs"
          >
            <span className="text-chic-emerald">✓</span>
            {capability}
          </div>
        ))}
      </div>
      <Link
        href="/creation-ia/visuels"
        className="mt-4 inline-flex text-sm font-medium text-chic-emerald"
      >
        Ouvrir le module
      </Link>
    </article>
  );
}

export function LandingStudioModule() {
  return (
    <article className="card p-5">
      <ModuleHeader
        eyebrow="Module"
        title="Landing Page Studio"
        description="Une page de conversion construite à partir de votre produit et de votre audience."
        badges={["PRO", "ELITE"]}
        status="Bientôt disponible"
      />
      <div className="mt-4">
        <Workflow
          steps={["Produit", "Audience", "Angle", "Copy", "Landing Page", "Conversion"]}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "AI Copy",
          "Hero section",
          "Offer section",
          "Social proof",
          "CTA",
          "Optimisation mobile",
        ].map((feature) => (
          <span
            key={feature}
            className="rounded-lg border border-chic-line bg-chic-cream/60 px-2.5 py-1 text-xs"
          >
            {feature}
          </span>
        ))}
      </div>
      <Link
        href="/creation-ia/landing"
        className="mt-4 inline-flex text-sm font-medium text-chic-emerald"
      >
        Ouvrir le module
      </Link>
    </article>
  );
}

const BI_TILES = [
  { label: "Taux de livraison", kind: "gauge" as const, value: 68 },
  { label: "CPA", kind: "spark" as const, values: [420, 460, 390, 370, 340, 355, 320] },
  { label: "ROAS", kind: "spark" as const, values: [1.8, 2.1, 2.4, 2.2, 2.9, 3.1, 3.4] },
  { label: "Net après publicité", kind: "bars" as const, values: [12, 18, 15, 22, 19, 26, 30] },
  { label: "Performance par période", kind: "bars" as const, values: [8, 14, 11, 17, 21, 19, 24] },
  { label: "Prévision des ventes", kind: "spark" as const, values: [30, 34, 33, 38, 41, 45, 49] },
];

export function BusinessIntelligenceModule() {
  return (
    <section id="intelligence" className="card scroll-mt-6 p-5">
      <ModuleHeader
        eyebrow="Module"
        title="Business Intelligence"
        description="Lecture avancée de votre activité: livraison, coût d’acquisition, rentabilité et prévisions."
        badges={["PRO", "ELITE"]}
        status="Bientôt disponible"
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {BI_TILES.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-chic-line bg-white px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-chic-muted">{tile.label}</p>
            <div className="mt-2">
              {tile.kind === "gauge" ? (
                <MiniGauge value={tile.value} label="livré" />
              ) : tile.kind === "spark" ? (
                <Sparkline values={tile.values} />
              ) : (
                <MiniBars values={tile.values} tone="gold" />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-dashed border-chic-line bg-chic-cream/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-chic-gold">
            Détection des anomalies
          </p>
          <p className="mt-1 text-sm">Écart inhabituel entre dépense publicitaire et livraisons.</p>
        </div>
        <div className="rounded-xl border border-dashed border-chic-line bg-chic-cream/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-chic-gold">Insights</p>
          <p className="mt-1 text-sm">Recommandations générées à partir de vos périodes.</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-chic-muted">
        Les visualisations ci-dessus illustrent le module. Elles ne remplacent pas les données
        réelles de votre tableau de bord.
      </p>
      <Link href="/intelligence" className="mt-3 inline-flex text-sm font-medium text-chic-emerald">
        Ouvrir le module
      </Link>
    </section>
  );
}

const AUTOMATIONS = [
  { trigger: "Commande livrée", action: "recalculer les performances" },
  { trigger: "Dépense ajoutée", action: "mettre à jour les KPI" },
  { trigger: "Nouvelle commande", action: "actualiser les données" },
  { trigger: "Rapport", action: "générer automatiquement" },
];

export function AutomationCenterModule() {
  return (
    <section id="automatisation" className="card scroll-mt-6 p-5">
      <ModuleHeader
        eyebrow="Module"
        title="Automation Center"
        description="Des règles qui relient vos commandes, vos dépenses et vos rapports."
        badges={["ELITE"]}
        status="Bientôt disponible"
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {AUTOMATIONS.map((rule) => (
          <div
            key={rule.trigger}
            className="rounded-xl border border-chic-line bg-white px-3.5 py-3"
          >
            <p className="text-sm font-medium">{rule.trigger}</p>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-chic-muted">
              <span className="text-chic-emerald">→</span>
              {rule.action}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-chic-muted">
        Bientôt disponible: la création de règles n’est pas encore active dans l’application.
      </p>
      <Link
        href="/automatisations"
        className="mt-3 inline-flex text-sm font-medium text-chic-emerald"
      >
        Ouvrir le module
      </Link>
    </section>
  );
}

export function ModuleShowcase() {
  return (
    <section id="modules" className="scroll-mt-6 space-y-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Modules produit</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Ce que la plateforme ajoute à votre activité
        </h2>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        <ProductStudioModule />
        <LandingStudioModule />
      </div>
      <StoreBuilderModule />
      <BusinessIntelligenceModule />
      <AutomationCenterModule />
    </section>
  );
}
