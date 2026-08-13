import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { FeatureBadge } from "@/components/premium/feature-badge";

const MODULES = [
  {
    href: "/creation-ia/landing",
    title: "Landing Pages",
    text: "Créez une landing page en quelques secondes.",
    feature: "AI_LANDING_PAGE" as const,
  },
  {
    href: "/creation-ia/visuels",
    title: "Visuels Produits",
    text: "Studio produit, décors et mises en scène.",
    feature: "AI_PRODUCT_IMAGES" as const,
  },
  {
    href: "/creation-ia/creatifs",
    title: "Créatifs Publicitaires",
    text: "Visuels et textes pour vos campagnes.",
    feature: "AI_AD_CREATIVES" as const,
  },
  {
    href: "/creation-ia/contenus",
    title: "Contenus",
    text: "Angles marketing et copies produits.",
    feature: "AI_AD_CREATIVES" as const,
  },
];

export default function CreationIaPage() {
  return (
    <AppShell orderCount={0}>
      <main className="px-4 py-6 lg:px-8">
        <p className="text-xs tracking-[0.18em] text-chic-gold">CROISSANCE</p>
        <h1 className="mt-2 font-serif text-4xl">Création IA</h1>
        <p className="mt-2 text-sm text-chic-muted">
          Modules préparés pour l&apos;intégration IA. Aucune génération fictive n&apos;est simulée.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {MODULES.map((item) => (
            <Link key={item.href} href={item.href} className="card p-5 transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl">{item.title}</h2>
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
