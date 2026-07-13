import "server-only";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const INVITE_COOKIE = "ecos-beta-invite";
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 };

interface InvitationInspection { invitation_id: string | null; invitation_status: "Pending" | "Accepted" | "Expired" | "Revoked" | "Invalid"; expires_at: string | null }

export async function inspectInvitation(email: string, token: string) {
  const response = await createServerSupabaseClient().request<InvitationInspection[]>("rpc/inspect_beta_invitation", { method: "POST", body: JSON.stringify({ target_email: email, invite_token: token }) });
  if (response.error) throw new Error("Invitation validation is temporarily unavailable.");
  return response.data?.[0] ?? { invitation_id: null, invitation_status: "Invalid" as const, expires_at: null };
}

export async function rememberInvitation(token: string) { (await cookies()).set(INVITE_COOKIE, token, cookieOptions); }

export async function inspectRememberedInvitation(email:string){const token=(await cookies()).get(INVITE_COOKIE)?.value;if(!token)return {invitation_id:null,invitation_status:"Invalid" as const,expires_at:null};return inspectInvitation(email,token);}

export async function acceptRememberedInvitation(accessToken: string,strict=false) {
  const jar = await cookies(); const token = jar.get(INVITE_COOKIE)?.value; if (!token) return;
  const response = await createServerSupabaseClient(accessToken).request<string>("rpc/accept_beta_invitation", { method: "POST", body: JSON.stringify({ invite_token: token }) });
  jar.delete(INVITE_COOKIE);
  if (response.error&&strict)throw new Error(response.error.message);
}
