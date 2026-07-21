import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE, REMEMBER_COOKIE, storeSession } from "./cookies";
import { supabaseAuth } from "./supabase-auth";
import type { CurrentExecutiveSession } from "./types";

export async function currentSession(): Promise<CurrentExecutiveSession | undefined> {
  const jar = await cookies();
  let accessToken = jar.get(ACCESS_COOKIE)?.value;
  if (accessToken) try { const user=await supabaseAuth.user(accessToken);if(!user.email_confirmed_at)return undefined;return { user, accessToken }; } catch { accessToken = undefined; }
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return undefined;
  try { const session = await supabaseAuth.refresh(refreshToken);if(!session.user.email_confirmed_at)return undefined;await storeSession(session, jar.get(REMEMBER_COOKIE)?.value === "1").catch(() => undefined); return { user: session.user, accessToken: session.access_token, expiresAt: session.expires_at }; } catch { return undefined; }
}
