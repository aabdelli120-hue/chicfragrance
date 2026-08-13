export const PLAN_IDS = ["FREE", "ESSENTIAL", "PRO", "ELITE"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const PLAN_RANK: Record<PlanId, number> = {
  FREE: 0,
  ESSENTIAL: 1,
  PRO: 2,
  ELITE: 3,
};

export type PlanCapability = {
  label: string;
  value: string;
};

export type PlanDefinition = {
  id: Exclude<PlanId, "FREE">;
  name: string;
  price: number;
  badge?: string;
  recommended?: boolean;
  description: string;
  cta: string;
  features: string[];
  comingSoon?: string[];
  capabilities: PlanCapability[];
};

export const PLANS: PlanDefinition[] = [
  {
    id: "ESSENTIAL",
    name: "Essential",
    price: 900,
    description: "Pour les marchands qui ont besoin d’un tableau de bord opérationnel fiable.",
    cta: "Choisir Essential",
    capabilities: [
      { label: "Pilotage", value: "Dashboard" },
      { label: "Données", value: "Sheets" },
      { label: "IA", value: "—" },
    ],
    features: [
      "Dashboard",
      "Commandes",
      "Google Sheets",
      "Dépenses",
      "Suivi des livraisons",
      "Filtres avancés",
      "Rapports essentiels",
      "Synchronisation des données",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 1900,
    badge: "Le plus populaire",
    recommended: true,
    description: "Analytics, prévisions et studio IA pour développer et automatiser l’activité.",
    cta: "Passer à Pro",
    capabilities: [
      { label: "Pilotage", value: "Avancé" },
      { label: "Données", value: "Sheets" },
      { label: "IA", value: "Studio" },
    ],
    features: [
      "Tout Essential",
      "Analytics avancés",
      "Comparaison des périodes",
      "Prévisions commerciales",
      "AI Landing Page",
      "AI Product Studio",
      "Génération de visuels",
      "Création de textes publicitaires",
      "Creative variations",
      "Insights IA",
      "Rapports avancés",
    ],
  },
  {
    id: "ELITE",
    name: "Elite",
    price: 2900,
    badge: "Suite complète",
    description: "Une suite d’outils pour gérer, analyser, automatiser et développer votre e-commerce.",
    cta: "Choisir Elite",
    capabilities: [
      { label: "Pilotage", value: "Complet" },
      { label: "IA", value: "Assistant" },
      { label: "Store", value: "Builder" },
    ],
    features: [
      "Tout Pro",
      "AI Store Builder",
      "Création de boutique",
      "Multi-store",
      "Branding personnalisé",
      "Analytics avancés",
      "AI Business Assistant",
      "Automatisations",
      "Rapports premium",
      "Priorité nouvelles fonctionnalités",
    ],
  },
];

export function planLabel(plan: PlanId): string {
  if (plan === "ESSENTIAL") return "Essential";
  if (plan === "PRO") return "Pro";
  if (plan === "ELITE") return "Elite";
  return "Gratuit";
}
