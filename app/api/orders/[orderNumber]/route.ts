import { NextResponse } from "next/server";
import { toErrorPayload } from "@/lib/errors";
import { getSheetsConfigStatus, updateOrderStatus } from "@/lib/google-sheets";
import { isOrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { orderNumber } = await context.params;
    const decoded = decodeURIComponent(orderNumber ?? "").trim();

    if (!decoded) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_ORDER_NUMBER",
          error: "Numéro de commande manquant.",
        },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      status?: unknown;
    } | null;
    const status = typeof body?.status === "string" ? body.status.trim() : "";

    if (!isOrderStatus(status)) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_STATUS",
          error: `Statut invalide: "${status}".`,
        },
        { status: 400 },
      );
    }

    const config = getSheetsConfigStatus();
    if (!config.configured) {
      return NextResponse.json(
        {
          ok: false,
          code: "SHEETS_NOT_CONFIGURED",
          error: config.message,
          missing: config.missing,
          source: config.source,
        },
        { status: 503 },
      );
    }

    const order = await updateOrderStatus(decoded, status);

    return NextResponse.json({
      ok: true,
      source: "google-sheets",
      message: `Statut de la commande ${decoded} mis à jour.`,
      order,
    });
  } catch (error) {
    const payload = toErrorPayload(error);
    return NextResponse.json(payload, { status: payload.statusCode });
  }
}
