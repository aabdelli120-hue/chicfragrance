import { formatDa, formatDzd } from "@/lib/format";
import {
  AVAILABILITY_LABEL,
  OFFER_IDS,
  PLANS,
  type OfferId,
  type PlanAvailability,
  type PlanDefinition,
} from "@/lib/plans";

/**
 * Premium configuration is deliberately separated from Google credentials.
 * Nothing here is secret: it is the business contact surface plus commercial overrides.
 */
export type PremiumContact = {
  whatsappNumber: string;
  email: string;
};

export type PlanOverride = {
  price?: number | null;
  badge?: string;
  availability?: PlanAvailability;
  features?: string[];
};

export type PremiumConfig = {
  contact: PremiumContact;
  plans: Partial<Record<OfferId, PlanOverride>>;
};

export const DEFAULT_PREMIUM_CONTACT: PremiumContact = {
  whatsappNumber: "+213 770 00 00 00",
  email: "contact@chicfragrance.dz",
};

export type ResolvedPlan = PlanDefinition & {
  /** Card price, e.g. "1 900 DZD" or "Sur devis". */
  priceLabel: string;
  /** "/mois" when the offer is a monthly subscription, otherwise `null`. */
  periodLabel: string | null;
  /** Price as written in WhatsApp/email messages, e.g. "1 900 DA". */
  messagePrice: string;
  featureCount: number;
  statusLabel: string;
};

function resolvePlan(plan: PlanDefinition, override: PlanOverride | undefined): ResolvedPlan {
  const price = override?.price === undefined ? plan.price : override.price;
  const resolvedPrice = typeof price === "number" ? price : plan.price;
  const availability = override?.availability ?? plan.availability;
  const features =
    override?.features && override.features.length > 0 ? override.features : plan.features;
  const badge = override?.badge === undefined ? plan.badge : override.badge || undefined;

  return {
    ...plan,
    price: resolvedPrice,
    badge,
    availability,
    features,
    priceLabel: formatDzd(resolvedPrice),
    periodLabel: "/mois",
    messagePrice: formatDa(resolvedPrice),
    featureCount: features.length,
    statusLabel: AVAILABILITY_LABEL[availability],
  };
}

export function resolvePlans(config: PremiumConfig): ResolvedPlan[] {
  return PLANS.map((plan) => resolvePlan(plan, config.plans[plan.id]));
}

export function findResolvedPlan(plans: ResolvedPlan[], id: OfferId): ResolvedPlan | undefined {
  return plans.find((plan) => plan.id === id);
}

/**
 * Turns a human-typed number into the digits-only form wa.me expects.
 * A local Algerian number (0xxxxxxxxx) is promoted to the +213 country code.
 */
export function normalizeWhatsappNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) return `213${digits.slice(1)}`;
  return digits;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export type PremiumConfigInput = {
  contact?: { whatsappNumber?: unknown; email?: unknown };
  plans?: Record<string, unknown>;
};

export function validatePremiumInput(input: PremiumConfigInput): string[] {
  const errors: string[] = [];

  if (input.contact) {
    const { whatsappNumber, email } = input.contact;
    if (whatsappNumber !== undefined) {
      if (typeof whatsappNumber !== "string") {
        errors.push("Le numéro WhatsApp est invalide.");
      } else if (normalizeWhatsappNumber(whatsappNumber).length < 8) {
        errors.push("Le numéro WhatsApp doit contenir au moins 8 chiffres.");
      }
    }
    if (email !== undefined) {
      if (typeof email !== "string" || !isValidEmail(email)) {
        errors.push("L'email professionnel est invalide.");
      }
    }
  }

  if (input.plans) {
    for (const [id, raw] of Object.entries(input.plans)) {
      if (!OFFER_IDS.includes(id as OfferId)) {
        errors.push(`Offre inconnue: ${id}.`);
        continue;
      }
      const override = raw as PlanOverride | null;
      if (!override || typeof override !== "object") {
        errors.push(`Configuration invalide pour l'offre ${id}.`);
        continue;
      }
      if (
        override.price !== undefined &&
        override.price !== null &&
        (typeof override.price !== "number" || !Number.isFinite(override.price) || override.price < 0)
      ) {
        errors.push(`Le prix de l'offre ${id} est invalide.`);
      }
      if (
        override.availability !== undefined &&
        !["available", "partial", "coming-soon"].includes(override.availability)
      ) {
        errors.push(`La disponibilité de l'offre ${id} est invalide.`);
      }
      if (override.features !== undefined && !Array.isArray(override.features)) {
        errors.push(`Les fonctionnalités de l'offre ${id} sont invalides.`);
      }
      if (override.badge !== undefined && typeof override.badge !== "string") {
        errors.push(`Le badge de l'offre ${id} est invalide.`);
      }
    }
  }

  return errors;
}
