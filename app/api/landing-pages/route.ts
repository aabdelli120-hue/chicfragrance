import { NextResponse } from "next/server";
import {
  createLandingPage,
  generateLandingPage,
  listLandingPages,
} from "@/lib/platform/landing-pages";
import {
  AuthError,
  authErrorResponse,
  requireOrganizationContext,
  requirePermission,
} from "@/lib/platform/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requirePermission("landing_pages.view");
    const { organizationId } = await requireOrganizationContext();
    const pages = await listLandingPages(organizationId);
    return NextResponse.json({ ok: true, pages });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission("landing_pages.create");
    const { organizationId, organization } = await requireOrganizationContext();
    const body = (await request.json()) as {
      name?: string;
      productId?: string;
      objective?: string;
      angle?: string;
      generate?: boolean;
      productName?: string;
      productDescription?: string;
      price?: string;
      offer?: string;
      audience?: string;
      cta?: string;
    };

    if (!body.name) {
      throw new AuthError("VALIDATION", "Nom requis.", 400);
    }

    const page = await createLandingPage({
      organizationId,
      createdBy: session.user.id,
      name: body.name,
      plan: organization!.plan,
      productId: body.productId,
      objective: body.objective,
      angle: body.angle,
    });

    if (body.generate && body.productName) {
      const generated = await generateLandingPage({
        productName: body.productName,
        productDescription: body.productDescription,
        price: body.price,
        offer: body.offer,
        audience: body.audience,
        angle: body.angle,
        cta: body.cta,
      });
      const { updateLandingPage } = await import("@/lib/platform/landing-pages");
      const updated = await updateLandingPage(organizationId, page.id, {
        content: { sections: generated.sections },
      });
      return NextResponse.json({
        ok: true,
        page: updated,
        generationProvider: generated.provider,
      });
    }

    return NextResponse.json({ ok: true, page });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
