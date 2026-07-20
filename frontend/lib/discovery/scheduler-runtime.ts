import "server-only";
import { randomUUID } from "node:crypto";
import type { RepositoryContext } from "@/lib/repositories/types";
import type { SupabaseDataClient } from "@/lib/supabase/client";
import { OpportunityIngestionPipeline, refreshPolicyFor } from "./pipeline";
import { OpportunityProviderRegistry } from "./registry";
import { SupabaseCoverageRunStore, SupabaseOpportunityIngestionSink } from "./supabase-ingestion";
import { providerFromCareersUrl } from "./providers/factory";
import type { CoverageQueueItem, DiscoveryFilter, OpportunityIngestionOutcome } from "./types";

type ScheduleRow = {
  id: string; workspace_id: string; provider_id: string; source_key: string; enabled: boolean;
  priority: number; maximum_results: number; cadence_minutes: number; timezone: string;
  next_run_at: string | null; last_success_at: string | null; last_failure_at: string | null;
  locator: Record<string, unknown>; filters: DiscoveryFilter; created_by: string;
};
type ClaimedRow = { id: string; provider_id: string; status: CoverageQueueItem["status"]; priority: number; attempt: number; maximum_attempts: number; requested_at: string; available_at: string; filters: DiscoveryFilter };
type JobScheduleRow = { schedule_id: string | null; workspace_id: string };

export type SchedulerSummary = {
  correlationId: string; dueSchedules: number; jobsEnqueued: number; jobsExecuted: number;
  completed: number; failed: number; recordsDiscovered: number; recordsChanged: number;
  persistenceBatches: number; persistenceRecords: number; persistenceDatabaseCalls: number; persistenceDurationMs: number;
};

const later = (iso: string, minutes: number) => new Date(Date.parse(iso) + minutes * 60_000).toISOString();
const message = (error: unknown) => error instanceof Error ? error.message : "Provider execution failed";
const providerFor = (schedule: ScheduleRow) => providerFromCareersUrl(
  String(schedule.locator.url ?? ""),
  undefined,
  { companyName: typeof schedule.locator.companyName === "string" ? schedule.locator.companyName : undefined },
);

function contextFor(schedule: ScheduleRow, requestId: string): RepositoryContext {
  return { requestId, actorId: schedule.created_by, correlationId: requestId, timestamp: new Date().toISOString(), workspace: { workspaceId: schedule.workspace_id, executiveId: schedule.created_by, membershipId: "scheduler", role: "Owner", permissionScope: [], language: "en", timezone: schedule.timezone, capabilities: ["opportunity-ingestion"], requestId, isDemo: false } };
}

async function enqueue(client: SupabaseDataClient, schedule: ScheduleRow, now: string) {
  const policy = refreshPolicyFor(providerFor(schedule));
  const id = randomUUID();
  const response = await client.request("opportunity_provider_jobs", { method: "POST", body: JSON.stringify({ id, workspace_id: schedule.workspace_id, schedule_id: schedule.id, provider_id: schedule.provider_id, status: "queued", priority: schedule.priority, attempt: 0, maximum_attempts: policy.maximumAttempts, requested_at: now, available_at: now, filters: schedule.filters, created_by: schedule.created_by }) });
  if (response.error) {
    if (response.status === 409) return false;
    throw new Error(response.error.message);
  }
  const advanced = await client.request(`opportunity_provider_schedules?id=eq.${schedule.id}`, { method: "PATCH", body: JSON.stringify({ next_run_at: later(now, schedule.cadence_minutes), updated_at: now }) });
  if (advanced.error) throw new Error(advanced.error.message);
  return true;
}

async function executeClaim(client: SupabaseDataClient, schedule: ScheduleRow, claimed: ClaimedRow, now: string): Promise<OpportunityIngestionOutcome> {
  const provider = providerFor(schedule);
  if (provider.id !== claimed.provider_id || provider.id !== schedule.provider_id) throw new Error("PROVIDER_SCHEDULE_MISMATCH");
  const registry = new OpportunityProviderRegistry().register(provider);
  const context = contextFor(schedule, claimed.id);
  const pipeline = new OpportunityIngestionPipeline(registry, new SupabaseOpportunityIngestionSink(client, context));
  const outcome = await pipeline.ingest(provider.id, { runId: claimed.id, requestedAt: now, maximumResults: schedule.maximum_results, filters: claimed.filters });
  await new SupabaseCoverageRunStore(client, context).put(outcome, claimed.attempt);
  const failed = outcome.run.status === "failed";
  const retry = failed && outcome.nextRetryAt && claimed.attempt < claimed.maximum_attempts;
  const job = await client.request(`opportunity_provider_jobs?id=eq.${claimed.id}`, { method: "PATCH", body: JSON.stringify({ status: retry ? "retrying" : failed ? "failed" : "completed", available_at: retry ? outcome.nextRetryAt : outcome.nextRefreshAt ?? now, lease_owner: null, lease_expires_at: null, last_error: failed ? outcome.run.errors[0] ?? null : null, updated_at: new Date().toISOString() }) });
  if (job.error) throw new Error(job.error.message);
  const scheduleUpdate = await client.request(`opportunity_provider_schedules?id=eq.${schedule.id}`, { method: "PATCH", body: JSON.stringify({ next_run_at: retry ? outcome.nextRetryAt : outcome.nextRefreshAt ?? later(now, schedule.cadence_minutes), last_success_at: failed ? schedule.last_success_at : outcome.run.finishedAt, last_failure_at: failed ? outcome.run.finishedAt : schedule.last_failure_at, updated_at: new Date().toISOString() }) });
  if (scheduleUpdate.error) throw new Error(scheduleUpdate.error.message);
  return outcome;
}

export async function runOpportunityScheduler(client: SupabaseDataClient, now = new Date().toISOString(), maximumJobs = 18): Promise<SchedulerSummary> {
  const correlationId = randomUUID();
  const dueBefore = encodeURIComponent(now);
  const configured = await client.request<ScheduleRow[]>(`opportunity_provider_schedules?select=*&enabled=eq.true&next_run_at=lte.${dueBefore}&order=priority.asc,next_run_at.asc&limit=${maximumJobs}`);
  if (configured.error) throw new Error(configured.error.message);
  const schedules = configured.data ?? [];
  const dueSchedules = schedules.filter(schedule => schedule.next_run_at && schedule.next_run_at <= now);
  let jobsEnqueued = 0;
  for (const schedule of dueSchedules) if (await enqueue(client, schedule, now)) jobsEnqueued += 1;

  let jobsExecuted = 0, completed = 0, failed = 0, recordsDiscovered = 0, recordsChanged = 0;
  let persistenceBatches = 0, persistenceRecords = 0, persistenceDatabaseCalls = 0, persistenceDurationMs = 0;
  const activeJobs = await client.request<JobScheduleRow[]>("opportunity_provider_jobs?select=schedule_id,workspace_id&status=in.(queued,running,retrying)&limit=1000");
  if (activeJobs.error) throw new Error(activeJobs.error.message);
  const workspaceIds = [...new Set([...schedules.map(schedule => schedule.workspace_id), ...(activeJobs.data ?? []).map(job => job.workspace_id)])];
  for (const workspaceId of workspaceIds) {
    for (let count = 0; count < maximumJobs; count += 1) {
      const claim = await client.request<ClaimedRow[]>("rpc/claim_next_opportunity_provider_job", { method: "POST", body: JSON.stringify({ target_workspace: workspaceId, worker_id: correlationId, available_before: now, lease_seconds: 300 }) });
      if (claim.error) throw new Error(claim.error.message);
      const claimed = claim.data?.[0];
      if (!claimed) break;
      const job = await client.request<JobScheduleRow[]>(`opportunity_provider_jobs?select=schedule_id,workspace_id&id=eq.${claimed.id}&limit=1`);
      const scheduleId = job.data?.[0]?.schedule_id;
      const configuredSchedule = scheduleId
        ? await client.request<ScheduleRow[]>(`opportunity_provider_schedules?select=*&id=eq.${scheduleId}&enabled=eq.true&limit=1`)
        : undefined;
      const schedule = configuredSchedule?.data?.[0];
      if (!schedule) {
        await client.request(`opportunity_provider_jobs?id=eq.${claimed.id}`, { method: "PATCH", body: JSON.stringify({ status: "failed", lease_owner: null, lease_expires_at: null, last_error: { code: "SCHEDULE_NOT_AVAILABLE" }, updated_at: new Date().toISOString() }) });
        failed += 1; jobsExecuted += 1; continue;
      }
      try {
        const outcome = await executeClaim(client, schedule, claimed, now);
        jobsExecuted += 1; recordsDiscovered += outcome.run.jobsFound; recordsChanged += outcome.run.jobsImported;
        for (const batch of outcome.persistence ?? []) {
          persistenceBatches += 1;
          persistenceRecords += batch.records;
          persistenceDatabaseCalls += batch.databaseCalls;
          persistenceDurationMs += batch.durationMs;
        }
        if (outcome.run.status === "failed") failed += 1; else completed += 1;
      } catch (error) {
        failed += 1; jobsExecuted += 1;
        await client.request(`opportunity_provider_jobs?id=eq.${claimed.id}`, { method: "PATCH", body: JSON.stringify({ status: "failed", lease_owner: null, lease_expires_at: null, last_error: { code: "SCHEDULER_EXECUTION_FAILED", message: message(error).slice(0, 300) }, updated_at: new Date().toISOString() }) });
      }
    }
  }
  return { correlationId, dueSchedules: dueSchedules.length, jobsEnqueued, jobsExecuted, completed, failed, recordsDiscovered, recordsChanged, persistenceBatches, persistenceRecords, persistenceDatabaseCalls, persistenceDurationMs };
}
