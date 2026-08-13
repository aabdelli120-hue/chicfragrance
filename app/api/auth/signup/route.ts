import { NextResponse } from "next/server";
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
import { createOrganizationWithOwner, ensurePlatformSeeded } from "@/lib/platform/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      storeName?: string;
      currency?: string;
      country?: string;
    };

    if (!body.name || !body.email || !body.password || !body.storeName) {
      throw new AuthError(
        "VALIDATION",
        "Nom, email, mot de passe et nom de boutique requis.",
        400,
      );
    }

    if (body.password.length < 8) {
      throw new AuthError(
        "WEAK_PASSWORD",
        "Le mot de passe doit contenir au moins 8 caractères.",
        400,
      );
    }

    await ensurePlatformSeeded();

    let owner;
    try {
      ({ owner } = await createOrganizationWithOwner({
        storeName: body.storeName,
        ownerName: body.name,
        ownerEmail: body.email,
        ownerPassword: body.password,
        phone: body.phone ?? null,
        currency: body.currency,
        country: body.country,
      }));
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_TAKEN") {
        throw new AuthError("EMAIL_TAKEN", "Cet email est déjà utilisé.", 409);
      }
      throw error;
    }

    const session = await buildAuthSession(owner);
    if (!session) {
      throw new AuthError("FORBIDDEN", "Impossible de créer la session.", 500);
    }

    const token = await signSessionToken({
      sub: owner.id,
      email: owner.email,
      role: owner.role,
      organizationId: owner.organizationId,
    });

    const response = NextResponse.json({
      ok: true,
      user: session.user,
      organization: session.organization,
      permissions: session.permissions,
      redirectTo: "/app/onboarding",
    });
    response.cookies.set(getSessionCookieName(), token, sessionCookieOptions());
    return response;
  } catch (error) {
    const { body, status } = authErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
