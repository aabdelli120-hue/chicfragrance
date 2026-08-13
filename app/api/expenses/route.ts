import { NextResponse } from "next/server";
import { DEMO_EXPENSES } from "@/lib/demo-data";
import { toErrorPayload } from "@/lib/errors";
import { getSheetsConfigStatus, readExpenses } from "@/lib/google-sheets";
import {
  authErrorResponse,
  requireOrganizationContext,
  requirePermission,
} from "@/lib/platform/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requirePermission("expenses.view");
    const { organizationId } = await requireOrganizationContext();
    const config = await getSheetsConfigStatus(organizationId);

    if (config.source === "google-sheets") {
      const expenses = await readExpenses(organizationId);
      return NextResponse.json({
        ok: true,
        source: config.source,
        message: config.message,
        missing: config.missing,
        organizationId,
        expenses,
      });
    }

    if (config.source === "demo") {
      return NextResponse.json({
        ok: true,
        source: config.source,
        message: config.message,
        missing: config.missing,
        organizationId,
        expenses: DEMO_EXPENSES,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        source: config.source,
        message: config.message,
        missing: config.missing,
        organizationId,
        expenses: [],
        error: config.message,
        code: "SHEETS_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth.status === 401 || auth.status === 403) {
      return NextResponse.json(auth.body, { status: auth.status });
    }
    const payload = toErrorPayload(error);
    return NextResponse.json(
      { ...payload, source: "unconfigured", expenses: [] },
      { status: payload.statusCode },
    );
  }
}
