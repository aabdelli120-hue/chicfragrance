import { NextResponse } from "next/server";
import {
  adminOverview,
  listOrganizationsForAdmin,
  listUsersForAdmin,
  setOrganizationPlan,
  setOrganizationStatus,
} from "@/lib/platform/admin";
import { adminLandingPageStats } from "@/lib/platform/landing-pages";
import {
  AuthError,
  authErrorResponse,
  requireRole,
} from "@/lib/platform/session";
import type { OrgStatus } from "@/lib/platform/types";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireRole(["PLATFORM_ADMIN"]);
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "overview";

    if (view === "organizations") {
      const organizations = await listOrganizationsForAdmin();
      return NextResponse.json({ ok: true, organizations });
    }
    if (view === "users") {
      const users = await listUsersForAdmin();
      return NextResponse.json({ ok: true, users });
    }
    if (view === "landing-pages") {
      const stats = await adminLandingPageStats();
      return NextResponse.json({ ok: true, stats });
    }

    const overview = await adminOverview();
    const landing = await adminLandingPageStats();
    return NextResponse.json({
      ok: true,
      overview: {
        ...overview,
        landingPagesTotal: landing.total,
        landingPagesPublished: landing.published,
        landingPagesDrafts: landing.drafts,
        organizationsUsingLandingPages: landing.organizationsUsing,
      },
    });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireRole(["PLATFORM_ADMIN"]);
    const body = (await request.json()) as {
      organizationId?: string;
      status?: OrgStatus;
      plan?: PlanId;
    };
    if (!body.organizationId) {
      throw new AuthError("VALIDATION", "organizationId requis.", 400);
    }
    if (body.status) {
      await setOrganizationStatus(
        body.organizationId,
        body.status,
        session.user.id,
      );
    }
    if (body.plan) {
      await setOrganizationPlan(body.organizationId, body.plan, session.user.id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
