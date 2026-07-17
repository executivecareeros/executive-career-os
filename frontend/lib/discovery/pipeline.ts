import { clusterDuplicateOpportunities, findCanonicalOpportunityIndex, mergeOpportunityObservations } from "../opportunity-universe.ts";
import type { Opportunity } from "@/types/opportunity";
import { DefaultOpportunityNormalizer } from "./normalizer.ts";
import { OpportunityProviderRegistry } from "./registry.ts";
import type { DiscoveryError, DiscoveryJob, DiscoveryRunStatus, IngestionItemResult, IngestionMonitor, OpportunityIngestionOutcome, OpportunityIngestionSink, OpportunityProvider, OpportunityRefreshPolicy, ProviderCollectionRequest } from "./types";

const defaultMonitor: IngestionMonitor = { record() {} };
const defaultPolicies: Record<string, OpportunityRefreshPolicy> = {
  "Official API": { cadenceMinutes: 360, staleAfterHours: 24, maximumAttempts: 3, retryDelayMinutes: 15 },
  "Verified Feed": { cadenceMinutes: 360, staleAfterHours: 24, maximumAttempts: 3, retryDelayMinutes: 15 },
  "Corporate Website": { cadenceMinutes: 720, staleAfterHours: 36, maximumAttempts: 3, retryDelayMinutes: 30 },
  "Executive Search Firm": { cadenceMinutes: 1440, staleAfterHours: 72, maximumAttempts: 2, retryDelayMinutes: 60 },
  "Job Board": { cadenceMinutes: 720, staleAfterHours: 24, maximumAttempts: 3, retryDelayMinutes: 30 },
  Recruiter: { staleAfterHours: 168, maximumAttempts: 1, retryDelayMinutes: 60 },
  Referral: { staleAfterHours: 168, maximumAttempts: 1, retryDelayMinutes: 60 },
  "Manual Import": { staleAfterHours: 336, maximumAttempts: 1, retryDelayMinutes: 60 },
  Unknown: { cadenceMinutes: 1440, staleAfterHours: 72, maximumAttempts: 2, retryDelayMinutes: 60 },
};

const later = (iso: string, minutes?: number) => minutes === undefined ? undefined : new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
const validDate = (value: string) => !Number.isNaN(Date.parse(value));

export function refreshPolicyFor(provider: OpportunityProvider) {
  return defaultPolicies[provider.reliability.type] ?? defaultPolicies.Unknown;
}

export function validateDiscoveryJob(job: DiscoveryJob, provider: OpportunityProvider): string[] {
  const errors: string[] = [];
  if (!job.sourceId.trim()) errors.push("Source identifier is required");
  if (job.source !== provider.id) errors.push("Job source does not match provider");
  if (!job.title.trim()) errors.push("Role title is required");
  if (!job.company.name.trim()) errors.push("Company name is required");
  if (!validDate(job.discoveredAt)) errors.push("Discovery time is invalid");
  if (job.publishedAt && !validDate(job.publishedAt)) errors.push("Publication time is invalid");
  return errors;
}

export class MemoryOpportunityIngestionSink implements OpportunityIngestionSink {
  private readonly records = new Map<string, Opportunity>();
  constructor(initial: readonly Opportunity[] = []) { for (const item of initial) this.records.set(item.id, item); }
  async list() { return [...this.records.values()]; }
  async upsert(opportunity: Opportunity) { this.records.set(opportunity.id, opportunity); }
}

export class OpportunityIngestionPipeline {
  private readonly normalizer = new DefaultOpportunityNormalizer();
  constructor(private readonly registry: OpportunityProviderRegistry, private readonly sink: OpportunityIngestionSink, private readonly monitor: IngestionMonitor = defaultMonitor) {}

  async ingest(providerId: OpportunityProvider["id"], request: ProviderCollectionRequest): Promise<OpportunityIngestionOutcome> {
    const provider = this.registry.get(providerId);
    const policy = refreshPolicyFor(provider);
    const startedAt = request.requestedAt;
    await this.monitor.record({ type: "run-started", runId: request.runId, providerId, occurredAt: startedAt });
    try {
      const health = await provider.health();
      if (["disabled", "unavailable"].includes(health.status)) throw Object.assign(new Error(health.message), { code: "PROVIDER_UNAVAILABLE", retryable: true });
      const batch = await provider.collect(request);
      if (batch.providerId !== provider.id) throw Object.assign(new Error("Provider returned a mismatched batch"), { code: "PROVIDER_BATCH_MISMATCH", retryable: false });
      if (!validDate(batch.collectedAt)) throw Object.assign(new Error("Provider returned an invalid collection time"), { code: "INVALID_PROVIDER_BATCH", retryable: false });
      const existing = [...await this.sink.list()];
      const items: IngestionItemResult[] = [];
      for (const job of batch.jobs.slice(0, request.maximumResults)) {
        const validation = validateDiscoveryJob(job, provider);
        if (validation.length) {
          const error = failure("INVALID_SOURCE_RECORD", validation.join("; "), provider.id, batch.collectedAt, false);
          items.push({ sourceId: job.sourceId, disposition: "rejected", warnings: [], error });
          await this.monitor.record({ type: "item-processed", runId: request.runId, providerId, occurredAt: batch.collectedAt, sourceId: job.sourceId, disposition: "rejected" });
          continue;
        }
        try {
          const normalized = this.normalizer.normalize(job, { configuration: { source: provider.id, enabled: true, priority: 1, maximumResults: request.maximumResults, filters: request.filters }, runId: request.runId, requestedAt: request.requestedAt }, provider.reliability);
          const candidate = { ...normalized.normalizedOpportunity, source: provider.source.name, sources: normalized.normalizedOpportunity.sources?.map(source => ({ ...source, name: provider.source.name })) };
          const sourceIdentity = new Set((candidate.sources ?? []).map((source) => `${source.id}|${source.originalId ?? ""}`));
          const sourceMatchIndex = existing.findIndex((opportunity) => opportunity.sources?.some((source) => sourceIdentity.has(`${source.id}|${source.originalId ?? ""}`)));
          const duplicateIndex = sourceMatchIndex >= 0 ? sourceMatchIndex : findCanonicalOpportunityIndex(existing, candidate);
          const duplicate = duplicateIndex >= 0 ? existing[duplicateIndex] : undefined;
          const repeatedObservation = Boolean(duplicate?.sources?.some(source => candidate.sources?.some(incoming => incoming.id === source.id && incoming.originalId === source.originalId)));
          const opportunity = duplicate ? mergeOpportunityObservations(duplicate, candidate, batch.collectedAt) : candidate;
          await this.sink.upsert(opportunity);
          if (duplicateIndex >= 0) existing[duplicateIndex] = opportunity; else existing.push(opportunity);
          const disposition = repeatedObservation ? "duplicate" : duplicate ? "updated" : "inserted";
          items.push({ sourceId: job.sourceId, disposition, opportunityId: opportunity.id, warnings: normalized.warnings });
          await this.monitor.record({ type: "item-processed", runId: request.runId, providerId, occurredAt: batch.collectedAt, sourceId: job.sourceId, disposition });
        } catch (error) {
          const itemError = failure("NORMALIZATION_FAILED", error instanceof Error ? error.message : "Normalization failed", provider.id, batch.collectedAt, false);
          items.push({ sourceId: job.sourceId, disposition: "rejected", warnings: [], error: itemError });
          await this.monitor.record({ type: "item-processed", runId: request.runId, providerId, occurredAt: batch.collectedAt, sourceId: job.sourceId, disposition: "rejected" });
        }
      }
      if (batch.completeSnapshot) {
        const observedIds = new Set(batch.jobs.map(job => job.sourceId));
        const snapshotScopes = new Set(batch.snapshotScopeKeys ?? []);
        for (const current of existing) {
          if (snapshotScopes.size && !snapshotScopes.has(current.companyProfile?.canonicalKey ?? "")) continue;
          const missing = (current.sources ?? []).filter(source => source.id === provider.id && source.status !== "Closed" && source.originalId && !observedIds.has(source.originalId));
          if (!missing.length) continue;
          const sources = (current.sources ?? []).map(source => missing.includes(source) ? { ...source, status: "Closed" as const, lastFetchedAt: batch.collectedAt, fetchStatus: "Succeeded" as const } : source);
          const remainsActive = sources.some(source => source.status !== "Closed");
          const deactivated: Opportunity = { ...current, sources, status: remainsActive ? current.status : "Archived", closedAt: remainsActive ? current.closedAt : batch.collectedAt, closureReason: remainsActive ? current.closureReason : `${provider.source.name} no longer reports this opportunity`, lifecycle: [...(current.lifecycle ?? []), { status: remainsActive ? current.status : "Archived", occurredAt: batch.collectedAt, reason: remainsActive ? `${provider.source.name} source observation closed` : "No active source continues to report this opportunity", source: "System" }] };
          await this.sink.upsert(deactivated);
          const sourceId = missing.map(source => source.originalId).join(",");
          items.push({ sourceId, disposition: "deactivated", opportunityId: current.id, warnings: [] });
          await this.monitor.record({ type: "item-processed", runId: request.runId, providerId, occurredAt: batch.collectedAt, sourceId, disposition: "deactivated" });
        }
      }
      const imported = items.filter(item => item.disposition === "inserted" || item.disposition === "updated").length;
      const ignored = items.length - imported;
      const errors = items.flatMap(item => item.error ? [item.error] : []);
      const status: DiscoveryRunStatus = errors.length ? imported ? "completed-with-warnings" : "failed" : "completed";
      const finishedAt = new Date().toISOString();
      const run = { id: request.runId, source: provider.id, status, startedAt, finishedAt, durationMs: Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt)), jobsFound: batch.jobs.length, jobsImported: imported, jobsIgnored: ignored, errors, warnings: items.flatMap(item => item.warnings), isDemo: false } as const;
      await this.monitor.record({ type: "run-completed", runId: request.runId, providerId, occurredAt: finishedAt, status, imported, ignored });
      return { run, items, nextRefreshAt: later(batch.collectedAt, policy.cadenceMinutes) };
    } catch (error) {
      const occurredAt = new Date().toISOString();
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "PROVIDER_COLLECTION_FAILED";
      const retryable = !(typeof error === "object" && error && "retryable" in error) || Boolean(error.retryable);
      const discoveryError = failure(code, error instanceof Error ? error.message : "Provider collection failed", provider.id, occurredAt, retryable);
      await this.monitor.record({ type: "run-failed", runId: request.runId, providerId, occurredAt, errorCode: code, retryable });
      return { run: { id: request.runId, source: provider.id, status: "failed", startedAt, finishedAt: occurredAt, durationMs: Math.max(0, Date.parse(occurredAt) - Date.parse(startedAt)), jobsFound: 0, jobsImported: 0, jobsIgnored: 0, errors: [discoveryError], warnings: [], isDemo: false }, items: [], nextRetryAt: retryable ? later(occurredAt, policy.retryDelayMinutes) : undefined };
    }
  }
}

function failure(code: string, message: string, source: OpportunityProvider["id"], occurredAt: string, retryable: boolean): DiscoveryError {
  return { code, message, source, occurredAt, retryable };
}

export function summarizeIngestionDuplicates(opportunities: Opportunity[]) {
  return clusterDuplicateOpportunities(opportunities).filter(cluster => cluster.observations.length > 1);
}
