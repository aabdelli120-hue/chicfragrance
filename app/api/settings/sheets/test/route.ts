import { NextResponse } from "next/server";
import { toErrorPayload } from "@/lib/errors";
import { testSheetsConnection } from "@/lib/google-sheets";
import { updateOrgSheetsIntegration } from "@/lib/platform/integrations";
import {
  authErrorResponse,
  requireOrganizationContext,
  requirePermission,
} from "@/lib/platform/session";
import { validateSheetsLayoutInput } from "@/lib/sheets-config";
import { saveWorkspaceSettings } from "@/lib/workspace-settings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requirePermission("integrations.manage");
    const { organizationId } = await requireOrganizationContext();

    const body = (await request.json().catch(() => ({}))) as {
      spreadsheetId?: string;
      ordersSheet?: string;
      ordersRange?: string;
      expensesSheet?: string;
      expensesRange?: string;
      save?: boolean;
    };

    const errors = validateSheetsLayoutInput(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, error: errors[0], details: errors },
        { status: 400 },
      );
    }

    if (body.save) {
      await saveWorkspaceSettings({
        sheets: {
          spreadsheetId: body.spreadsheetId ?? "",
          ordersSheet: body.ordersSheet ?? "",
          ordersRange: body.ordersRange ?? "",
          expensesSheet: body.expensesSheet ?? "",
          expensesRange: body.expensesRange ?? "",
        },
      });
      await updateOrgSheetsIntegration(organizationId, {
        spreadsheetId: body.spreadsheetId,
        ordersSheet: body.ordersSheet,
        ordersRange: body.ordersRange,
        expensesSheet: body.expensesSheet,
        expensesRange: body.expensesRange,
      });
    }

    const result = await testSheetsConnection(organizationId);
    return NextResponse.json({
      message: "Connexion vérifiée.",
      ...result,
    });
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth.status === 401 || auth.status === 403) {
      return NextResponse.json(auth.body, { status: auth.status });
    }
    const payload = toErrorPayload(error);
    return NextResponse.json(
      {
        ...payload,
        ok: false,
      },
      { status: payload.statusCode },
    );
  }
}
