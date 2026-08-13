import { NextResponse } from "next/server";
import {
  acceptInvitation,
  getInvitationByToken,
} from "@/lib/platform/team";
import {
  AuthError,
  authErrorResponse,
  buildAuthSession,
  homePathForRole,
} from "@/lib/platform/session";
import {
  getSessionCookieName,
  sessionCookieOptions,
  signSessionToken,
} from "@/lib/platform/crypto";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const result = await getInvitationByToken(token);
    if (!result) {
      throw new AuthError("INVALID_TOKEN", "Invitation invalide ou expirée.", 404);
    }
    return NextResponse.json({
      ok: true,
      invitation: {
        email: result.invitation.email,
        name: result.invitation.name,
        role: result.invitation.role,
      },
      organizationName: result.organizationName,
    });
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const body = (await request.json()) as { password?: string };
    if (!body.password) {
      throw new AuthError("VALIDATION", "Mot de passe requis.", 400);
    }
    const user = await acceptInvitation({ token, password: body.password });
    const session = await buildAuthSession(user);
    if (!session) {
      throw new AuthError("FORBIDDEN", "Compte créé mais session impossible.", 500);
    }
    const jwt = await signSessionToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });
    const response = NextResponse.json({
      ok: true,
      redirectTo: homePathForRole(user.role),
      user: session.user,
    });
    response.cookies.set(getSessionCookieName(), jwt, sessionCookieOptions());
    return response;
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
