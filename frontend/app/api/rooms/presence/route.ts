import { currentSession } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await currentSession();
  if (!session) return Response.json({ recorded: false }, { status: 401 });
  const body = await request.json().catch(() => undefined) as { roomId?:unknown } | undefined;
  if (typeof body?.roomId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.roomId)) return Response.json({ recorded: false }, { status: 400 });
  const response = await createServerSupabaseClient(session.accessToken).request("rpc/touch_executive_room_presence", { method: "POST", body: JSON.stringify({ target_room: body.roomId }) });
  return Response.json({ recorded: !response.error }, { status: response.error ? 403 : 200 });
}
