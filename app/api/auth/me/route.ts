import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/platform/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { ok: false, authenticated: false },
      { status: 401 },
    );
  }
  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: session.user,
    organization: session.organization,
    permissions: session.permissions,
  });
}
