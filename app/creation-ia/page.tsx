import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FeatureBadge } from "@/components/premium/feature-badge";
import type { FeatureId } from "@/lib/features";

const MODULES: Array<{
  href: string;
  title: string;
  text: string;
  feature: FeatureId;
}> = [
  {
    href: "/creation-ia/landing",
    title: "Landing Pages",
    text: "Produit → audience → page de conversion.",
    feature: "AI_LANDING_PAGE",
  },
  {
    href: "/creation-ia/visuels",
    title: "AI Product Studio",
    text: "Image produit → scène → créatif pub.",
    feature: "AI_PRODUCT_IMAGES",
  },
  {
    href: "/creation-ia/creatifs",
    title: "Créatifs Publicitaires",
    text: "Visuels et textes pour vos campagnes.",
    feature: "AI_AD_CREATIVES",
  },
  {
    href: "/creation-ia/contenus",
    title: "Contenus",
    text: "Angles marketing et copies produits.",
    feature: "AI_AD_CREATIVES",
  },
];

export default function CreationIaPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8">
        <p className="text-[11px] uppercase tracking-[0.16em] text-chic-muted">Croissance</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight lg:text-3xl">Création IA</h1>
        <p className="mt-2 text-sm text-chic-muted">
          Modules logiciels préparés. Aucune génération fictive n’est simulée.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {MODULES.map((item) => (
            <Link key={item.href} href={item.href} className="card p-5 transition duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{item.title}</h2>
                <FeatureBadge feature={item.feature} />
              </div>
              <p className="mt-2 text-sm text-chic-muted">{item.text}</p>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
