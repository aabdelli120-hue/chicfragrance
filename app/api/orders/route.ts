import { NextResponse } from "next/server";
import { DEMO_ORDERS } from "@/lib/demo-data";
import { toErrorPayload } from "@/lib/errors";
import { getSheetsConfigStatus, readOrders } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getSheetsConfigStatus();

    if (config.source === "google-sheets") {
      const orders = await readOrders();
      return NextResponse.json({
        ok: true,
        source: config.source,
        message: config.message,
        missing: config.missing,
        orders,
      });
    }

    if (config.source === "demo") {
      return NextResponse.json({
        ok: true,
        source: config.source,
        message: config.message,
        missing: config.missing,
        orders: DEMO_ORDERS,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        source: config.source,
        message: config.message,
        missing: config.missing,
        orders: [],
        error: config.message,
        code: "SHEETS_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  } catch (error) {
    const payload = toErrorPayload(error);
    return NextResponse.json(
      { ...payload, source: "unconfigured", orders: [] },
      { status: payload.statusCode },
    );
  }
}
