import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "cf_session";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/invite",
  "/p",
];

function isAuthEnabled() {
  return process.env.CHIC_AUTH_ENABLED === "true";
}

function getSecret() {
  const raw =
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "chic-fragrance-dev-secret-change-me";
  return new TextEncoder().encode(raw);
}

function isPublic(pathname: string): boolean {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js)$/)
  ) {
    return true;
  }
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

async function readRole(request: NextRequest): Promise<{
  role: string | null;
  authenticated: boolean;
}> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return { role: null, authenticated: false };
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      authenticated: true,
      role: typeof payload.role === "string" ? payload.role : null,
    };
  } catch {
    return { role: null, authenticated: false };
  }
}

const LEGACY_REDIRECTS: Record<string, string> = {
  "/": "/app",
  "/commandes": "/app/commandes",
  "/depenses": "/app/depenses",
  "/rapports": "/app/rapports",
  "/produits": "/app/produits",
  "/clients": "/app/clients",
  "/parametres": "/app/parametres",
  "/premium": "/app/premium",
  "/creation-ia": "/app/creation-ia",
  "/creation-ia/landing": "/app/landing-pages",
  "/creation-ia/visuels": "/app/creation-ia/visuels",
  "/creation-ia/creatifs": "/app/creation-ia/creatifs",
  "/creation-ia/contenus": "/app/creation-ia/contenus",
  "/automatisations": "/app/automatisations",
  "/intelligence": "/app/intelligence",
  "/boutique": "/app/boutique",
};

/** Private-mode: map /app/* back to classic dashboard routes. */
const APP_TO_LEGACY: Record<string, string> = {
  "/app": "/",
  "/app/commandes": "/commandes",
  "/app/depenses": "/depenses",
  "/app/rapports": "/rapports",
  "/app/produits": "/produits",
  "/app/clients": "/clients",
  "/app/parametres": "/parametres",
  "/app/premium": "/premium",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ─── Private Chic Fragrance dashboard (auth paused) ───
  if (!isAuthEnabled()) {
    if (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/admin")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (APP_TO_LEGACY[pathname]) {
      return NextResponse.redirect(new URL(APP_TO_LEGACY[pathname], request.url));
    }

    return NextResponse.next();
  }

  // ─── Auth-enabled multi-tenant mode (future) ───
  const { role, authenticated } = await readRole(request);

  if (isPublic(pathname)) {
    if (authenticated && (pathname === "/login" || pathname === "/signup")) {
      const dest = role === "PLATFORM_ADMIN" ? "/admin" : "/app";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && role !== "PLATFORM_ADMIN") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname.startsWith("/app") && role === "PLATFORM_ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (role !== "PLATFORM_ADMIN" && LEGACY_REDIRECTS[pathname]) {
    return NextResponse.redirect(new URL(LEGACY_REDIRECTS[pathname], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
