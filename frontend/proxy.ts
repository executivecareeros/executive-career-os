import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "ecos-access-token";
const REFRESH_COOKIE = "ecos-refresh-token";
const REMEMBER_COOKIE = "ecos-remember-session";
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

type RefreshedSession = { access_token: string; refresh_token: string; expires_in: number };

function tokenIsFresh(token: string | undefined) {
  if (!token) return false;
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return false;
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const payload = JSON.parse(atob(normalized)) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000) + 30;
  } catch { return false; }
}

async function refreshRequestSession(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (tokenIsFresh(accessToken)) return undefined;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!refreshToken || !url || !key) return undefined;
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST", cache: "no-store", headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) return undefined;
  const session = await response.json() as Partial<RefreshedSession>;
  if (!session.access_token || !session.refresh_token || !session.expires_in) return undefined;
  const refreshed = session as RefreshedSession;
  request.cookies.set(ACCESS_COOKIE, refreshed.access_token);
  request.cookies.set(REFRESH_COOKIE, refreshed.refresh_token);
  return refreshed;
}

const publicPaths = [
  "/login",
  "/register",
  "/founder-bootstrap",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/confirm",
  "/auth/linkedin",
  "/robots.txt",
  "/llms.txt",
  "/sitemap.xml",
  "/icon.svg",
  "/brand/",
  "/media/",
  "/about",
  "/executive-jobs",
  "/executive-career-intelligence",
];

const serverAuthenticatedPaths = ["/api/operations/opportunity-refresh", "/api/operations/source-discovery"];

const demoOnlyModules: Array<[prefix: string, module: string]> = [
  ["/discovery", "discovery"],
  ["/knowledge", "knowledge"],
  ["/memory", "memory"],
  ["/repositories", "repositories"],
  ["/interview-preparation", "interview"],
  ["/negotiation-planner", "negotiation"],
  ["/decision-workspace", "decisions"],
  ["/notes", "notes"],
];

export async function proxy(request: NextRequest) {
  const requestedLanguage = request.nextUrl.searchParams.get("lang");
  if (requestedLanguage) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.delete("orendalis-language");
    return response;
  }
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") return NextResponse.next();

  const path = request.nextUrl.pathname;
  if (publicPaths.some((item) => path.startsWith(item)) || path.startsWith("/api/auth/")) return NextResponse.next();
  if (serverAuthenticatedPaths.includes(path)) return NextResponse.next();

  const refreshed = await refreshRequestSession(request);
  const remember = request.cookies.get(REMEMBER_COOKIE)?.value === "1";
  const respond = (response: NextResponse) => {
    if (!refreshed) return response;
    response.cookies.set(ACCESS_COOKIE, refreshed.access_token, { ...cookieOptions, ...(remember ? { maxAge: refreshed.expires_in } : {}) });
    response.cookies.set(REFRESH_COOKIE, refreshed.refresh_token, { ...cookieOptions, ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}) });
    response.cookies.set(REMEMBER_COOKIE, remember ? "1" : "0", { ...cookieOptions, ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}) });
    return response;
  };

  const forwardedRequest = { headers: request.headers };
  if (path === "/") return respond(NextResponse.next({ request: forwardedRequest }));

  if (!request.cookies.has("ecos-access-token") && !request.cookies.has("ecos-refresh-token")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return respond(NextResponse.redirect(url));
  }

  // These routes have production implementations backed by the authenticated
  // Workspace. Exact roots must never be shadowed by demonstration modules.
  if (["/workspace", "/assistant", "/blueprint", "/applications"].includes(path)) {
    return respond(NextResponse.next({ request: forwardedRequest }));
  }

  if (path === "/compensation") {
    return respond(NextResponse.rewrite(new URL("/live-compensation", request.url), { request: forwardedRequest }));
  }

  // Application detail fixtures are not production records yet. Keep them
  // isolated while allowing the truthful live Applications index above.
  if (path.startsWith("/applications/")) {
    const url = new URL("/live-module", request.url);
    url.searchParams.set("module", "applications");
    return respond(NextResponse.rewrite(url, { request: forwardedRequest }));
  }

  const isolatedModule = demoOnlyModules.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  if (isolatedModule) {
    const url = new URL("/live-module", request.url);
    url.searchParams.set("module", isolatedModule[1]);
    return respond(NextResponse.rewrite(url, { request: forwardedRequest }));
  }

  if (path.startsWith("/archive/")) {
    const url = new URL("/live-module", request.url);
    url.searchParams.set("module", "ledger");
    return respond(NextResponse.rewrite(url, { request: forwardedRequest }));
  }

  return respond(NextResponse.next({ request: forwardedRequest }));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
