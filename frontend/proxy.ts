import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/login",
  "/register",
  "/founder-bootstrap",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/confirm",
  "/robots.txt",
  "/llms.txt",
  "/sitemap.xml",
  "/icon.svg",
  "/brand/",
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

export function proxy(request: NextRequest) {
  const requestedLanguage = request.nextUrl.searchParams.get("lang");
  if (requestedLanguage === "en" || requestedLanguage === "tr") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set("orendalis-language", requestedLanguage, { maxAge: 31_536_000, sameSite: "lax", secure: request.nextUrl.protocol === "https:" });
    return response;
  }
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") return NextResponse.next();

  const path = request.nextUrl.pathname;
  if (path === "/") return NextResponse.next();
  if (publicPaths.some((item) => path.startsWith(item)) || path.startsWith("/api/auth/")) return NextResponse.next();
  if (serverAuthenticatedPaths.includes(path)) return NextResponse.next();

  if (!request.cookies.has("ecos-access-token") && !request.cookies.has("ecos-refresh-token")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // These routes have production implementations backed by the authenticated
  // Workspace. Exact roots must never be shadowed by demonstration modules.
  if (["/workspace", "/assistant", "/blueprint", "/applications"].includes(path)) {
    return NextResponse.next();
  }

  if (path === "/compensation") {
    return NextResponse.rewrite(new URL("/live-compensation", request.url));
  }

  // Application detail fixtures are not production records yet. Keep them
  // isolated while allowing the truthful live Applications index above.
  if (path.startsWith("/applications/")) {
    const url = new URL("/live-module", request.url);
    url.searchParams.set("module", "applications");
    return NextResponse.rewrite(url);
  }

  const isolatedModule = demoOnlyModules.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  if (isolatedModule) {
    const url = new URL("/live-module", request.url);
    url.searchParams.set("module", isolatedModule[1]);
    return NextResponse.rewrite(url);
  }

  if (path.startsWith("/archive/")) {
    const url = new URL("/live-module", request.url);
    url.searchParams.set("module", "ledger");
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
