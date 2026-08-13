import type { PlanId, TierId } from "@/lib/plans";

export const FEATURE_IDS = [
  "DASHBOARD",
  "ORDERS",
  "EXPENSES",
  "DELIVERY_TRACKING",
  "PERIOD_FILTERS",
  "CUSTOMERS",
  "PRIORITY_SUPPORT",
  "BASIC_REPORTS",
  "BASIC_ANALYTICS",
  "ADVANCED_ANALYTICS",
  "PERIOD_COMPARISON",
  "ADVANCED_REPORTS",
  "SALES_FORECAST",
  "ADVANCED_BI",
  "AD_SPEND",
  "AD_PERFORMANCE",
  "AD_METRICS",
  "AI_MARKETING_ASSISTANT",
  "AI_INSIGHTS",
  "AI_ASSISTANT",
  "AI_LANDING_PAGE",
  "AI_PRODUCT_IMAGES",
  "AI_AD_CREATIVES",
  "AI_CREATIVE_VARIATIONS",
  "CREATIVE_STUDIO",
  "AUTO_KPI_REFRESH",
  "AUTOMATIONS",
  "AUTO_REPORTS",
  "GOOGLE_SHEETS",
  "META_PIXEL",
  "APIS",
  "CUSTOM_INTEGRATIONS",
  "AI_STORE_BUILDER",
  "CUSTOM_BRANDING",
  "MULTI_STORE",
  "PRIORITY_FEATURES",
] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];

export const FEATURE_CATEGORIES = [
  "Gestion",
  "Analytics",
  "Publicité",
  "IA",
  "Création",
  "Automatisation",
  "Intégrations",
  "Store",
] as const;

export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];

export type FeatureDefinition = {
  id: FeatureId;
  label: string;
  requiredPlan: PlanId;
  /** `false` renders as "Bientôt" instead of a checkmark. Never claim unshipped work. */
  available: boolean;
  category: FeatureCategory;
};

export const FEATURES: FeatureDefinition[] = [
  { id: "DASHBOARD", label: "Dashboard", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "ORDERS", label: "Commandes", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "EXPENSES", label: "Dépenses", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "DELIVERY_TRACKING", label: "Suivi des livraisons", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "PERIOD_FILTERS", label: "Filtres par période", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "CUSTOMERS", label: "Clients", requiredPlan: "ESSENTIAL", available: false, category: "Gestion" },
  { id: "PRIORITY_SUPPORT", label: "Support prioritaire", requiredPlan: "ELITE", available: true, category: "Gestion" },

  { id: "BASIC_REPORTS", label: "Rapports basiques", requiredPlan: "ESSENTIAL", available: true, category: "Analytics" },
  { id: "BASIC_ANALYTICS", label: "Analytics basiques", requiredPlan: "ESSENTIAL", available: true, category: "Analytics" },
  { id: "ADVANCED_ANALYTICS", label: "Analytics avancés", requiredPlan: "PRO", available: false, category: "Analytics" },
  { id: "PERIOD_COMPARISON", label: "Comparaison des périodes", requiredPlan: "PRO", available: true, category: "Analytics" },
  { id: "ADVANCED_REPORTS", label: "Rapports avancés", requiredPlan: "PRO", available: false, category: "Analytics" },
  { id: "SALES_FORECAST", label: "Prévision des ventes", requiredPlan: "PRO", available: false, category: "Analytics" },
  { id: "ADVANCED_BI", label: "Business intelligence avancée", requiredPlan: "ELITE", available: false, category: "Analytics" },

  { id: "AD_SPEND", label: "Suivi des dépenses publicitaires", requiredPlan: "ESSENTIAL", available: true, category: "Publicité" },
  { id: "AD_PERFORMANCE", label: "Performance publicitaire", requiredPlan: "PRO", available: true, category: "Publicité" },
  { id: "AD_METRICS", label: "CPA / ROAS / taux de livraison", requiredPlan: "PRO", available: true, category: "Publicité" },

  { id: "AI_MARKETING_ASSISTANT", label: "Assistant marketing IA", requiredPlan: "PRO", available: false, category: "IA" },
  { id: "AI_INSIGHTS", label: "Business insights", requiredPlan: "PRO", available: false, category: "IA" },
  { id: "AI_ASSISTANT", label: "AI Business Assistant", requiredPlan: "ELITE", available: false, category: "IA" },

  { id: "AI_LANDING_PAGE", label: "Landing pages IA", requiredPlan: "PRO", available: false, category: "Création" },
  { id: "AI_PRODUCT_IMAGES", label: "Visuels produit IA", requiredPlan: "PRO", available: false, category: "Création" },
  { id: "AI_AD_CREATIVES", label: "Textes publicitaires IA", requiredPlan: "PRO", available: false, category: "Création" },
  { id: "AI_CREATIVE_VARIATIONS", label: "Variations de créatifs", requiredPlan: "PRO", available: false, category: "Création" },
  { id: "CREATIVE_STUDIO", label: "Creative Studio avancé", requiredPlan: "ELITE", available: false, category: "Création" },

  { id: "AUTO_KPI_REFRESH", label: "Actualisation automatique des KPI", requiredPlan: "ESSENTIAL", available: true, category: "Automatisation" },
  { id: "AUTOMATIONS", label: "Règles d’automatisation", requiredPlan: "ELITE", available: false, category: "Automatisation" },
  { id: "AUTO_REPORTS", label: "Rapports générés automatiquement", requiredPlan: "ELITE", available: false, category: "Automatisation" },

  { id: "GOOGLE_SHEETS", label: "Google Sheets", requiredPlan: "ESSENTIAL", available: true, category: "Intégrations" },
  { id: "META_PIXEL", label: "Meta / Pixel", requiredPlan: "PRO", available: false, category: "Intégrations" },
  { id: "APIS", label: "API", requiredPlan: "ELITE", available: false, category: "Intégrations" },
  { id: "CUSTOM_INTEGRATIONS", label: "Intégrations personnalisées", requiredPlan: "ELITE", available: false, category: "Intégrations" },

  { id: "AI_STORE_BUILDER", label: "Store Builder", requiredPlan: "ELITE", available: false, category: "Store" },
  { id: "CUSTOM_BRANDING", label: "Branding personnalisé", requiredPlan: "ELITE", available: false, category: "Store" },
  { id: "PRIORITY_FEATURES", label: "Accès anticipé aux nouveautés", requiredPlan: "ELITE", available: true, category: "Store" },
  { id: "MULTI_STORE", label: "Boutiques multiples", requiredPlan: "ELITE", available: false, category: "Store" },
];

export const FEATURE_GRID: ReadonlyArray<{
  id: string;
  icon: string;
  name: string;
  description: string;
  detail: string;
  feature: FeatureId;
  badge: TierId;
}> = [
  {
    id: "analytics",
    icon: "chart",
    name: "Analytics",
    description: "Commandes, CA, taux de livraison, ROAS, CPA.",
    detail: "Pilotez la performance à partir des données Sheets.",
    feature: "ADVANCED_ANALYTICS",
    badge: "PRO",
  },
  {
    id: "studio",
    icon: "spark",
    name: "AI Studio",
    description: "Landing pages, visuels, textes et créatifs.",
    detail: "Générez une page de vente à partir de votre produit.",
    feature: "AI_PRODUCT_IMAGES",
    badge: "PRO",
  },
  {
    id: "integrations",
    icon: "link",
    name: "Integrations",
    description: "Google Sheets, Meta, Pixel, APIs.",
    detail: "Une source de vérité, plusieurs destinations.",
    feature: "GOOGLE_SHEETS",
    badge: "ESSENTIAL",
  },
  {
    id: "automations",
    icon: "bolt",
    name: "Automations",
    description: "Automatiser les tâches répétitives.",
    detail: "Commandes, dépenses et rapports sans saisie manuelle.",
    feature: "AUTOMATIONS",
    badge: "PRO",
  },
  {
    id: "store",
    icon: "store",
    name: "Store Builder",
    description: "Créer votre boutique e-commerce.",
    detail: "Module Elite. Génération de boutique non active.",
    feature: "AI_STORE_BUILDER",
    badge: "ELITE",
  },
  {
    id: "forecast",
    icon: "trend",
    name: "Forecast",
    description: "Prévoir ventes, dépenses et performances.",
    detail: "Projections commerciales à partir de l’historique.",
    feature: "SALES_FORECAST",
    badge: "PRO",
  },
  {
    id: "reports",
    icon: "report",
    name: "Reports",
    description: "Rapports et analyses avancées.",
    detail: "Exports et lectures opérationnelles de l’activité.",
    feature: "ADVANCED_REPORTS",
    badge: "PRO",
  },
  {
    id: "customers",
    icon: "users",
    name: "Customers",
    description: "Centraliser les données clients.",
    detail: "Nom, téléphone, wilaya et historique commandes.",
    feature: "CUSTOMERS",
    badge: "ESSENTIAL",
  },
];
