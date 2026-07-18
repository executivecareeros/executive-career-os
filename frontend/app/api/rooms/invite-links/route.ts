import { currentSession } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await currentSession();
  if (!session) return Response.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json().catch(() => undefined) as { roomId?:unknown; maxUses?:unknown } | undefined;
  if (typeof body?.roomId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.roomId)) return Response.json({ error: "Invalid room" }, { status: 400 });
  const maxUses = Number(body.maxUses ?? 25);
  if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 100) return Response.json({ error: "Choose 1 to 100 uses" }, { status: 400 });
  const result = await createServerSupabaseClient(session.accessToken).request<string>("rpc/create_room_join_link", { method: "POST", body: JSON.stringify({ target_room: body.roomId, requested_max_uses: maxUses }) });
  if (result.error || !result.data) return Response.json({ error: result.error?.message ?? "Link could not be created" }, { status: 403 });
  return Response.json({ shareUrl: `${new URL(request.url).origin}/rooms/join#${result.data}` });
}

export async function DELETE(request: Request) {
  const session = await currentSession();
  if (!session) return Response.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json().catch(() => undefined) as { linkId?:unknown } | undefined;
  if (typeof body?.linkId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.linkId)) return Response.json({ error: "Invalid link" }, { status: 400 });
  const result = await createServerSupabaseClient(session.accessToken).request("rpc/revoke_room_join_link", { method: "POST", body: JSON.stringify({ target_link: body.linkId }) });
  return Response.json(result.error ? { error: result.error.message } : { revoked: true }, { status: result.error ? 403 : 200 });
}
