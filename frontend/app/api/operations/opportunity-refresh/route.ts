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
    const client = createSchedulerSupabaseClient();
    const summary = await runOpportunityScheduler(client);
    const schedules = await client.request<Array<{ workspace_id: string }>>("opportunity_provider_schedules?select=workspace_id&enabled=eq.true&limit=1");
    const workspaceId = schedules.data?.[0]?.workspace_id;
    const coverage = workspaceId
      ? await client.request<Record<string, unknown>>("rpc/get_global_coverage_intelligence", { method: "POST", body: JSON.stringify({ target_workspace: workspaceId }) })
      : undefined;
    const evidence = coverage?.data;
    console.info("ODS3_OPERATIONAL_TELEMETRY", JSON.stringify({
      scheduler: { ...summary, correlationId: undefined },
      countriesRepresented: evidence?.countriesRepresented,
      countriesWithOpportunities: evidence?.countriesWithOpportunities,
      industries: Array.isArray(evidence?.industries) ? evidence.industries.slice(0, 10) : [],
      providers: evidence?.providers ?? [],
      persistence: evidence?.persistence ?? {},
    }));
    return NextResponse.json(summary, { status: summary.failed ? 207 : 200 });
  } catch {
    return NextResponse.json({ error: "Scheduler execution failed" }, { status: 500 });
  }
}
