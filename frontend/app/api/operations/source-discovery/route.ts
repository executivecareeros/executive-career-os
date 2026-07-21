import { NextResponse } from "next/server";
import { schedulerRequestAuthorized } from "@/lib/discovery/scheduler-auth";
import { createSchedulerSupabaseClient } from "@/lib/supabase/scheduler";
import { discoverPublicEmployerSources } from "@/lib/discovery/public-employer-discovery";
import { prepareEmployerSourceBatch, registerEmployerSourceBatch, validateEmployerSourceBatch } from "@/lib/discovery/employer-source-factory";
import { credentialedGlobalFeedSources, publicGlobalFeedSources } from "@/lib/discovery/public-global-feeds";

export const dynamic = "force-dynamic";
export const maxDuration = 240;

export async function GET(request: Request) {
  if (!schedulerRequestAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = createSchedulerSupabaseClient();
    type SourceSchedule = { workspace_id: string; created_by: string; source_key: string; locator?: { url?: string } };
    const schedulePageSize = 1_000;
    const scheduleRegistry: SourceSchedule[] = [];
    for (let offset = 0; offset < 100_000; offset += schedulePageSize) {
      const page = await client.request<SourceSchedule[]>(`opportunity_provider_schedules?select=workspace_id,created_by,source_key,locator&enabled=eq.true&order=created_at.desc&limit=${schedulePageSize}&offset=${offset}`);
      if (page.error) throw new Error(page.error.message);
      const rows = page.data ?? [];
      scheduleRegistry.push(...rows);
      if (rows.length < schedulePageSize) break;
    }
    const workspaceId = scheduleRegistry[0]?.workspace_id;
    const actorId = scheduleRegistry[0]?.created_by;
    if (!workspaceId || !actorId) return NextResponse.json({ status: "no-active-workspace", aiTokens: 0 });

    const maximumSources = Math.max(0, Math.min(50, Number(process.env.OPPORTUNITY_SOURCE_DISCOVERY_LIMIT ?? 50) || 50));
    // Advance every production discovery window so a higher cron cadence never
    // replays the same Common Crawl candidate slice.
    const discoveryIntervalMinutes = Math.max(5, Math.min(60, Number(process.env.OPPORTUNITY_SOURCE_DISCOVERY_INTERVAL_MINUTES ?? 10) || 10));
    const discoveryCursor = Math.floor(Date.now() / (discoveryIntervalMinutes * 60_000));
    const discovery = await discoverPublicEmployerSources({
      existingUrls: scheduleRegistry.flatMap(item => item.locator?.url ? [item.locator.url] : []),
      existingSourceKeys: scheduleRegistry.map(item => item.source_key),
      maximumSources,
      concurrency: 16,
      discoveryCursor,
      timeBudgetMs: 150_000,
    });
    const prepared = prepareEmployerSourceBatch(discovery.sources);
    const connected = prepared.prepared.map(source => ({ ...source, healthStatus: "connected" as const, healthMessage: "Verified through the provider's public active-job endpoint." }));
    const registration = await registerEmployerSourceBatch(client, { workspaceId, actorId, sources: connected });
    const existingSourceKeys = new Set(scheduleRegistry.map(item => item.source_key));
    const eligibleGlobalFeeds = [...publicGlobalFeedSources, ...credentialedGlobalFeedSources()];
    const globalFeedBatch = prepareEmployerSourceBatch(eligibleGlobalFeeds);
    const pendingGlobalFeeds = { ...globalFeedBatch, prepared: globalFeedBatch.prepared.filter(source => !existingSourceKeys.has(source.sourceKey)) };
    const globalFeedValidation = await validateEmployerSourceBatch(pendingGlobalFeeds, 2);
    const globalFeedRegistration = await registerEmployerSourceBatch(client, { workspaceId, actorId, sources: globalFeedValidation.validated });
    const result = { candidates: discovery.candidates, attempted: discovery.attempted, failures: discovery.failures, advertisedActiveJobs: discovery.advertisedActiveJobs, ...registration, globalFeeds: { eligible: eligibleGlobalFeeds.length, failures: globalFeedValidation.failures.length, ...globalFeedRegistration }, aiTokens: 0 };
    console.info("ZERO_TOKEN_SOURCE_DISCOVERY", JSON.stringify(result));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 200) : "Source discovery failed";
    console.info("ZERO_TOKEN_SOURCE_DISCOVERY_FAILURE", JSON.stringify({ message, aiTokens: 0 }));
    return NextResponse.json({ error: "Source discovery failed", aiTokens: 0 }, { status: 500 });
  }
}
