export const PLAN_IDS = ["FREE", "ESSENTIAL", "PRO", "ELITE"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const PLAN_RANK: Record<PlanId, number> = {
  FREE: 0,
  ESSENTIAL: 1,
  PRO: 2,
  ELITE: 3,
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
};

export const PLANS: PlanDefinition[] = [
  {
    id: "ESSENTIAL",
    name: "Essential",
    price: 900,
    description: "Les outils essentiels pour mieux gérer votre activité.",
    cta: "Choisir Essential",
    features: [
      "Dashboard avancé",
      "Gestion des commandes",
      "Synchronisation Google Sheets",
      "Suivi des livraisons",
      "Statistiques essentielles",
      "Suivi des dépenses publicitaires",
      "Rapports de base",
      "Filtres par période",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 1900,
    badge: "Le plus populaire",
    recommended: true,
    description: "Pour les e-commerçants qui veulent accélérer leur croissance.",
    cta: "Passer à Pro",
    features: [
      "Tout Essential",
      "Génération de Landing Pages par IA",
      "Génération de visuels produits par IA",
      "Création de contenus publicitaires",
      "Variations créatives pour les annonces",
      "Analytics avancés",
      "Comparaison des périodes",
      "Insights commerciaux",
      "Rapports avancés",
      "Prévisions de ventes",
      "Suggestions d'optimisation",
      "Bibliothèque créative",
    ],
  },
  {
    id: "ELITE",
    name: "Elite",
    price: 2900,
    badge: "Ultime",
    description: "Une suite complète pour construire et développer votre commerce.",
    cta: "Choisir Elite",
    features: [
      "Tout Pro",
      "AI Product Studio",
      "Génération de visuels publicitaires",
      "Génération de textes publicitaires",
      "Analytics avancés",
      "Prévisions commerciales",
      "Insights IA",
      "Branding personnalisé",
      "Rapports premium",
      "Priorité sur les nouvelles fonctionnalités",
    ],
    comingSoon: [
      "Création de boutique en ligne par IA",
      "Génération de site e-commerce",
      "Landing Pages avancées",
      "Génération illimitée de concepts créatifs",
      "Gestion multi-boutiques",
    ],
  },
];
