import { NextRequest } from "next/server";
import { storeSession } from "@/lib/auth/cookies";
import { supabaseAuth } from "@/lib/auth/supabase-auth";
import { resolveActiveMembership } from "@/lib/auth/active-membership";

export async function POST(request: NextRequest) {
  if (process.env.LINKEDIN_SIGN_IN_ENABLED !== "true") return Response.json({ error: "LinkedIn sign-in is not enabled." }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { accessToken?: string; refreshToken?: string; expiresIn?: number };
  if (!body.accessToken || !body.refreshToken) return Response.json({ error: "The LinkedIn session is incomplete." }, { status: 400 });
  try {
    const user = await supabaseAuth.user(body.accessToken);
    if (!user.email || !user.email_confirmed_at) return Response.json({ error: "A verified LinkedIn email is required." }, { status: 403 });
    const hasWorkspace = Boolean(await resolveActiveMembership(body.accessToken, user.id));
    await storeSession({ access_token: body.accessToken, refresh_token: body.refreshToken, expires_in: Math.max(60, Math.min(Number(body.expiresIn) || 3600, 86400)), user }, true);
    return Response.json({ ok: true, hasWorkspace });
  } catch { return Response.json({ error: "LinkedIn identity could not be verified safely." }, { status: 401 }); }
}
