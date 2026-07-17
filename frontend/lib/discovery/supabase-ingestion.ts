import "server-only";
import { randomUUID } from "node:crypto";
import type { RepositoryContext } from "@/lib/repositories/types";
import type { SupabaseDataClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/types/opportunity";
import type { CoverageQueueItem, CoverageQueueStore, CoverageRunStore, DiscoveryFilter, DiscoverySourceKind, OpportunityIngestionOutcome, OpportunityIngestionSink } from "./types";

type Row = { id: string; domain_id: string; payload: Record<string, unknown> };
type QueueRow = { id: string; provider_id: DiscoverySourceKind; status: CoverageQueueItem["status"]; priority: number; attempt: number; maximum_attempts: number; requested_at: string; available_at: string; filters: DiscoveryFilter };
type RunRow = { payload: OpportunityIngestionOutcome };
type EmployerRpcRow = string | { upsert_employer_observation?: string };

const queueItem = (row: QueueRow): CoverageQueueItem => ({ id: row.id, providerId: row.provider_id, status: row.status, priority: row.priority, attempt: row.attempt, maximumAttempts: row.maximum_attempts, requestedAt: row.requested_at, availableAt: row.available_at, filters: row.filters });

/** Durable workspace-scoped queue. Claiming is atomic in PostgreSQL through the claim RPC. */
export class SupabaseCoverageQueueStore implements CoverageQueueStore {
  constructor(private readonly client: SupabaseDataClient, private readonly context: RepositoryContext) {}
  private get workspace() { return this.context.workspace!; }

  async list() {
    const response = await this.client.request<QueueRow[]>(`opportunity_provider_jobs?select=id,provider_id,status,priority,attempt,maximum_attempts,requested_at,available_at,filters&workspace_id=eq.${this.workspace.workspaceId}&order=priority.asc,requested_at.asc`);
    if (response.error) throw new Error(response.error.message);
    return (response.data ?? []).map(queueItem);
  }

  async put(item: CoverageQueueItem) {
    const existing = await this.client.request<Array<{ id: string }>>(`opportunity_provider_jobs?select=id&id=eq.${item.id}&workspace_id=eq.${this.workspace.workspaceId}&limit=1`);
    if (existing.error) throw new Error(existing.error.message);
    const body = { provider_id: item.providerId, status: item.status, priority: item.priority, attempt: item.attempt, maximum_attempts: item.maximumAttempts, requested_at: item.requestedAt, available_at: item.availableAt, filters: item.filters, updated_at: new Date().toISOString() };
    const response = existing.data?.length
      ? await this.client.request(`opportunity_provider_jobs?id=eq.${item.id}&workspace_id=eq.${this.workspace.workspaceId}`, { method: "PATCH", body: JSON.stringify(body) })
      : await this.client.request("opportunity_provider_jobs", { method: "POST", body: JSON.stringify({ id: item.id, workspace_id: this.workspace.workspaceId, ...body, created_by: this.workspace.executiveId }) });
    if (response.error) throw new Error(response.error.message);
  }

  async remove(id: string) {
    const response = await this.client.request(`opportunity_provider_jobs?id=eq.${id}&workspace_id=eq.${this.workspace.workspaceId}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled", cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
    if (response.error) throw new Error(response.error.message);
  }

  async claimNext(availableAt: string, workerId: string, leaseSeconds: number) {
    const response = await this.client.request<QueueRow[]>("rpc/claim_next_opportunity_provider_job", { method: "POST", body: JSON.stringify({ target_workspace: this.workspace.workspaceId, worker_id: workerId, available_before: availableAt, lease_seconds: leaseSeconds }) });
    if (response.error) throw new Error(response.error.message);
    return response.data?.[0] ? queueItem(response.data[0]) : undefined;
  }
}

export class SupabaseCoverageRunStore implements CoverageRunStore {
  constructor(private readonly client: SupabaseDataClient, private readonly context: RepositoryContext) {}
  private get workspace() { return this.context.workspace!; }

  async list() {
    const response = await this.client.request<RunRow[]>(`opportunity_provider_runs?select=payload&workspace_id=eq.${this.workspace.workspaceId}&order=started_at.desc&limit=500`);
    if (response.error) throw new Error(response.error.message);
    return (response.data ?? []).map((row) => row.payload);
  }

  async put(outcome: OpportunityIngestionOutcome, attempt: number) {
    const existing = await this.client.request<Array<{ id: string }>>(`opportunity_provider_runs?select=id&workspace_id=eq.${this.workspace.workspaceId}&job_id=eq.${outcome.run.id}&attempt=eq.${attempt}&limit=1`);
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data?.length) return;
    const response = await this.client.request("opportunity_provider_runs", { method: "POST", body: JSON.stringify({ id: randomUUID(), workspace_id: this.workspace.workspaceId, job_id: outcome.run.id, attempt, provider_id: outcome.run.source, status: outcome.run.status, started_at: outcome.run.startedAt, finished_at: outcome.run.finishedAt ?? null, duration_ms: outcome.run.durationMs ?? null, records_discovered: outcome.run.jobsFound, records_changed: outcome.run.jobsImported, records_ignored: outcome.run.jobsIgnored, records_deactivated: outcome.items.filter((item) => item.disposition === "deactivated").length, error_count: outcome.run.errors.length, payload: outcome, created_by: this.workspace.executiveId }) });
    if (response.error) throw new Error(response.error.message);
  }
}

export class SupabaseOpportunityIngestionSink implements OpportunityIngestionSink {
  private rows: Row[] | null = null;
  constructor(private readonly client: SupabaseDataClient, private readonly context: RepositoryContext) {}
  private get workspace() { return this.context.workspace!; }

  private async loadRows() {
    if (this.rows) return this.rows;
    const response = await this.client.request<Row[]>(`opportunities?select=id,domain_id,payload&workspace_id=eq.${this.workspace.workspaceId}&archived_at=is.null`);
    if (response.error) throw new Error(response.error.message);
    this.rows = response.data ?? [];
    return this.rows;
  }

  async list() {
    return (await this.loadRows()).map((row) => ({ ...row.payload, id: row.domain_id }) as Opportunity);
  }

  async upsert(opportunity: Opportunity) {
    const rows = await this.loadRows();
    const existing = rows.find((row) => row.domain_id === opportunity.id);
    const incomingSources = new Set((opportunity.sources ?? []).map((source) => `${source.id}|${source.originalId ?? ""}`));
    if (incomingSources.size) {
      for (const row of rows) {
        if (row.domain_id === opportunity.id) continue;
        const other = { ...row.payload, id: row.domain_id } as Opportunity;
        const sources = (other.sources ?? []).filter((source) => !incomingSources.has(`${source.id}|${source.originalId ?? ""}`));
        if (sources.length === (other.sources ?? []).length) continue;
        const payload = { ...row.payload, sources, source: sources.map((source) => source.name).join(" · ") || other.source };
        const patched = await this.client.request<Row[]>(`opportunities?id=eq.${row.id}&workspace_id=eq.${this.workspace.workspaceId}`, { method: "PATCH", body: JSON.stringify({ payload, updated_at: new Date().toISOString() }) });
        if (patched.error) throw new Error(patched.error.message);
        row.payload = payload;
      }
    }
    const companyId = await this.upsertEmployer(opportunity);
    const { id: domainId, ...payload } = { ...opportunity, companyId };
    if (existing) {
      const updated = await this.client.request<Row[]>(`opportunities?id=eq.${existing.id}&workspace_id=eq.${this.workspace.workspaceId}`, { method: "PATCH", body: JSON.stringify({ company_id: companyId, title: opportunity.jobTitle, country: opportunity.country, industry: opportunity.industry, status: opportunity.status, source_url: opportunity.sourceUrl ?? null, payload, updated_at: new Date().toISOString() }) });
      if (updated.error) throw new Error(updated.error.message);
      existing.payload = payload;
      return;
    }
    const id = randomUUID();
    const created = await this.client.request<Row[]>("opportunities", { method: "POST", body: JSON.stringify({ id, domain_id: domainId, workspace_id: this.workspace.workspaceId, company_id: companyId, title: opportunity.jobTitle, country: opportunity.country, industry: opportunity.industry, status: opportunity.status, source_url: opportunity.sourceUrl ?? null, payload, created_by: this.workspace.executiveId }) });
    if (created.error) throw new Error(created.error.message);
    rows.push({ id, domain_id: domainId, payload });
    // The canonical payload contains source attribution atomically with the opportunity.
    // Append-only provenance expansion is intentionally deferred until a transaction RPC exists.
  }

  private async upsertEmployer(opportunity: Opportunity) {
    const source = opportunity.sources?.[0];
    const canonicalKey = opportunity.employerDomain
      ?? opportunity.companyProfile?.canonicalKey
      ?? opportunity.companyName.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const observedAt = opportunity.lastObservedAt ?? opportunity.discoveredAt;
    const response = await this.client.request<EmployerRpcRow>("rpc/upsert_employer_observation", {
      method: "POST",
      body: JSON.stringify({
        target_workspace: this.workspace.workspaceId,
        actor_id: this.workspace.executiveId,
        target_canonical_key: canonicalKey,
        target_name: opportunity.companyName,
        target_domain: opportunity.employerDomain ?? null,
        target_website: opportunity.companyProfile?.website ?? null,
        target_industry: opportunity.industry === "Not specified" ? null : opportunity.industry,
        target_country: opportunity.country === "Not specified" ? null : opportunity.country,
        target_ats_provider: source?.kind === "Employer" ? source.id : null,
        target_confidence: opportunity.canonicalizationConfidence ?? opportunity.confidenceScore,
        target_provider_id: source?.id ?? opportunity.source,
        target_source_employer_id: opportunity.companyProfile?.canonicalKey ?? opportunity.employerDomain ?? canonicalKey,
        target_source_url: source?.originalUrl ?? opportunity.sourceUrl ?? null,
        observed_at: observedAt,
        observation_payload: { evidenceStatus: opportunity.companyProfile?.evidenceStatus ?? "Unknown", sourceKind: source?.kind ?? "Unknown" },
      }),
    });
    if (response.error) throw new Error(response.error.message);
    const value = typeof response.data === "string" ? response.data : response.data?.upsert_employer_observation;
    if (!value) throw new Error("Employer registry did not return a canonical company identifier");
    return value;
  }
}

export async function recordDiscoveryRun(client: SupabaseDataClient, context: RepositoryContext, outcome: OpportunityIngestionOutcome) {
  const response = await client.request("discovery_runs", { method: "POST", body: JSON.stringify({ id: randomUUID(), domain_id: `discovery-run-${outcome.run.id}`, workspace_id: context.workspace!.workspaceId, sequence_number: Date.now(), occurred_at: outcome.run.startedAt, correlation_id: context.correlationId, payload: outcome.run, created_by: context.workspace!.executiveId }) });
  if (response.error) throw new Error(response.error.message);
}
