import { NextResponse } from "next/server";
import { toErrorPayload } from "@/lib/errors";
import { getSheetsConfigStatus } from "@/lib/google-sheets";
import { updateOrgSheetsIntegration } from "@/lib/platform/integrations";
import {
  authErrorResponse,
  requireOrganizationContext,
  requirePermission,
} from "@/lib/platform/session";
import { updateDatabase } from "@/lib/platform/store";
import { nowIso } from "@/lib/platform/ids";
import { validateSheetsLayoutInput } from "@/lib/sheets-config";
import {
  validatePremiumInput,
  type PremiumConfig,
  type PremiumConfigInput,
} from "@/lib/premium-config";
import {
  getWorkspaceSettings,
  publicSettingsPayload,
  saveWorkspaceSettings,
} from "@/lib/workspace-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requirePermission("settings.view");
    const { organizationId, organization, user } = await requireOrganizationContext();
    const settings = await getWorkspaceSettings();
    const connection = await getSheetsConfigStatus(organizationId);

    // Overlay org identity onto settings payload (no hardcoding).
    const payload = publicSettingsPayload({
      ...settings,
      general: {
        ...settings.general,
        storeName: organization?.name || settings.general.storeName,
        currency: organization?.currency || settings.general.currency,
      },
      account: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      subscription: {
        ...settings.subscription,
        plan: organization?.plan || settings.subscription.plan,
      },
    });

    return NextResponse.json({
      ok: true,
      settings: payload,
      connection: {
        configured: connection.configured,
        source: connection.source,
        message: connection.message,
      },
      organizationId,
    });
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth.status === 401 || auth.status === 403) {
      return NextResponse.json(auth.body, { status: auth.status });
    }
    const payload = toErrorPayload(error);
    return NextResponse.json(payload, { status: payload.statusCode });
  }
}

export async function PATCH(request: Request) {
  try {
    await requirePermission("settings.manage");
    const { organizationId } = await requireOrganizationContext();
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
      premium?: PremiumConfigInput;
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

    if (body.premium) {
      const errors = validatePremiumInput(body.premium);
      if (errors.length > 0) {
        return NextResponse.json(
          { ok: false, error: errors[0], details: errors },
          { status: 400 },
        );
      }
    }

    const current = await getWorkspaceSettings();
    const premium: PremiumConfig | undefined = body.premium
      ? {
          contact: {
            ...current.premium.contact,
            ...body.premium.contact,
          } as PremiumConfig["contact"],
          plans: {
            ...current.premium.plans,
            ...body.premium.plans,
          } as PremiumConfig["plans"],
        }
      : undefined;

    // Keep legacy file settings in sync for chic-fragrance migration path.
    const saved = await saveWorkspaceSettings({
      general: body.general ? { ...current.general, ...body.general } : undefined,
      sheets: body.sheets ? { ...current.sheets, ...body.sheets } : undefined,
      account: body.account ? { ...current.account, ...body.account } : undefined,
      premium,
    });

    if (body.sheets) {
      await updateOrgSheetsIntegration(organizationId, body.sheets);
    }

    if (body.general?.storeName || body.general?.currency) {
      await updateDatabase((db) => {
        const org = db.organizations.find((o) => o.id === organizationId);
        if (!org) return;
        if (body.general?.storeName) org.name = body.general.storeName;
        if (body.general?.currency) org.currency = body.general.currency;
        org.updatedAt = nowIso();
      });
    }

    const connection = await getSheetsConfigStatus(organizationId);
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
    const auth = authErrorResponse(error);
    if (auth.status === 401 || auth.status === 403) {
      return NextResponse.json(auth.body, { status: auth.status });
    }
    const payload = toErrorPayload(error);
    return NextResponse.json(payload, { status: payload.statusCode });
  }
}
