import { NextResponse } from "next/server";
import { getSessionCookieName, sessionCookieOptions } from "@/lib/platform/crypto";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), "", sessionCookieOptions(0));
  return response;
}
