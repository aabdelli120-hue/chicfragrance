import { OFFER_DISPLAY_NAME, type OfferId } from "@/lib/plans";

export const ASSISTANT_NAME = "Chic Assistant";
export const ASSISTANT_SUBTITLE =
  "Votre espace pour choisir une offre et contacter notre équipe.";

export type AssistantIntent =
  | "pricing"
  | "plans"
  | "comparison"
  | "landing"
  | "ai"
  | "creative"
  | "store"
  | "automation"
  | "analytics"
  | "custom"
  | "contact"
  | "recommendation"
  | "fallback";

export type AssistantActionId =
  | "show-plans"
  | "compare-plans"
  | "talk-to-advisor"
  | "create-request"
  | "start-recommendation"
  | `choose:${OfferId}`;

export type AssistantAction = {
  id: AssistantActionId;
  label: string;
};

export type AssistantReply = {
  intent: AssistantIntent;
  /** Paragraphs, rendered as separate lines in the bubble. */
  lines: string[];
  /** Offers quoted inline as "GROW — 1 900 DA/mois". */
  quote?: OfferId[];
  actions: AssistantAction[];
};

export const QUICK_ACTIONS: AssistantAction[] = [
  { id: "show-plans", label: "Voir les offres" },
  { id: "compare-plans", label: "Comparer les plans" },
  { id: "talk-to-advisor", label: "Parler à un conseiller" },
  { id: "create-request", label: "Créer une demande" },
];

const CONTACT_ACTION: AssistantAction = { id: "talk-to-advisor", label: "Parler à un conseiller" };
const COMPARE_ACTION: AssistantAction = { id: "compare-plans", label: "Comparer les plans" };

/** Actions always carry the commercial name, never the internal plan id. */
export function chooseAction(plan: OfferId, label?: string): AssistantAction {
  return {
    id: `choose:${plan}`,
    label: label ?? `Choisir ${OFFER_DISPLAY_NAME[plan]}`,
  };
}

export const CHOOSE_ANY_OFFER: AssistantAction[] = [
  chooseAction("ESSENTIAL"),
  chooseAction("PRO"),
  chooseAction("ELITE"),
  chooseAction("CUSTOM", "Parler à un expert"),
];

const KEYWORDS: Array<{ intent: AssistantIntent; terms: string[] }> = [
  { intent: "landing", terms: ["landing", "page de vente", "tunnel", "lp"] },
  {
    intent: "creative",
    terms: ["visuel", "image", "creatif", "créatif", "photo", "creative studio", "design produit"],
  },
  { intent: "store", terms: ["boutique", "store", "site", "e-commerce", "ecommerce", "domaine"] },
  {
    intent: "automation",
    terms: ["automat", "automatisation", "workflow", "declencheur", "déclencheur", "regle", "règle"],
  },
  {
    intent: "analytics",
    terms: ["analytic", "statistique", "kpi", "roas", "cpa", "rapport", "livraison", "performance"],
  },
  { intent: "ai", terms: ["ia", "ai", "intelligence artificielle", "assistant", "gpt"] },
  {
    intent: "custom",
    terms: ["sur mesure", "devis", "api", "multi", "plusieurs boutiques", "personnalis", "equipe", "équipe"],
  },
  { intent: "comparison", terms: ["comparer", "comparaison", "difference", "différence", "versus", "vs"] },
  { intent: "pricing", terms: ["prix", "tarif", "combien", "coute", "coûte", "cout", "coût", "dzd", "da/mois"] },
  { intent: "plans", terms: ["offre", "plan", "abonnement", "formule", "premium", "start", "grow", "elite"] },
  {
    intent: "contact",
    terms: ["contact", "whatsapp", "email", "mail", "telephone", "téléphone", "conseiller", "parler", "souscrire", "payer", "paiement"],
  },
  { intent: "recommendation", terms: ["conseil", "recommand", "quel plan", "quelle offre", "aide", "adapte", "adapté"] },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function detectIntent(input: string): AssistantIntent {
  const text = normalize(input);
  if (!text.trim()) return "fallback";
  for (const entry of KEYWORDS) {
    if (entry.terms.some((term) => text.includes(normalize(term)))) {
      return entry.intent;
    }
  }
  return "fallback";
}

export function replyForIntent(intent: AssistantIntent): AssistantReply {
  switch (intent) {
    case "pricing":
      return {
        intent,
        lines: ["Voici nos offres mensuelles. Aucun paiement n'est demandé dans l'application."],
        quote: ["ESSENTIAL", "PRO", "ELITE"],
        actions: [COMPARE_ACTION, chooseAction("PRO"), CONTACT_ACTION],
      };
    case "plans":
      return {
        intent,
        lines: [
          "Trois offres mensuelles et une offre sur mesure.",
          "START pour la gestion, GROW pour l'analytics et l'IA, ELITE pour la suite complète.",
        ],
        quote: ["ESSENTIAL", "PRO", "ELITE", "CUSTOM"],
        actions: [
          { id: "show-plans", label: "Voir les offres" },
          { id: "start-recommendation", label: "Obtenir une recommandation" },
        ],
      };
    case "comparison":
      return {
        intent,
        lines: [
          "Le tableau « Comparez les capacités » détaille chaque catégorie: gestion, analytics, publicité, IA, création, automatisation, intégrations et store.",
        ],
        actions: [COMPARE_ACTION, { id: "start-recommendation", label: "Obtenir une recommandation" }],
      };
    case "landing":
      return {
        intent,
        lines: ["Les Landing Pages IA sont incluses dans GROW et ELITE."],
        quote: ["PRO", "ELITE"],
        actions: [chooseAction("PRO"), chooseAction("ELITE"), CONTACT_ACTION],
      };
    case "creative":
      return {
        intent,
        lines: [
          "La génération de visuels produit et de créatifs publicitaires est incluse dans GROW. Le Creative Studio avancé est réservé à ELITE.",
        ],
        quote: ["PRO", "ELITE"],
        actions: [chooseAction("PRO"), chooseAction("ELITE"), CONTACT_ACTION],
      };
    case "store":
      return {
        intent,
        lines: [
          "Le Store Builder fait partie de l'offre ELITE et n'est pas encore disponible.",
          "Il est présenté comme module à venir: produits, design, boutique, domaine, commandes, analytics.",
        ],
        quote: ["ELITE"],
        actions: [chooseAction("ELITE"), CONTACT_ACTION],
      };
    case "automation":
      return {
        intent,
        lines: [
          "Les règles d'automatisation appartiennent à ELITE et sont annoncées comme bientôt disponibles.",
          "GROW inclut déjà l'actualisation automatique des KPI après chaque synchronisation.",
        ],
        quote: ["PRO", "ELITE"],
        actions: [chooseAction("ELITE"), chooseAction("PRO"), CONTACT_ACTION],
      };
    case "analytics":
      return {
        intent,
        lines: [
          "Les analytics avancés, la comparaison de périodes et les métriques CPA / ROAS / livraison sont inclus à partir de GROW.",
        ],
        quote: ["PRO", "ELITE"],
        actions: [chooseAction("PRO"), COMPARE_ACTION],
      };
    case "ai":
      return {
        intent,
        lines: [
          "L'assistant marketing IA et la génération de contenus démarrent avec GROW. L'AI Business Assistant est inclus dans ELITE.",
        ],
        quote: ["PRO", "ELITE"],
        actions: [chooseAction("PRO"), chooseAction("ELITE"), CONTACT_ACTION],
      };
    case "custom":
      return {
        intent,
        lines: [
          "L'offre SUR MESURE couvre les intégrations personnalisées, les boutiques multiples, les dashboards dédiés et la configuration d'équipe.",
          "Le tarif est établi sur devis.",
        ],
        quote: ["CUSTOM"],
        actions: [
          chooseAction("CUSTOM", "Parler à un expert"),
          { id: "create-request", label: "Créer une demande" },
        ],
      };
    case "contact":
      return {
        intent,
        lines: [
          "L'activation se fait avec notre équipe: aucune information bancaire n'est demandée dans l'application.",
          "Choisissez une offre, puis envoyez votre demande via WhatsApp ou Email.",
        ],
        actions: [
          { id: "create-request", label: "Créer une demande" },
          { id: "show-plans", label: "Voir les offres" },
        ],
      };
    case "recommendation":
      return {
        intent,
        lines: ["Deux questions suffisent pour vous orienter."],
        actions: [{ id: "start-recommendation", label: "Démarrer la recommandation" }],
      };
    default:
      return {
        intent: "fallback",
        lines: [
          "Je peux vous renseigner sur les offres, les prix, l'analytics, l'IA, les landing pages, les créatifs, les automatisations et le store builder.",
          "Que souhaitez-vous faire ?",
        ],
        actions: QUICK_ACTIONS,
      };
  }
}

/* ------------------------------------------------------------------ *
 * Recommandation — règles simples et explicites, pas d'IA.
 * ------------------------------------------------------------------ */

export const VOLUME_OPTIONS = ["0–50", "50–200", "200–500", "500+"] as const;
export type VolumeOption = (typeof VOLUME_OPTIONS)[number];

export const FOCUS_OPTIONS = [
  "Gestion des commandes",
  "Publicité",
  "Landing Pages",
  "Création de visuels",
  "Analytics",
  "Automatisation",
  "Boutique",
] as const;
export type FocusOption = (typeof FOCUS_OPTIONS)[number];

const VOLUME_SCORE: Record<VolumeOption, number> = {
  "0–50": 0,
  "50–200": 1,
  "200–500": 2,
  "500+": 3,
};

export type Recommendation = {
  offer: Exclude<OfferId, "CUSTOM">;
  /** Commercial name of the recommended offer. */
  label: string;
  reason: string;
};

export function recommendPlan(volume: VolumeOption, focus: FocusOption): Recommendation {
  const score = VOLUME_SCORE[volume];

  function result(offer: Exclude<OfferId, "CUSTOM">, reason: string): Recommendation {
    return { offer, label: OFFER_DISPLAY_NAME[offer], reason };
  }

  if (focus === "Automatisation" || focus === "Boutique") {
    return result(
      "ELITE",
      `${focus} relève des modules ELITE (automatisations et store builder).`,
    );
  }

  if (focus === "Gestion des commandes") {
    return score >= 2
      ? result(
          "PRO",
          `À ${volume} commandes par mois, l'analytics avancé et les rapports font gagner du temps sur la gestion.`,
        )
      : result(
          "ESSENTIAL",
          `À ${volume} commandes par mois, les outils de gestion essentiels suffisent.`,
        );
  }

  return score >= 3
    ? result(
        "ELITE",
        `${focus} à ${volume} commandes par mois demande la suite complète: studio IA, BI avancée et support prioritaire.`,
      )
    : result(
        "PRO",
        `${focus} est couvert par GROW: analytics avancés, performance publicitaire et génération IA.`,
      );
}
