import { NextResponse } from "next/server";
import { toErrorPayload } from "@/lib/errors";
import { getSheetsConfigStatus } from "@/lib/google-sheets";
import { validateSheetsLayoutInput } from "@/lib/sheets-config";
import {
  getWorkspaceSettings,
  publicSettingsPayload,
  saveWorkspaceSettings,
} from "@/lib/workspace-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getWorkspaceSettings();
    const connection = await getSheetsConfigStatus();
    return NextResponse.json({
      ok: true,
      settings: publicSettingsPayload(settings),
      connection: {
        configured: connection.configured,
        source: connection.source,
        message: connection.message,
      },
    });
  } catch (error) {
    const payload = toErrorPayload(error);
    return NextResponse.json(payload, { status: payload.statusCode });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      general?: Record<string, string>;
      sheets?: {
        spreadsheetId?: string;
        ordersSheet?: string;
        ordersRange?: string;
        expensesSheet?: string;
        expensesRange?: string;
      };
      account?: Record<string, string>;
    } | null;

    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Requête invalide." },
        { status: 400 },
      );
    }

    if (body.sheets) {
      const errors = validateSheetsLayoutInput(body.sheets);
      if (errors.length > 0) {
        return NextResponse.json(
          { ok: false, error: errors[0], details: errors },
          { status: 400 },
        );
      }
    }

    const current = await getWorkspaceSettings();
    const saved = await saveWorkspaceSettings({
      general: body.general ? { ...current.general, ...body.general } : undefined,
      sheets: body.sheets ? { ...current.sheets, ...body.sheets } : undefined,
      account: body.account ? { ...current.account, ...body.account } : undefined,
    });

    const connection = await getSheetsConfigStatus();
    return NextResponse.json({
      ok: true,
      settings: publicSettingsPayload(saved),
      connection: {
        configured: connection.configured,
        source: connection.source,
        message: connection.message,
      },
    });
  } catch (error) {
    const payload = toErrorPayload(error);
    return NextResponse.json(payload, { status: payload.statusCode });
  }
}
