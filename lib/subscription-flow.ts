import {
  normalizeWhatsappNumber,
  type PremiumContact,
  type ResolvedPlan,
} from "@/lib/premium-config";
import type { OfferId } from "@/lib/plans";

/**
 * The activation flow is intentionally channel-agnostic:
 * SELECT PLAN → REVIEW → CONTACT / PAYMENT → ACTIVATION → ACTIVE PLAN
 *
 * Today the CONTACT step is fulfilled by WhatsApp and Email. When an online
 * payment gateway is added it becomes an extra channel here, and the Premium UI
 * does not change.
 */
export const SUBSCRIPTION_STEPS = ["select", "review", "contact", "activation", "active"] as const;
export type SubscriptionStep = (typeof SUBSCRIPTION_STEPS)[number];

export const SUBSCRIPTION_STEP_LABEL: Record<SubscriptionStep, string> = {
  select: "Choix de l’offre",
  review: "Récapitulatif",
  contact: "Contact",
  activation: "Activation",
  active: "Offre active",
};

export type ChannelId = "whatsapp" | "email" | "payment";

export type ActivationChannel = {
  id: ChannelId;
  label: string;
  hint: string;
  /** `false` renders as disabled with a "bientôt" note. No fake functionality. */
  enabled: boolean;
  href: string | null;
};

/** Everything needed to compose a request. No payment or card data is ever collected. */
export type ActivationRequest = {
  planId: OfferId;
  ownerName: string;
  storeName: string;
  phone: string;
  monthlyOrders: string;
  message: string;
};

export function emptyActivationRequest(
  planId: OfferId,
  ownerName: string,
  storeName: string,
): ActivationRequest {
  return { planId, ownerName, storeName, phone: "", monthlyOrders: "", message: "" };
}

type Tokens = {
  planName: string;
  price: string;
  ownerName: string;
  storeName: string;
};

function fillTemplate(template: string, tokens: Tokens): string {
  return template
    .replace(/\{planName\}/g, tokens.planName)
    .replace(/\{price\}/g, tokens.price)
    .replace(/\{ownerName\}/g, tokens.ownerName)
    .replace(/\{storeName\}/g, tokens.storeName);
}

function tokensFor(plan: ResolvedPlan, request: ActivationRequest): Tokens {
  return {
    planName: plan.name,
    price: plan.messagePrice,
    ownerName: request.ownerName.trim() || "—",
    storeName: request.storeName.trim() || "—",
  };
}

function extraLines(request: ActivationRequest): string[] {
  const lines: string[] = [];
  if (request.phone.trim()) {
    lines.push("", "Téléphone:", request.phone.trim());
  }
  if (request.monthlyOrders.trim()) {
    lines.push("", "Commandes par mois:", request.monthlyOrders.trim());
  }
  if (request.message.trim()) {
    lines.push("", "Message:", request.message.trim());
  }
  return lines;
}

export function buildWhatsappMessage(plan: ResolvedPlan, request: ActivationRequest): string {
  const base = fillTemplate(plan.contactMessage.whatsapp, tokensFor(plan, request));
  return [base, ...extraLines(request)].join("\n");
}

export function buildEmailSubject(plan: ResolvedPlan, request: ActivationRequest): string {
  return fillTemplate(plan.contactMessage.emailSubject, tokensFor(plan, request));
}

export function buildEmailBody(plan: ResolvedPlan, request: ActivationRequest): string {
  const tokens = tokensFor(plan, request);
  const base = fillTemplate(plan.contactMessage.emailBody, tokens);
  const extras = extraLines(request);
  if (extras.length === 0) return base;
  // Keep the closing line last.
  const lines = base.split("\n");
  const closing = lines.pop() ?? "";
  return [...lines, ...extras, "", closing].join("\n");
}

export function buildWhatsappUrl(
  contact: PremiumContact,
  plan: ResolvedPlan,
  request: ActivationRequest,
): string | null {
  const number = normalizeWhatsappNumber(contact.whatsappNumber);
  if (number.length < 8) return null;
  const text = encodeURIComponent(buildWhatsappMessage(plan, request));
  return `https://wa.me/${number}?text=${text}`;
}

export function buildMailtoUrl(
  contact: PremiumContact,
  plan: ResolvedPlan,
  request: ActivationRequest,
): string | null {
  const email = contact.email.trim();
  if (!email) return null;
  const subject = encodeURIComponent(buildEmailSubject(plan, request));
  const body = encodeURIComponent(buildEmailBody(plan, request));
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

/**
 * Links for a general advisory request, before any offer has been chosen.
 * Same channels as an activation request, without committing to a plan.
 */
export function buildAdvisorLinks(
  contact: PremiumContact,
  ownerName: string,
  storeName: string,
): { whatsapp: string | null; email: string | null } {
  const lines = [
    "Bonjour, je souhaite être conseillé sur les offres Chic Fragrance.",
    "",
    "Nom:",
    ownerName.trim() || "—",
    "",
    "Boutique:",
    storeName.trim() || "—",
  ];
  const number = normalizeWhatsappNumber(contact.whatsappNumber);
  const email = contact.email.trim();

  return {
    whatsapp: number.length >= 8 ? `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}` : null,
    email: email
      ? `mailto:${email}?subject=${encodeURIComponent(
          "Demande de conseil — Chic Fragrance",
        )}&body=${encodeURIComponent([...lines, "", "Merci."].join("\n"))}`
      : null,
  };
}

export function getActivationChannels(
  contact: PremiumContact,
  plan: ResolvedPlan,
  request: ActivationRequest,
): ActivationChannel[] {
  const whatsapp = buildWhatsappUrl(contact, plan, request);
  const mailto = buildMailtoUrl(contact, plan, request);

  return [
    {
      id: "whatsapp",
      label: "WhatsApp",
      hint: "Réponse rapide de notre équipe",
      enabled: Boolean(whatsapp),
      href: whatsapp,
    },
    {
      id: "email",
      label: "Email",
      hint: contact.email.trim() || "Email à configurer",
      enabled: Boolean(mailto),
      href: mailto,
    },
    {
      id: "payment",
      label: "Paiement en ligne",
      hint: "Bientôt disponible",
      enabled: false,
      href: null,
    },
  ];
}
