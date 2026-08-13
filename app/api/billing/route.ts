import { NextResponse } from "next/server";
import { getWorkspaceSettings } from "@/lib/workspace-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getWorkspaceSettings();
  return NextResponse.json({
    ok: true,
    plan: settings.subscription.plan,
    status: settings.subscription.status,
    billingReady: false,
  });
}
