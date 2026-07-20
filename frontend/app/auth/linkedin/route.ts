import { NextRequest, NextResponse } from "next/server";
import { authConfiguration } from "@/lib/auth/configuration";

function safeNext(value: string | null) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/"; }

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (process.env.LINKEDIN_SIGN_IN_ENABLED !== "true") return NextResponse.redirect(new URL("/login?error=LinkedIn%20sign-in%20is%20not%20enabled%20yet", origin));
  const { url } = authConfiguration();
  const callback = new URL("/auth/linkedin/callback", origin);
  callback.searchParams.set("next", safeNext(request.nextUrl.searchParams.get("next")));
  const authorize = new URL("/auth/v1/authorize", url);
  authorize.searchParams.set("provider", "linkedin_oidc");
  authorize.searchParams.set("redirect_to", callback.toString());
  return NextResponse.redirect(authorize);
}
