import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/platform/auth-service";
import { AuthError, authErrorResponse } from "@/lib/platform/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    if (!body.email) {
      throw new AuthError("VALIDATION", "Email requis.", 400);
    }
    const result = await requestPasswordReset(body.email);
    return NextResponse.json(result);
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
