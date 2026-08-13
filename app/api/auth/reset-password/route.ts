import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/platform/auth-service";
import { AuthError, authErrorResponse } from "@/lib/platform/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; password?: string };
    if (!body.token || !body.password) {
      throw new AuthError("VALIDATION", "Token et mot de passe requis.", 400);
    }
    await resetPasswordWithToken(body.token, body.password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
