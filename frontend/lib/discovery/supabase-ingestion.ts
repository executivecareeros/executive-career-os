import "server-only";
import { randomUUID } from "node:crypto";
import type { RepositoryContext } from "@/lib/repositories/types";
import type { SupabaseDataClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/types/opportunity";
import type { CoverageQueueItem, CoverageQueueStore, CoverageRunStore, DiscoveryFilter, DiscoverySourceKind, IngestionBatchTelemetry, OpportunityIngestionOutcome, OpportunityIngestionSink, ProviderCollectionBatch } from "./types";

type Row = { id: string; domain_id: string; payload: Record<string, unknown> };
type QueueRow = { id: string; provider_id: DiscoverySourceKind; status: CoverageQueueItem["status"]; priority: number; attempt: number; maximum_attempts: number; requested_at: string; available_at: string; filters: DiscoveryFilter };
type RunRow = { payload: OpportunityIngestionOutcome };
type EmployerRpcRow = string | { upsert_employer_observation?: string };
type CompanyIdentityRow = { id: string };
type BatchRpcRow = IngestionBatchTelemetry | { persist_opportunity_batch?: IngestionBatchTelemetry };

const queryChunkSize = 40;
const chunks = <T>(values: readonly T[], size = queryChunkSize) => Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
const postgrestQuoted = (value: string) => `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

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
    const pageSize = 1000;
    const rows: Row[] = [];
    for (let offset = 0; ; offset += pageSize) {
      const response = await this.client.request<Row[]>(`opportunities?select=id,domain_id,payload&workspace_id=eq.${this.workspace.workspaceId}&archived_at=is.null&order=id.asc&limit=${pageSize}&offset=${offset}`);
      if (response.error) throw new Error(response.error.message);
      const page = response.data ?? [];
      rows.push(...page);
      if (page.length < pageSize) break;
    }
    this.rows = rows;
    return this.rows;
  }

  async list() {
    return (await this.loadRows()).map((row) => ({ ...row.payload, id: row.domain_id }) as Opportunity);
  }

  async listForBatch(batch: ProviderCollectionBatch) {
    if (this.rows) return this.rows.map((row) => ({ ...row.payload, id: row.domain_id }) as Opportunity);
    const canonicalKeys = [...new Set([
      ...(batch.snapshotScopeKeys ?? []),
      ...batch.jobs.map((job) => job.company.canonicalKey).filter((value): value is string => Boolean(value?.trim())),
    ].map((value) => value.trim()))];
    const companyNames = [...new Set(batch.jobs.map((job) => job.company.name.trim()).filter(Boolean))];

    // An empty complete snapshot still needs the global inventory so the provider's
    // previously active observations can be closed safely.
    if (!canonicalKeys.length && !companyNames.length) return this.list();

    const companyIds = new Set<string>();
    const identityGroups = [...chunks(canonicalKeys).map((values) => ({ field: "canonical_key", values })), ...chunks(companyNames).map((values) => ({ field: "name", values }))];
    for (const group of identityGroups) {
      if (!group.values.length) continue;
      const filter = group.values.map(postgrestQuoted).join(",");
      const response = await this.client.request<CompanyIdentityRow[]>(`companies?select=id&workspace_id=eq.${this.workspace.workspaceId}&${group.field}=in.(${encodeURIComponent(filter)})&limit=${group.values.length}`);
      if (response.error) throw new Error(response.error.message);
      for (const company of response.data ?? []) companyIds.add(company.id);
    }

    if (!companyIds.size) {
      this.rows = [];
      return [];
    }

    const rows: Row[] = [];
    for (const group of chunks([...companyIds])) {
      const response = await this.client.request<Row[]>(`opportunities?select=id,domain_id,payload&workspace_id=eq.${this.workspace.workspaceId}&archived_at=is.null&company_id=in.(${group.join(",")})&order=id.asc&limit=1000`);
      if (response.error) throw new Error(response.error.message);
      rows.push(...(response.data ?? []));
    }
    this.rows = [...new Map(rows.map((row) => [row.id, row])).values()];
    return this.rows.map((row) => ({ ...row.payload, id: row.domain_id }) as Opportunity);
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

  async upsertBatch(opportunities: readonly Opportunity[], context: { runId: string; providerId: DiscoverySourceKind; collectedAt: string }) {
    const configured = Number(process.env.OPPORTUNITY_PERSISTENCE_BATCH_SIZE ?? 100);
    const batchSize = Number.isFinite(configured) ? Math.max(1, Math.min(250, Math.trunc(configured))) : 100;
    const telemetry: IngestionBatchTelemetry[] = [];
    for (const [index, group] of chunks(opportunities, batchSize).entries()) {
      const batchId = `${context.runId}:${index + 1}`;
      const items = group.map((opportunity) => {
        const source = opportunity.sources?.[0];
        const canonicalKey = opportunity.employerDomain
          ?? opportunity.companyProfile?.canonicalKey
          ?? opportunity.companyName.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const { id: domainId, ...payload } = opportunity;
        return {
          domainId,
          company: {
            canonicalKey,
            name: opportunity.companyName,
            domain: opportunity.employerDomain ?? null,
            website: opportunity.companyProfile?.careersUrl ?? null,
            industry: opportunity.industry === "Not specified" ? null : opportunity.industry,
            country: opportunity.country === "Not specified" ? null : opportunity.country,
            atsProvider: source?.kind === "Employer" ? source.id : null,
            confidence: opportunity.canonicalizationConfidence ?? opportunity.confidenceScore,
            providerId: source?.id ?? opportunity.source,
            sourceEmployerId: opportunity.companyProfile?.canonicalKey ?? opportunity.employerDomain ?? canonicalKey,
            sourceUrl: source?.originalUrl ?? opportunity.sourceUrl ?? null,
            observedAt: opportunity.lastObservedAt ?? opportunity.discoveredAt,
            observation: { evidenceStatus: opportunity.companyProfile?.evidenceStatus ?? "Unknown", sourceKind: source?.kind ?? "Unknown" },
          },
          title: opportunity.jobTitle,
          country: opportunity.country,
          industry: opportunity.industry,
          status: opportunity.status,
          sourceUrl: opportunity.sourceUrl ?? null,
          payload,
        };
      });
      const response = await this.client.request<BatchRpcRow>("rpc/persist_opportunity_batch", {
        method: "POST",
        body: JSON.stringify({ target_workspace: this.workspace.workspaceId, actor_id: this.workspace.executiveId, target_batch_id: batchId, target_provider_id: context.providerId, collected_at: context.collectedAt, items }),
      });
      if (response.error) throw new Error(`Batch ${index + 1} failed: ${response.error.message}`);
      const data = response.data;
      const result = data && typeof data === "object" && "persist_opportunity_batch" in data ? data.persist_opportunity_batch : data;
      if (!result) throw new Error(`Batch ${index + 1} returned no persistence telemetry`);
      telemetry.push(result as IngestionBatchTelemetry);
    }
    this.rows = null;
    return telemetry;
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
        target_website: opportunity.companyProfile?.careersUrl ?? null,
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
