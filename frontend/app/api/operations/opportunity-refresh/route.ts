import { NextResponse } from "next/server";
import { schedulerRequestAuthorized } from "@/lib/discovery/scheduler-auth";
import { runOpportunityScheduler } from "@/lib/discovery/scheduler-runtime";
import { createSchedulerSupabaseClient } from "@/lib/supabase/scheduler";

export const dynamic = "force-dynamic";
// A full employer cohort can require more than one minute of deterministic,
// workspace-isolated canonical writes. Keep this below the five-minute queue
// lease so an interrupted invocation remains safely reclaimable.
export const maxDuration = 240;

export async function GET(request: Request) {
  if (!schedulerRequestAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const summary = await runOpportunityScheduler(createSchedulerSupabaseClient());
    return NextResponse.json(summary, { status: summary.failed ? 207 : 200 });
  } catch {
    return NextResponse.json({ error: "Scheduler execution failed" }, { status: 500 });
  }
}
