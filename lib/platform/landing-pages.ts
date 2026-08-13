import "server-only";

import { createId, nowIso, slugify } from "@/lib/platform/ids";
import { canCreateLandingPage } from "@/lib/platform/plan-features";
import { AuthError } from "@/lib/platform/session";
import { readDatabase, updateDatabase } from "@/lib/platform/store";
import type {
  LandingPage,
  LandingPageSection,
  LandingPageStatus,
} from "@/lib/platform/types";

function defaultSections(): LandingPageSection[] {
  return [
    {
      id: "hero",
      type: "hero",
      visible: true,
      order: 0,
      content: {
        headline: "Votre titre accrocheur",
        subheadline: "Une promesse claire pour votre audience.",
        cta: "Commander maintenant",
        imageUrl: "",
      },
    },
    {
      id: "product",
      type: "product",
      visible: true,
      order: 1,
      content: {
        title: "Le produit",
        description: "Décrivez les bénéfices principaux.",
        price: "",
        imageUrl: "",
      },
    },
    {
      id: "benefits",
      type: "benefits",
      visible: true,
      order: 2,
      content: {
        items: [
          { title: "Bénéfice 1", text: "Détail" },
          { title: "Bénéfice 2", text: "Détail" },
          { title: "Bénéfice 3", text: "Détail" },
        ],
      },
    },
    {
      id: "offer",
      type: "offer",
      visible: true,
      order: 3,
      content: { title: "Offre spéciale", text: "Détails de l'offre", badge: "-20%" },
    },
    {
      id: "testimonials",
      type: "testimonials",
      visible: true,
      order: 4,
      content: {
        items: [{ name: "Client", quote: "Un avis positif." }],
      },
    },
    {
      id: "faq",
      type: "faq",
      visible: true,
      order: 5,
      content: {
        items: [{ q: "Question ?", a: "Réponse." }],
      },
    },
    {
      id: "cta",
      type: "cta",
      visible: true,
      order: 6,
      content: { headline: "Prêt à commander ?", button: "Acheter" },
    },
    {
      id: "footer",
      type: "footer",
      visible: true,
      order: 7,
      content: { text: "© Boutique" },
    },
  ];
}

export async function listLandingPages(organizationId: string) {
  const db = await readDatabase();
  return db.landingPages
    .filter((p) => p.organizationId === organizationId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getLandingPage(organizationId: string, id: string) {
  const db = await readDatabase();
  return (
    db.landingPages.find(
      (p) => p.id === id && p.organizationId === organizationId,
    ) ?? null
  );
}

export async function createLandingPage(input: {
  organizationId: string;
  createdBy: string;
  name: string;
  plan: import("@/lib/plans").PlanId;
  productId?: string | null;
  objective?: string | null;
  angle?: string | null;
}): Promise<LandingPage> {
  const db = await readDatabase();
  const count = db.landingPages.filter(
    (p) => p.organizationId === input.organizationId && p.status !== "ARCHIVED",
  ).length;

  if (!canCreateLandingPage(input.plan, count)) {
    throw new AuthError(
      "PLAN_LIMIT",
      "Limite de landing pages atteinte pour votre plan.",
      402,
    );
  }

  const timestamp = nowIso();
  const baseSlug = slugify(input.name) || "landing";
  let slug = baseSlug;
  let i = 2;
  while (
    db.landingPages.some(
      (p) => p.organizationId === input.organizationId && p.slug === slug,
    )
  ) {
    slug = `${baseSlug}-${i}`;
    i += 1;
  }

  const page: LandingPage = {
    id: createId("lp"),
    organizationId: input.organizationId,
    createdBy: input.createdBy,
    name: input.name.trim(),
    slug,
    status: "DRAFT",
    productId: input.productId ?? null,
    objective: input.objective ?? null,
    angle: input.angle ?? null,
    content: { sections: defaultSections() },
    theme: {
      primaryColor: "#134e3a",
      backgroundColor: "#f7f4ee",
      fontFamily: "Playfair Display",
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: null,
  };

  await updateDatabase((d) => {
    d.landingPages.push(page);
  });

  return page;
}

export async function updateLandingPage(
  organizationId: string,
  id: string,
  patch: Partial<
    Pick<
      LandingPage,
      "name" | "slug" | "status" | "content" | "theme" | "objective" | "angle" | "productId"
    >
  >,
): Promise<LandingPage> {
  let updated!: LandingPage;
  await updateDatabase((db) => {
    const page = db.landingPages.find(
      (p) => p.id === id && p.organizationId === organizationId,
    );
    if (!page) {
      throw new AuthError("NOT_FOUND", "Landing page introuvable.", 404);
    }
    Object.assign(page, patch);
    page.updatedAt = nowIso();
    if (patch.status === "PUBLISHED") {
      page.publishedAt = nowIso();
    }
    updated = page;
  });
  return updated;
}

export async function setLandingPageStatus(
  organizationId: string,
  id: string,
  status: LandingPageStatus,
): Promise<LandingPage> {
  return updateLandingPage(organizationId, id, { status });
}

/**
 * AI generation abstraction. Returns a structured draft.
 * Does not call an external AI API until one is configured.
 */
export async function generateLandingPage(input: {
  productName: string;
  productDescription?: string;
  price?: string;
  offer?: string;
  audience?: string;
  angle?: string;
  cta?: string;
}): Promise<{ sections: LandingPageSection[]; provider: "template" | "ai" }> {
  const configured =
    Boolean(process.env.OPENAI_API_KEY?.trim()) ||
    Boolean(process.env.ANTHROPIC_API_KEY?.trim()) ||
    Boolean(process.env.GOOGLE_AI_API_KEY?.trim());

  // Placeholder structure until an AI provider is wired.
  const sections = defaultSections();
  const hero = sections.find((s) => s.type === "hero");
  if (hero) {
    hero.content = {
      headline: input.productName,
      subheadline:
        input.productDescription ||
        `Découvrez ${input.productName}${input.angle ? ` — angle ${input.angle}` : ""}.`,
      cta: input.cta || "Commander maintenant",
      imageUrl: "",
    };
  }
  const product = sections.find((s) => s.type === "product");
  if (product) {
    product.content = {
      title: input.productName,
      description: input.productDescription || "",
      price: input.price || "",
      imageUrl: "",
    };
  }
  const offer = sections.find((s) => s.type === "offer");
  if (offer && input.offer) {
    offer.content = {
      title: "Offre",
      text: input.offer,
      badge: "Offre",
    };
  }

  return {
    sections,
    provider: configured ? "ai" : "template",
  };
}

export async function adminLandingPageStats() {
  const db = await readDatabase();
  const pages = db.landingPages;
  const orgIds = new Set(pages.map((p) => p.organizationId));
  return {
    total: pages.length,
    published: pages.filter((p) => p.status === "PUBLISHED").length,
    drafts: pages.filter((p) => p.status === "DRAFT").length,
    archived: pages.filter((p) => p.status === "ARCHIVED").length,
    organizationsUsing: orgIds.size,
  };
}
