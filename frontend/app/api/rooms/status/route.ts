import { currentSession } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentSession();
  if (!session) return Response.json({ state: "quiet", label: "Sign in to view Rooms activity", activeRooms: 0, presentExecutives: 0, unansweredQuestions: 0 }, { status: 401 });
  const response = await createServerSupabaseClient(session.accessToken).request<Array<{ state:string;label:string;active_rooms:number;present_executives:number;unanswered_questions:number }>>("rpc/get_executive_room_activity_status", { method: "POST", body: "{}" });
  const row = response.data?.[0];
  if (response.error || !row) return Response.json({ state: "quiet", label: "Rooms activity unavailable", activeRooms: 0, presentExecutives: 0, unansweredQuestions: 0 }, { status: 503 });
  return Response.json({ state: row.state, label: row.label, activeRooms: row.active_rooms, presentExecutives: row.present_executives, unansweredQuestions: row.unanswered_questions });
}
