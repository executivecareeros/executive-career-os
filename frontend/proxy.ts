import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/login",
  "/register",
  "/founder-bootstrap",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/confirm",
];

const demoOnlyModules: Array<[prefix: string, module: string]> = [
  ["/workspace", "workspace"],
  ["/assistant", "atlas"],
  ["/archive", "ledger"],
  ["/blueprint", "blueprint"],
  ["/tasks", "tasks"],
  ["/productivity", "today"],
  ["/applications", "applications"],
  ["/compensation", "compensation"],
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
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") return NextResponse.next();

  const path = request.nextUrl.pathname;
  if (publicPaths.some((item) => path.startsWith(item)) || path.startsWith("/api/auth/")) return NextResponse.next();

  if (!request.cookies.has("ecos-access-token") && !request.cookies.has("ecos-refresh-token")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
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
