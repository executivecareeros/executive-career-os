import "server-only";
import { cookies } from "next/headers";
import type { AuthSession } from "./types";

export const ACCESS_COOKIE = "ecos-access-token";
export const REFRESH_COOKIE = "ecos-refresh-token";
const common = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

export async function storeSession(session: AuthSession, remember: boolean) {
  const jar = await cookies();
  const persistent = remember ? { maxAge: 60 * 60 * 24 * 30 } : {};
  jar.set(ACCESS_COOKIE, session.access_token, { ...common, maxAge: session.expires_in });
  jar.set(REFRESH_COOKIE, session.refresh_token, { ...common, ...persistent });
}
export async function clearSession() { const jar = await cookies(); jar.delete(ACCESS_COOKIE); jar.delete(REFRESH_COOKIE); }
