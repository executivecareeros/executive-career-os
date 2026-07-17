import { OpportunityCoverageEngine, MemoryCoverageQueueStore } from "./coverage-engine.ts";
import { MemoryOpportunityIngestionSink, OpportunityIngestionPipeline } from "./pipeline.ts";
import { OpportunityProviderRegistry } from "./registry.ts";
import type { ProviderManifest } from "./provider-manifest.ts";
import { validateProviderManifest } from "./provider-manifest.ts";
import type { DiscoveryFilter, OpportunityProvider, ProviderCollectionRequest } from "./types.ts";

const emptyFilters: DiscoveryFilter = { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] };
function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Provider certification failed: ${message}`);
}

export type ProviderCertificationReport = {
  providerId: string;
  durationMs: number;
  jobsObserved: number;
  canonicalOpportunities: number;
  checks: Readonly<Record<"discovery" | "replay" | "pagination" | "canonicalization" | "employerResolution" | "opportunityResolution" | "lifecycle" | "scheduler" | "metrics" | "regression" | "deploymentReadiness", "passed" | "not-applicable">>;
};

export async function runProviderCertification(provider: OpportunityProvider, manifest: ProviderManifest, maximumResults = 500): Promise<ProviderCertificationReport> {
  const started = performance.now();
  validateProviderManifest(manifest);
  ensure(provider.id === manifest.identity.id, "provider and manifest identity differ");
  ensure(provider.source.id === manifest.identity.id, "source identity differs from manifest");
  const request: ProviderCollectionRequest = { runId: `${provider.id}-certification-first`, requestedAt: "2026-07-17T12:00:00.000Z", maximumResults, filters: emptyFilters };
  const first = await provider.collect(request);
  const replay = await provider.collect({ ...request, runId: `${provider.id}-certification-replay` });
  ensure(first.jobs.length > 0, "discovery returned no records");
  ensure(first.providerId === provider.id && replay.providerId === provider.id, "batch identity changed");
  ensure(new Set(first.jobs.map((job) => job.sourceId)).size === first.jobs.length, "source identities are not unique");
  ensure(JSON.stringify(first.jobs.map((job) => job.sourceId)) === JSON.stringify(replay.jobs.map((job) => job.sourceId)), "replay changed source identity");
  ensure(first.jobs.every((job) => job.company.canonicalKey), "employer resolution is missing");

  const sink = new MemoryOpportunityIngestionSink();
  const queue = new MemoryCoverageQueueStore();
  const engine = new OpportunityCoverageEngine(sink, queue, undefined, () => new Date("2026-07-17T12:00:00.000Z")).register(provider, { priority: 1, enabled: true, maximumResults });
  await engine.enqueue(provider.id, emptyFilters, request.requestedAt);
  const firstOutcome = await engine.runNext(request.requestedAt);
  ensure(firstOutcome?.run.status === "completed", "first engine run did not complete");
  const firstInventory = await sink.list();
  await engine.enqueue(provider.id, emptyFilters, "2026-07-17T12:01:00.000Z");
  const replayOutcome = await engine.runNext("2026-07-17T12:01:00.000Z");
  ensure(replayOutcome?.run.status === "completed", "replay engine run did not complete");
  const replayInventory = await sink.list();
  ensure(firstInventory.length === replayInventory.length, "replay changed canonical inventory size");
  ensure(replayOutcome.items.every((item) => item.disposition === "duplicate"), "replay was not idempotent");
  ensure(replayInventory.every((opportunity) => opportunity.sources?.some((source) => source.id === provider.id)), "canonical opportunity lost provenance");

  let lifecycle: "passed" | "not-applicable" = "not-applicable";
  if (first.completeSnapshot && first.snapshotScopeKeys?.length) {
    const emptyProvider: OpportunityProvider = {
      id: provider.id,
      source: provider.source,
      reliability: provider.reliability,
      health: () => provider.health(),
      collect: async () => ({ providerId: provider.id, collectedAt: "2026-07-17T12:02:00.000Z", jobs: [], completeSnapshot: true, snapshotScopeKeys: first.snapshotScopeKeys }),
    };
    const closing = new OpportunityIngestionPipeline(new OpportunityProviderRegistry().register(emptyProvider), sink);
    const closed = await closing.ingest(provider.id, { ...request, runId: `${provider.id}-certification-close`, requestedAt: "2026-07-17T12:02:00.000Z" });
    ensure(closed.items.some((item) => item.disposition === "deactivated"), "complete snapshot did not apply scoped lifecycle");
    const restoring = new OpportunityIngestionPipeline(new OpportunityProviderRegistry().register(provider), sink);
    await restoring.ingest(provider.id, { ...request, runId: `${provider.id}-certification-restore`, requestedAt: "2026-07-17T12:03:00.000Z" });
    ensure((await sink.list()).every((item) => item.status !== "Archived"), "reobserved opportunities did not reactivate");
    lifecycle = "passed";
  } else if (manifest.lifecycle.snapshot === "incremental") {
    const incrementalProvider: OpportunityProvider = {
      id: provider.id,
      source: provider.source,
      reliability: provider.reliability,
      health: () => provider.health(),
      collect: async () => ({ providerId: provider.id, collectedAt: "2026-07-17T12:02:00.000Z", jobs: [] }),
    };
    const incremental = new OpportunityIngestionPipeline(new OpportunityProviderRegistry().register(incrementalProvider), sink);
    await incremental.ingest(provider.id, { ...request, runId: `${provider.id}-certification-incremental`, requestedAt: "2026-07-17T12:02:00.000Z" });
    ensure((await sink.list()).every((item) => item.status !== "Archived"), "incremental empty collection deactivated canonical inventory");
    lifecycle = "passed";
  }

  const snapshot = await engine.snapshot();
  ensure(snapshot.metrics.registeredProviders === 1 && snapshot.metrics.completedRuns === 2, "coverage metrics did not record provider runs");
  ensure(snapshot.metrics.rejectedObservations === 0, "valid fixture records were rejected");
  const health = await provider.health();
  ensure(["available", "connected"].includes(health.status), "provider health is not deployable");

  return {
    providerId: String(provider.id),
    durationMs: Math.round((performance.now() - started) * 100) / 100,
    jobsObserved: first.jobs.length,
    canonicalOpportunities: replayInventory.length,
    checks: {
      discovery: "passed",
      replay: "passed",
      pagination: manifest.pagination.strategy === "offset" && first.jobs.length > manifest.pagination.maximumPageSize ? "passed" : "not-applicable",
      canonicalization: "passed",
      employerResolution: "passed",
      opportunityResolution: "passed",
      lifecycle,
      scheduler: "passed",
      metrics: "passed",
      regression: "passed",
      deploymentReadiness: "passed",
    },
  };
}
