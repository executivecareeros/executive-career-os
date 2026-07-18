import { createServerSupabaseClient } from "@/lib/supabase/server";
import { currentSession } from "@/lib/auth/session";

function deviceClass(userAgent: string) {
  if (/iPad|Tablet|PlayBook/i.test(userAgent)) return "Tablet";
  if (/Mobile|iPhone|Android/i.test(userAgent)) return "Mobile";
  return userAgent ? "Desktop" : "Unknown";
}

function browserFamily(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) return "Chrome";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  return userAgent ? "Other" : "Unknown";
}

export async function POST(request: Request) {
  const session = await currentSession();
  if (!session) return Response.json({ recorded: false }, { status: 401 });
  const body = await request.json().catch(() => undefined) as Record<string, unknown> | undefined;
  if (!body) return Response.json({ recorded: false }, { status: 400 });
  const userAgent = request.headers.get("user-agent") ?? "";
  const payload = {
    event_id: body.id,
    event_session: body.session,
    event_type_input: body.type,
    event_surface: body.surface,
    event_route: body.route,
    event_duration_seconds: typeof body.durationSeconds === "number" ? Math.round(body.durationSeconds) : null,
    event_device_class: deviceClass(userAgent),
    event_browser_family: browserFamily(userAgent),
  };
  const response = await createServerSupabaseClient(session.accessToken).request("rpc/record_product_learning_event", { method: "POST", body: JSON.stringify(payload) });
  if (response.error) return Response.json({ recorded: false }, { status: 400 });
  return Response.json({ recorded: true });
}
