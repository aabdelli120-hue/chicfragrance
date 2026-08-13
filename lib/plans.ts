/**
 * Internal plan identifiers. These are persisted (organizations.plan,
 * subscriptions.planId) so they stay stable; the commercial names shown in the
 * product are START / GROW / ELITE (see `PLAN_DISPLAY_NAME`).
 */
export const PLAN_IDS = ["FREE", "ESSENTIAL", "PRO", "ELITE"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

/**
 * Commercial offers displayed in Premium. `FREE` is the implicit default, never
 * sold. `CUSTOM` (SUR MESURE) is quoted, never stored as a subscription tier.
 */
export const OFFER_IDS = ["ESSENTIAL", "PRO", "ELITE", "CUSTOM"] as const;
export type OfferId = (typeof OFFER_IDS)[number];

/** Offers compared side by side in the capability matrix. */
export const TIER_IDS = ["ESSENTIAL", "PRO", "ELITE"] as const;
export type TierId = (typeof TIER_IDS)[number];

export const PLAN_RANK: Record<PlanId, number> = {
  FREE: 0,
  ESSENTIAL: 1,
  PRO: 2,
  ELITE: 3,
};

/** Commercial names. Internal ids are never shown to customers. */
export const PLAN_DISPLAY_NAME: Record<PlanId, string> = {
  FREE: "Gratuit",
  ESSENTIAL: "START",
  PRO: "GROW",
  ELITE: "ELITE",
};

export const OFFER_DISPLAY_NAME: Record<OfferId, string> = {
  ESSENTIAL: "START",
  PRO: "GROW",
  ELITE: "ELITE",
  CUSTOM: "SUR MESURE",
};

export function isPlanId(id: OfferId): id is Exclude<OfferId, "CUSTOM"> {
  return id !== "CUSTOM";
}

export type PlanAvailability = "available" | "partial" | "coming-soon";

export const AVAILABILITY_LABEL: Record<PlanAvailability, string> = {
  available: "Disponible",
  partial: "Partiellement disponible",
  "coming-soon": "Bientôt disponible",
};

/** Small technical labels shown on each card as software capability levels. */
export const CAPABILITY_LABELS = [
  "MANAGEMENT",
  "ANALYTICS",
  "AI",
  "AUTOMATION",
  "STORE",
] as const;

export type CapabilityLabel = (typeof CAPABILITY_LABELS)[number];

export type PlanCapability = {
  label: CapabilityLabel;
  value: string;
  tone?: "on" | "partial" | "soon" | "off";
};

/**
 * Message templates. Tokens replaced at send time:
 * `{planName}`, `{price}`, `{ownerName}`, `{storeName}`.
 */
export type PlanContactMessage = {
  whatsapp: string;
  emailSubject: string;
  emailBody: string;
};

export type PlanDefinition = {
  id: OfferId;
  name: string;
  /** Monthly amount in DZD. `null` means the offer is quoted (sur devis). */
  price: number | null;
  period: "month" | null;
  quoteLabel?: string;
  description: string;
  badge?: string;
  recommended?: boolean;
  accent: "neutral" | "emerald" | "gold";
  cta: string;
  category: string;
  features: string[];
  comingSoon?: string[];
  capabilities: PlanCapability[];
  availability: PlanAvailability;
  contactMessage: PlanContactMessage;
};

const WHATSAPP_SUBSCRIBE = [
  "Bonjour, je souhaite souscrire à l'offre {planName} à {price}/mois sur Chic Fragrance.",
  "",
  "Nom:",
  "{ownerName}",
  "",
  "Boutique:",
  "{storeName}",
  "",
  "Offre:",
  "{planName}",
].join("\n");

const EMAIL_SUBSCRIBE = [
  "Bonjour,",
  "",
  "Je souhaite souscrire à l'offre {planName} à {price}/mois.",
  "",
  "Nom:",
  "{ownerName}",
  "",
  "Boutique:",
  "{storeName}",
  "",
  "Merci.",
].join("\n");

const CONTACT: PlanContactMessage = {
  whatsapp: WHATSAPP_SUBSCRIBE,
  emailSubject: "Demande d'abonnement — Chic Fragrance — {planName}",
  emailBody: EMAIL_SUBSCRIBE,
};

export const PLANS: PlanDefinition[] = [
  {
    id: "ESSENTIAL",
    name: "START",
    price: 900,
    period: "month",
    description: "Pour les marchands qui veulent les outils de gestion essentiels.",
    accent: "neutral",
    cta: "Choisir START",
    category: "MANAGEMENT",
    availability: "available",
    capabilities: [
      { label: "MANAGEMENT", value: "COMPLET", tone: "on" },
      { label: "ANALYTICS", value: "BASIQUE", tone: "partial" },
      { label: "AI", value: "NON INCLUS", tone: "off" },
      { label: "AUTOMATION", value: "NON INCLUS", tone: "off" },
      { label: "STORE", value: "NON INCLUS", tone: "off" },
    ],
    features: [
      "Dashboard",
      "Commandes",
      "Dépenses",
      "Synchronisation Google Sheets",
      "Suivi des livraisons",
      "Rapports basiques",
      "Analytics basiques",
      "Filtres par période",
    ],
    contactMessage: CONTACT,
  },
  {
    id: "PRO",
    name: "GROW",
    price: 1900,
    period: "month",
    badge: "LE PLUS POPULAIRE",
    recommended: true,
    description: "Analytics avancés, publicité et génération IA pour développer l’activité.",
    accent: "emerald",
    cta: "Choisir GROW",
    category: "ANALYTICS + AI",
    availability: "partial",
    capabilities: [
      { label: "ANALYTICS", value: "ADVANCED", tone: "on" },
      { label: "AI", value: "INCLUDED", tone: "on" },
      { label: "AUTOMATION", value: "PARTIAL", tone: "partial" },
      { label: "STORE", value: "COMING SOON", tone: "soon" },
    ],
    features: [
      "Tout START",
      "Analytics avancés",
      "Comparaison des périodes",
      "Performance publicitaire",
      "CPA / ROAS / taux de livraison",
      "Rapports avancés",
      "Assistant marketing IA",
      "Génération de landing pages IA",
      "Génération de visuels produit",
      "Génération de textes publicitaires",
      "Variations de créatifs",
      "Business insights",
    ],
    contactMessage: CONTACT,
  },
  {
    id: "ELITE",
    name: "ELITE",
    price: 2900,
    period: "month",
    badge: "ELITE",
    description: "Suite complète: studio IA, automatisations, intelligence et Store Builder.",
    accent: "gold",
    cta: "Choisir ELITE",
    category: "AI + AUTOMATION + STORE",
    availability: "partial",
    capabilities: [
      { label: "ANALYTICS", value: "ADVANCED", tone: "on" },
      { label: "AI", value: "FULL SUITE", tone: "on" },
      { label: "AUTOMATION", value: "INCLUDED", tone: "partial" },
      { label: "STORE", value: "COMING SOON", tone: "soon" },
    ],
    features: [
      "Tout GROW",
      "AI Product Studio",
      "Creative Studio avancé",
      "Landing pages avancées",
      "AI Business Assistant",
      "Automatisations",
      "Business intelligence avancée",
      "Branding personnalisé",
      "Support prioritaire",
      "Accès anticipé aux nouveautés",
    ],
    comingSoon: ["Store Builder"],
    contactMessage: CONTACT,
  },
  {
    id: "CUSTOM",
    name: "SUR MESURE",
    price: null,
    period: null,
    quoteLabel: "Sur devis",
    description: "Pour les activités qui ont besoin d’intégrations, de boutiques multiples et de workflows dédiés.",
    accent: "neutral",
    cta: "Parler à un expert",
    category: "PLATFORM",
    availability: "available",
    capabilities: [
      { label: "MANAGEMENT", value: "SUR MESURE", tone: "on" },
      { label: "AUTOMATION", value: "SUR MESURE", tone: "on" },
      { label: "STORE", value: "SUR ÉTUDE", tone: "partial" },
    ],
    features: [
      "Intégrations personnalisées",
      "Boutiques multiples",
      "Automatisation avancée",
      "Dashboards personnalisés",
      "API / intégrations",
      "Configuration d'équipe",
      "Workflows métier sur mesure",
    ],
    contactMessage: {
      whatsapp: [
        "Bonjour, je souhaite étudier une offre sur mesure pour mon activité sur Chic Fragrance.",
        "",
        "Nom:",
        "{ownerName}",
        "",
        "Boutique:",
        "{storeName}",
        "",
        "Offre:",
        "{planName}",
      ].join("\n"),
      emailSubject: "Demande d'offre sur mesure — Chic Fragrance",
      emailBody: [
        "Bonjour,",
        "",
        "Je souhaite étudier une offre sur mesure pour mon activité.",
        "",
        "Nom:",
        "{ownerName}",
        "",
        "Boutique:",
        "{storeName}",
        "",
        "Merci.",
      ].join("\n"),
    },
  },
];

export function findPlan(id: OfferId): PlanDefinition | undefined {
  return PLANS.find((plan) => plan.id === id);
}

export function planLabel(plan: PlanId): string {
  return PLAN_DISPLAY_NAME[plan];
}

export function offerLabel(offer: OfferId): string {
  return OFFER_DISPLAY_NAME[offer];
}
