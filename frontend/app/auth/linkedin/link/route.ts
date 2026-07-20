import { NextRequest, NextResponse } from "next/server";
import { authConfiguration } from "@/lib/auth/configuration";
import { currentSession } from "@/lib/auth/session";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/settings?linkedin=connected";
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  if (process.env.LINKEDIN_SIGN_IN_ENABLED !== "true") {
    return NextResponse.redirect(new URL("/settings?linkedin=unavailable", origin));
  }

  const session = await currentSession();
  if (!session) {
    const returnTo = `/auth/linkedin/link?next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(returnTo)}`, origin));
  }

  const { url, key } = authConfiguration();
  const callback = new URL("/auth/linkedin/callback", origin);
  callback.searchParams.set("next", next);
  const authorize = new URL("/auth/v1/user/identities/authorize", url);
  authorize.searchParams.set("provider", "linkedin_oidc");
  authorize.searchParams.set("redirect_to", callback.toString());

  const response = await fetch(authorize, {
    headers: { apikey: key, authorization: `Bearer ${session.accessToken}` },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({})) as { url?: string; code?: string; error_code?: string; msg?: string; message?: string; error?: string };
  if (!response.ok || !body.url) {
    console.error("LinkedIn identity-link authorization failed", {
      status: response.status,
      code: body.code ?? body.error_code ?? "unknown",
      message: body.msg ?? body.message ?? body.error ?? "No provider message",
    });
    return NextResponse.redirect(new URL("/settings?linkedin=link-failed", origin));
  }
  return NextResponse.redirect(body.url);
}
