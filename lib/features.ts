import type { PlanId } from "@/lib/plans";

export const FEATURE_IDS = [
  "DASHBOARD",
  "ORDERS",
  "GOOGLE_SHEETS",
  "EXPENSES",
  "DELIVERY_TRACKING",
  "ADVANCED_FILTERS",
  "REPORTS",
  "CUSTOMERS",
  "ADVANCED_ANALYTICS",
  "PERIOD_COMPARISON",
  "SALES_FORECAST",
  "ADVANCED_REPORTS",
  "PREMIUM_REPORTS",
  "AI_LANDING_PAGE",
  "AI_PRODUCT_IMAGES",
  "AI_AD_CREATIVES",
  "AI_INSIGHTS",
  "AI_ASSISTANT",
  "AUTOMATIONS",
  "META_PIXEL",
  "APIS",
  "AI_STORE_BUILDER",
  "MULTI_STORE",
  "CUSTOM_BRANDING",
  "PRIORITY_FEATURES",
] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];

export const FEATURE_CATEGORIES = [
  "Gestion",
  "Analytics",
  "IA",
  "Automatisation",
  "Intégrations",
  "Store",
] as const;

export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];

export type FeatureDefinition = {
  id: FeatureId;
  label: string;
  requiredPlan: PlanId;
  available: boolean;
  category: FeatureCategory;
};

export const FEATURES: FeatureDefinition[] = [
  { id: "DASHBOARD", label: "Dashboard", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "ORDERS", label: "Commandes", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "EXPENSES", label: "Dépenses", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "DELIVERY_TRACKING", label: "Suivi des livraisons", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "ADVANCED_FILTERS", label: "Filtres avancés", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "CUSTOMERS", label: "Clients", requiredPlan: "ESSENTIAL", available: true, category: "Gestion" },
  { id: "GOOGLE_SHEETS", label: "Google Sheets", requiredPlan: "ESSENTIAL", available: true, category: "Intégrations" },
  { id: "META_PIXEL", label: "Meta / Pixel", requiredPlan: "PRO", available: false, category: "Intégrations" },
  { id: "APIS", label: "APIs", requiredPlan: "ELITE", available: false, category: "Intégrations" },
  { id: "REPORTS", label: "Rapports essentiels", requiredPlan: "ESSENTIAL", available: true, category: "Analytics" },
  { id: "ADVANCED_ANALYTICS", label: "Analytics avancés", requiredPlan: "PRO", available: false, category: "Analytics" },
  { id: "PERIOD_COMPARISON", label: "Comparaison des périodes", requiredPlan: "PRO", available: false, category: "Analytics" },
  { id: "SALES_FORECAST", label: "Prévisions commerciales", requiredPlan: "PRO", available: false, category: "Analytics" },
  { id: "ADVANCED_REPORTS", label: "Rapports avancés", requiredPlan: "PRO", available: false, category: "Analytics" },
  { id: "PREMIUM_REPORTS", label: "Rapports premium", requiredPlan: "ELITE", available: false, category: "Analytics" },
  { id: "AI_LANDING_PAGE", label: "AI Landing Page", requiredPlan: "PRO", available: false, category: "IA" },
  { id: "AI_PRODUCT_IMAGES", label: "AI Product Studio", requiredPlan: "PRO", available: false, category: "IA" },
  { id: "AI_AD_CREATIVES", label: "Créatifs publicitaires", requiredPlan: "PRO", available: false, category: "IA" },
  { id: "AI_INSIGHTS", label: "Insights IA", requiredPlan: "PRO", available: false, category: "IA" },
  { id: "AI_ASSISTANT", label: "AI Business Assistant", requiredPlan: "ELITE", available: false, category: "IA" },
  { id: "AUTOMATIONS", label: "Automatisations", requiredPlan: "PRO", available: false, category: "Automatisation" },
  { id: "AI_STORE_BUILDER", label: "Store Builder", requiredPlan: "ELITE", available: false, category: "Store" },
  { id: "MULTI_STORE", label: "Multi-store", requiredPlan: "ELITE", available: false, category: "Store" },
  { id: "CUSTOM_BRANDING", label: "Branding personnalisé", requiredPlan: "ELITE", available: false, category: "Store" },
  { id: "PRIORITY_FEATURES", label: "Priorité nouvelles fonctionnalités", requiredPlan: "ELITE", available: false, category: "Store" },
];

export const FEATURE_GRID = [
  {
    id: "analytics",
    icon: "chart",
    name: "Analytics",
    description: "Commandes, CA, taux de livraison, ROAS, CPA.",
    detail: "Pilotez la performance à partir des données Sheets.",
    feature: "ADVANCED_ANALYTICS" as const,
    badge: "PRO" as const,
  },
  {
    id: "studio",
    icon: "spark",
    name: "AI Studio",
    description: "Landing pages, images, textes et créatifs.",
    detail: "Générez une page de vente à partir de votre produit.",
    feature: "AI_PRODUCT_IMAGES" as const,
    badge: "PRO" as const,
  },
  {
    id: "integrations",
    icon: "link",
    name: "Integrations",
    description: "Google Sheets, Meta, Pixel, APIs.",
    detail: "Une source de vérité, plusieurs destinations.",
    feature: "GOOGLE_SHEETS" as const,
    badge: "ESSENTIAL" as const,
  },
  {
    id: "automations",
    icon: "bolt",
    name: "Automations",
    description: "Automatiser les tâches répétitives.",
    detail: "Commandes, dépenses et rapports sans saisie manuelle.",
    feature: "AUTOMATIONS" as const,
    badge: "PRO" as const,
  },
  {
    id: "store",
    icon: "store",
    name: "Store Builder",
    description: "Créer votre boutique e-commerce.",
    detail: "Module Elite. Génération de boutique non active.",
    feature: "AI_STORE_BUILDER" as const,
    badge: "ELITE" as const,
  },
  {
    id: "forecast",
    icon: "trend",
    name: "Forecast",
    description: "Prévoir ventes, dépenses et performances.",
    detail: "Projections commerciales à partir de l’historique.",
    feature: "SALES_FORECAST" as const,
    badge: "PRO" as const,
  },
  {
    id: "reports",
    icon: "report",
    name: "Reports",
    description: "Rapports et analyses avancées.",
    detail: "Exports et lectures opérationnelles de l’activité.",
    feature: "ADVANCED_REPORTS" as const,
    badge: "PRO" as const,
  },
  {
    id: "customers",
    icon: "users",
    name: "Customers",
    description: "Centraliser les données clients.",
    detail: "Nom, téléphone, wilaya et historique commandes.",
    feature: "CUSTOMERS" as const,
    badge: "ESSENTIAL" as const,
  },
] as const;
