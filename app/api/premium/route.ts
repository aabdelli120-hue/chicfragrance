import { NextResponse } from "next/server";
import { toErrorPayload } from "@/lib/errors";
import { resolvePlans } from "@/lib/premium-config";
import { getSessionFromCookies } from "@/lib/platform/session";
import { readDatabase } from "@/lib/platform/store";
import { getWorkspaceSettings } from "@/lib/workspace-settings";

export const dynamic = "force-dynamic";

/**
 * Everything the Premium UI needs in one payload: resolved offers, the business
 * contact channels and the identity used in generated messages.
 *
 * Identity comes from the authenticated session when there is one, so contact
 * messages always carry the real owner and store name. Workspace settings are
 * the fallback for unauthenticated/local use.
 */
export async function GET() {
  try {
    const settings = await getWorkspaceSettings();
    const session = await getSessionFromCookies().catch(() => null);

    const identity = {
      ownerName: session?.user.name?.trim() || settings.account.name,
      storeName: session?.organization?.name?.trim() || settings.general.storeName,
      role: session?.user.role ?? settings.account.role,
    };

    // Real subscription record when the tenant has one; never a fabricated date.
    let subscription = settings.subscription;
    const organizationId = session?.organization?.id;
    if (organizationId) {
      const db = await readDatabase();
      const record = db.subscriptions.find((item) => item.organizationId === organizationId);
      subscription = {
        plan: record?.planId ?? session?.organization?.plan ?? "FREE",
        status: record?.status === "cancelled" ? "inactive" : record?.status ?? "inactive",
        startedAt: record?.startedAt ?? null,
        expiresAt: record?.expiresAt ?? null,
      };
    }

    return NextResponse.json({
      ok: true,
      plans: resolvePlans(settings.premium),
      contact: settings.premium.contact,
      identity,
      subscription,
      // Flipping this on is the only change needed when a gateway is added.
      paymentReady: false,
    });
  } catch (error) {
    const payload = toErrorPayload(error);
    return NextResponse.json(payload, { status: payload.statusCode });
  }
}
