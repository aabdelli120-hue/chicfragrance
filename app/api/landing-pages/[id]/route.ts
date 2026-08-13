import { NextResponse } from "next/server";
import {
  getLandingPage,
  setLandingPageStatus,
  updateLandingPage,
} from "@/lib/platform/landing-pages";
import {
  AuthError,
  authErrorResponse,
  requireOrganizationContext,
  requirePermission,
} from "@/lib/platform/session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requirePermission("landing_pages.view");
    const { organizationId } = await requireOrganizationContext();
    const { id } = await context.params;
    const page = await getLandingPage(organizationId, id);
    if (!page) {
      throw new AuthError("NOT_FOUND", "Landing page introuvable.", 404);
    }
    return NextResponse.json({ ok: true, page });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requirePermission("landing_pages.edit");
    const { organizationId } = await requireOrganizationContext();
    const { id } = await context.params;
    const body = await request.json();

    if (body.status === "PUBLISHED") {
      await requirePermission("landing_pages.publish");
      const page = await setLandingPageStatus(organizationId, id, "PUBLISHED");
      return NextResponse.json({ ok: true, page });
    }

    const page = await updateLandingPage(organizationId, id, body);
    return NextResponse.json({ ok: true, page });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
