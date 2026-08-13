import type { PlanId } from "@/lib/plans";

export const FEATURE_IDS = [
  "DASHBOARD",
  "ORDERS",
  "GOOGLE_SHEETS",
  "EXPENSES",
  "REPORTS",
  "ADVANCED_ANALYTICS",
  "AI_LANDING_PAGE",
  "AI_PRODUCT_IMAGES",
  "AI_AD_CREATIVES",
  "SALES_FORECAST",
  "AI_INSIGHTS",
  "AI_STORE_BUILDER",
  "MULTI_STORE",
  "CUSTOM_BRANDING",
] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];

export type FeatureDefinition = {
  id: FeatureId;
  label: string;
  requiredPlan: PlanId;
  available: boolean;
};

export const FEATURES: FeatureDefinition[] = [
  { id: "DASHBOARD", label: "Dashboard", requiredPlan: "ESSENTIAL", available: true },
  { id: "ORDERS", label: "Commandes", requiredPlan: "ESSENTIAL", available: true },
  { id: "GOOGLE_SHEETS", label: "Google Sheets", requiredPlan: "ESSENTIAL", available: true },
  { id: "EXPENSES", label: "Dépenses", requiredPlan: "ESSENTIAL", available: true },
  { id: "REPORTS", label: "Rapports", requiredPlan: "ESSENTIAL", available: true },
  { id: "ADVANCED_ANALYTICS", label: "Analytics avancés", requiredPlan: "PRO", available: false },
  { id: "AI_LANDING_PAGE", label: "AI Landing Page", requiredPlan: "PRO", available: false },
  { id: "AI_PRODUCT_IMAGES", label: "AI Product Studio", requiredPlan: "PRO", available: false },
  { id: "AI_AD_CREATIVES", label: "Ad Creative Generator", requiredPlan: "PRO", available: false },
  { id: "SALES_FORECAST", label: "Sales Forecast", requiredPlan: "PRO", available: false },
  { id: "AI_INSIGHTS", label: "AI Insights", requiredPlan: "PRO", available: false },
  { id: "AI_STORE_BUILDER", label: "Store Builder", requiredPlan: "ELITE", available: false },
  { id: "MULTI_STORE", label: "Multi-store", requiredPlan: "ELITE", available: false },
  { id: "CUSTOM_BRANDING", label: "Custom Branding", requiredPlan: "ELITE", available: false },
];
