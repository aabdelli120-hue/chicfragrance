import { NextResponse } from "next/server";
import { DEMO_ORDERS } from "@/lib/demo-data";
import { toErrorPayload } from "@/lib/errors";
import { getSheetsConfigStatus, readOrders } from "@/lib/google-sheets";
import {
  authErrorResponse,
  requireOrganizationContext,
  requirePermission,
} from "@/lib/platform/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requirePermission("orders.view");
    const { organizationId } = await requireOrganizationContext();
    const config = await getSheetsConfigStatus(organizationId);

    if (config.source === "google-sheets") {
      const orders = await readOrders(organizationId);
      return NextResponse.json({
        ok: true,
        source: config.source,
        message: config.message,
        missing: config.missing,
        organizationId,
        orders,
      });
    }

    if (config.source === "demo") {
      return NextResponse.json({
        ok: true,
        source: config.source,
        message: config.message,
        missing: config.missing,
        organizationId,
        orders: DEMO_ORDERS,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        source: config.source,
        message: config.message,
        missing: config.missing,
        organizationId,
        orders: [],
        error: config.message,
        code: "SHEETS_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth.status !== 500 || (error as { code?: string })?.code) {
      return NextResponse.json(auth.body, { status: auth.status });
    }
    const payload = toErrorPayload(error);
    return NextResponse.json(
      { ...payload, source: "unconfigured", orders: [] },
      { status: payload.statusCode },
    );
  }
}
