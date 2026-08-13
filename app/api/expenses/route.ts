import { NextResponse } from "next/server";
import { DEMO_EXPENSES } from "@/lib/demo-data";
import { toErrorPayload } from "@/lib/errors";
import { getSheetsConfigStatus, readExpenses } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getSheetsConfigStatus();

    if (config.source === "google-sheets") {
      const expenses = await readExpenses();
      return NextResponse.json({
        ok: true,
        source: config.source,
        message: config.message,
        missing: config.missing,
        expenses,
      });
    }

    if (config.source === "demo") {
      return NextResponse.json({
        ok: true,
        source: config.source,
        message: config.message,
        missing: config.missing,
        expenses: DEMO_EXPENSES,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        source: config.source,
        message: config.message,
        missing: config.missing,
        expenses: [],
        error: config.message,
        code: "SHEETS_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  } catch (error) {
    const payload = toErrorPayload(error);
    return NextResponse.json(
      { ...payload, source: "unconfigured", expenses: [] },
      { status: payload.statusCode },
    );
  }
}
