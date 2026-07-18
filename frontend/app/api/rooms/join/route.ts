import { currentSession } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await currentSession();
  if (!session) return Response.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json().catch(() => undefined) as { token?:unknown } | undefined;
  if (typeof body?.token !== "string" || !/^[0-9a-f]{64}$/i.test(body.token)) return Response.json({ error: "Invalid invitation link" }, { status: 400 });
  const result = await createServerSupabaseClient(session.accessToken).request<string>("rpc/redeem_room_join_link", { method: "POST", body: JSON.stringify({ invite_token: body.token }) });
  return Response.json(result.error ? { error: result.error.message } : { roomId: result.data }, { status: result.error ? 403 : 200 });
}
