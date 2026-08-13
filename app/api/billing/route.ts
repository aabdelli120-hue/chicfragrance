import { NextResponse } from "next/server";
import {
  authErrorResponse,
  requireOrganizationContext,
  requireSession,
} from "@/lib/platform/session";
import { readDatabase } from "@/lib/platform/store";
import { ensurePlatformSeeded } from "@/lib/platform/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();

    if (session.user.role === "PLATFORM_ADMIN") {
      return NextResponse.json({
        ok: true,
        plan: "ELITE",
        status: "active",
        billingReady: false,
      });
    }

    const { organizationId, organization } = await requireOrganizationContext();
    await ensurePlatformSeeded();
    const db = await readDatabase();
    const sub = db.subscriptions.find((s) => s.organizationId === organizationId);

    return NextResponse.json({
      ok: true,
      plan: organization?.plan ?? sub?.planId ?? "FREE",
      status: sub?.status ?? "inactive",
      billingReady: false,
    });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
