import { NextResponse } from "next/server";
import { schedulerRequestAuthorized } from "@/lib/discovery/scheduler-auth";
import { runOpportunityScheduler } from "@/lib/discovery/scheduler-runtime";
import { createSchedulerSupabaseClient } from "@/lib/supabase/scheduler";
import type { SupabaseDataClient } from "@/lib/supabase/client";
import { activateCompanyIntelligence, parseCompanyIntelligenceActivationDomains } from "@/lib/company-intelligence/activation";

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
    const startedAt = new Date().toISOString();
    const wallStart = performance.now();
    const cpuStart = process.cpuUsage();
    const memoryStart = process.memoryUsage();
    const database = { calls: 0, reads: 0, writes: 0, durationMs: 0 };
    const rawClient = createSchedulerSupabaseClient();
    const client: SupabaseDataClient = {
      async request<T>(path: string, init?: RequestInit) {
        const requestStart = performance.now();
        database.calls += 1;
        const method = (init?.method ?? "GET").toUpperCase();
        if (method === "GET") database.reads += 1; else database.writes += 1;
        try { return await rawClient.request<T>(path, init); }
        finally { database.durationMs += Math.max(0, performance.now() - requestStart); }
      },
      health: () => rawClient.health(),
    };
    const summary = await runOpportunityScheduler(client);
    const schedules = await client.request<Array<{ workspace_id: string }>>("opportunity_provider_schedules?select=workspace_id&enabled=eq.true&limit=1");
    const workspaceId = schedules.data?.[0]?.workspace_id;
    const companyActivationLimit = Math.max(0, Math.min(25, Number(process.env.COMPANY_INTELLIGENCE_ACTIVATION_LIMIT ?? 0) || 0));
    const companyActivationDomains = parseCompanyIntelligenceActivationDomains(process.env.COMPANY_INTELLIGENCE_ACTIVATION_DOMAINS);
    const companyIntelligenceActivation = workspaceId && companyActivationLimit && companyActivationDomains.length
      ? await activateCompanyIntelligence(client, workspaceId, { maximumCompanies: companyActivationLimit, approvedDomains: companyActivationDomains })
      : undefined;
    const employerIntelligence = workspaceId
      ? await client.request<Record<string, unknown>>("rpc/refresh_employer_intelligence", { method: "POST", body: JSON.stringify({ target_workspace: workspaceId }) })
      : undefined;
    const coverage = workspaceId
      ? await client.request<Record<string, unknown>>("rpc/get_operational_coverage_summary", { method: "POST", body: JSON.stringify({ target_workspace: workspaceId }) })
      : undefined;
    const evidence = coverage?.data;
    const queue = workspaceId
      ? await client.request<Array<{ status: string }>>(`opportunity_provider_jobs?select=status&workspace_id=eq.${workspaceId}&status=in.(queued,running,retrying,failed)&limit=1000`)
      : undefined;
    const queueByStatus = (queue?.data ?? []).reduce<Record<string, number>>((result, item) => ({ ...result, [item.status]: (result[item.status] ?? 0) + 1 }), {});
    const cpu = process.cpuUsage(cpuStart);
    const memory = process.memoryUsage();
    console.info("ODS3_OPERATIONAL_TELEMETRY", JSON.stringify({
      scheduler: { ...summary, correlationId: undefined, startedAt, finishedAt: new Date().toISOString(), durationMs: Math.round(performance.now() - wallStart), result: summary.failed ? "completed-with-failures" : "completed", workersUsed: 1, retryCount: queueByStatus.retrying ?? 0 },
      queue: { ...queueByStatus, observed: (queue?.data ?? []).length },
      resources: { cpuUserMs: Math.round(cpu.user / 1000), cpuSystemMs: Math.round(cpu.system / 1000), rssDeltaMiB: Number(((memory.rss - memoryStart.rss) / 1048576).toFixed(1)), heapUsedMiB: Number((memory.heapUsed / 1048576).toFixed(1)), networkRequests: database.calls, cacheHits: 0, aiTokens: 0 },
      database: { ...database, durationMs: Math.round(database.durationMs) },
      canonicalOpportunities: evidence?.canonicalOpportunities,
      employers: evidence?.employers,
      geographicLabels: evidence?.geographicLabels,
      freshOpportunities: evidence?.freshOpportunities,
      providers: evidence?.providers ?? [],
      persistence: evidence?.persistence ?? {},
      employerIntelligence: employerIntelligence?.data ?? undefined,
      companyIntelligenceActivation,
      employerIntelligenceError: employerIntelligence?.error ? { status: employerIntelligence.status, code: employerIntelligence.error.code, message: employerIntelligence.error.message.slice(0, 160) } : undefined,
      coverageError: coverage?.error ? { status: coverage.status, code: coverage.error.code, message: coverage.error.message.slice(0, 160) } : undefined,
    }));
    return NextResponse.json(summary, { status: summary.failed ? 207 : 200 });
  } catch {
    return NextResponse.json({ error: "Scheduler execution failed" }, { status: 500 });
  }
}
