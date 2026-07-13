import "server-only";
import { authConfiguration } from "./configuration";
import type { AuthSession, AuthUser } from "./types";

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const { url, key } = authConfiguration();
  const response = await fetch(`${url}/auth/v1/${path}`, { ...init, cache: "no-store", headers: { apikey: key, "Content-Type": "application/json", ...init.headers } });
  const body = await response.json().catch(() => ({})) as T & { message?: string; error_description?: string };
  if (!response.ok) throw new Error(body.message ?? body.error_description ?? "Authentication request failed.");
  return body;
}
export const supabaseAuth = {
  signUp(email: string, password: string, redirectTo: string) { return request<AuthSession & { user: AuthUser }>(`signup?redirect_to=${encodeURIComponent(redirectTo)}`, { method: "POST", body: JSON.stringify({ email, password }) }); },
  signIn(email: string, password: string) { return request<AuthSession>("token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) }); },
  refresh(refreshToken: string) { return request<AuthSession>("token?grant_type=refresh_token", { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) }); },
  user(accessToken: string) { return request<AuthUser>("user", { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } }); },
  verifyEmail(tokenHash: string) { return request<AuthSession>("verify", { method: "POST", body: JSON.stringify({ token_hash: tokenHash, type: "email" }) }); },
  resendVerification(email: string, redirectTo: string) { return request<Record<string, never>>(`resend?redirect_to=${encodeURIComponent(redirectTo)}`, { method: "POST", body: JSON.stringify({ type: "signup", email }) }); },
  recover(email: string, redirectTo: string) { return request<Record<string, never>>(`recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: "POST", body: JSON.stringify({ email }) }); },
  updatePassword(accessToken: string, password: string) { return request<AuthUser>("user", { method: "PUT", headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ password }) }); },
  logout(accessToken: string) { return request<Record<string, never>>("logout", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }); },
};
