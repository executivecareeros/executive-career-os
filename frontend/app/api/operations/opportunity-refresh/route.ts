import { NextResponse } from "next/server";
import { schedulerRequestAuthorized } from "@/lib/discovery/scheduler-auth";
import { runOpportunityScheduler } from "@/lib/discovery/scheduler-runtime";
import { createSchedulerSupabaseClient } from "@/lib/supabase/scheduler";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
