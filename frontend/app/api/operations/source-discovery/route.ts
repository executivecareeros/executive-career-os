import { NextResponse } from "next/server";
import { schedulerRequestAuthorized } from "@/lib/discovery/scheduler-auth";
import { createSchedulerSupabaseClient } from "@/lib/supabase/scheduler";
import { discoverPublicEmployerSources } from "@/lib/discovery/public-employer-discovery";
import { prepareEmployerSourceBatch, registerEmployerSourceBatch } from "@/lib/discovery/employer-source-factory";

export const dynamic = "force-dynamic";
export const maxDuration = 240;

export async function GET(request: Request) {
  if (!schedulerRequestAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = createSchedulerSupabaseClient();
    const schedules = await client.request<Array<{ workspace_id: string; created_by: string; locator?: { url?: string } }>>("opportunity_provider_schedules?select=workspace_id,created_by,locator&enabled=eq.true&order=created_at.desc&limit=5000");
    if (schedules.error) throw new Error(schedules.error.message);
    const workspaceId = schedules.data?.[0]?.workspace_id;
    const actorId = schedules.data?.[0]?.created_by;
    if (!workspaceId || !actorId) return NextResponse.json({ status: "no-active-workspace", aiTokens: 0 });

    const maximumSources = Math.max(0, Math.min(50, Number(process.env.OPPORTUNITY_SOURCE_DISCOVERY_LIMIT ?? 40) || 40));
    const discoveryCursor = Math.floor(Date.now() / (30 * 60_000));
    const discovery = await discoverPublicEmployerSources({
      existingUrls: (schedules.data ?? []).flatMap(item => item.locator?.url ? [item.locator.url] : []),
      maximumSources,
      concurrency: 16,
      discoveryCursor,
      timeBudgetMs: 150_000,
    });
    const prepared = prepareEmployerSourceBatch(discovery.sources);
    const connected = prepared.prepared.map(source => ({ ...source, healthStatus: "connected" as const, healthMessage: "Verified through the provider's public active-job endpoint." }));
    const registration = await registerEmployerSourceBatch(client, { workspaceId, actorId, sources: connected });
    const result = { candidates: discovery.candidates, attempted: discovery.attempted, failures: discovery.failures, advertisedActiveJobs: discovery.advertisedActiveJobs, ...registration, aiTokens: 0 };
    console.info("ZERO_TOKEN_SOURCE_DISCOVERY", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 200) : "Source discovery failed";
    console.info("ZERO_TOKEN_SOURCE_DISCOVERY_FAILURE", JSON.stringify({ message, aiTokens: 0 }));
    return NextResponse.json({ error: "Source discovery failed", aiTokens: 0 }, { status: 500 });
  }
}
