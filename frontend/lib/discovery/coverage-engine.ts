import { randomUUID } from "node:crypto";
import { assessOpportunityFreshness } from "../opportunity-universe.ts";
import { OpportunityIngestionPipeline, refreshPolicyFor } from "./pipeline.ts";
import { OpportunityProviderRegistry } from "./registry.ts";
import type { CoverageQueueItem, CoverageQueueStore, DiscoveryFilter, DiscoveryHealth, IngestionMonitor, OpportunityCoverageSnapshot, OpportunityIngestionOutcome, OpportunityIngestionSink, OpportunityProvider, OpportunityProviderRegistration } from "./types";

const emptyFilters: DiscoveryFilter = { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] };
const nowClock = () => new Date();

export class MemoryCoverageQueueStore implements CoverageQueueStore {
  private readonly items = new Map<string, CoverageQueueItem>();
  async list() { return [...this.items.values()]; }
  async put(item: CoverageQueueItem) { this.items.set(item.id, item); }
  async remove(id: string) { this.items.delete(id); }
}

export class OpportunityCoverageEngine {
  private readonly registry = new OpportunityProviderRegistry();
  private readonly registrations = new Map<OpportunityProvider["id"], OpportunityProviderRegistration>();
  private readonly outcomes: OpportunityIngestionOutcome[] = [];
  private readonly pipeline: OpportunityIngestionPipeline;

  constructor(private readonly sink: OpportunityIngestionSink, private readonly queue: CoverageQueueStore = new MemoryCoverageQueueStore(), monitor?: IngestionMonitor, private readonly clock: () => Date = nowClock) {
    this.pipeline = new OpportunityIngestionPipeline(this.registry, sink, monitor);
  }

  register(provider: OpportunityProvider, configuration: Omit<OpportunityProviderRegistration, "providerId">) {
    if (!Number.isInteger(configuration.priority) || configuration.priority < 1) throw new Error("Provider priority must be a positive integer");
    if (!Number.isInteger(configuration.maximumResults) || configuration.maximumResults < 1) throw new Error("Maximum results must be a positive integer");
    this.registry.register(provider);
    this.registrations.set(provider.id, { ...configuration, providerId: provider.id });
    return this;
  }

  async health(): Promise<readonly DiscoveryHealth[]> {
    return Promise.all(this.registry.list().map((provider) => provider.health()));
  }

  async enqueue(providerId: OpportunityProvider["id"], filters: DiscoveryFilter = emptyFilters, requestedAt = this.clock().toISOString()) {
    const registration = this.registrations.get(providerId);
    if (!registration) throw new Error(`Provider not registered: ${providerId}`);
    if (!registration.enabled) throw new Error(`Provider disabled: ${providerId}`);
    const policy = refreshPolicyFor(this.registry.get(providerId));
    const item: CoverageQueueItem = { id: randomUUID(), providerId, status: "queued", priority: registration.priority, attempt: 0, maximumAttempts: policy.maximumAttempts, requestedAt, availableAt: requestedAt, filters };
    await this.queue.put(item);
    return item;
  }

  async enqueueDue(at = this.clock().toISOString()) {
    const queued: CoverageQueueItem[] = [];
    const existing = await this.queue.list();
    for (const registration of this.registrations.values()) {
      if (!registration.enabled || !registration.schedule?.enabled || !registration.schedule.nextRunAt || registration.schedule.nextRunAt > at) continue;
      if (existing.some((item) => item.providerId === registration.providerId && ["queued", "retrying", "running"].includes(item.status))) continue;
      queued.push(await this.enqueue(registration.providerId, emptyFilters, at));
    }
    return queued;
  }

  async runNext(at = this.clock().toISOString()) {
    const candidates = (await this.queue.list()).filter((item) => ["queued", "retrying"].includes(item.status) && item.availableAt <= at).sort((a, b) => a.priority - b.priority || a.requestedAt.localeCompare(b.requestedAt));
    const item = candidates[0];
    if (!item) return undefined;
    const registration = this.registrations.get(item.providerId)!;
    await this.queue.put({ ...item, status: "running", attempt: item.attempt + 1 });
    const outcome = await this.pipeline.ingest(item.providerId, { runId: item.id, requestedAt: at, maximumResults: registration.maximumResults, filters: item.filters });
    this.outcomes.push(outcome);
    if (outcome.run.status === "failed" && outcome.nextRetryAt && item.attempt + 1 < item.maximumAttempts) await this.queue.put({ ...item, status: "retrying", attempt: item.attempt + 1, availableAt: outcome.nextRetryAt });
    else await this.queue.put({ ...item, status: outcome.run.status === "failed" ? "failed" : "completed", attempt: item.attempt + 1, availableAt: outcome.nextRefreshAt ?? at });
    return outcome;
  }

  async snapshot(): Promise<OpportunityCoverageSnapshot> {
    const [health, queue, opportunities] = await Promise.all([this.health(), this.queue.list(), this.sink.list()]);
    const items = this.outcomes.flatMap((outcome) => outcome.items);
    const observed = this.outcomes.reduce((total, outcome) => total + outcome.run.jobsFound, 0);
    const imported = items.filter((item) => item.disposition === "inserted" || item.disposition === "updated").length;
    const rejected = items.filter((item) => item.disposition === "rejected").length;
    const fresh = opportunities.filter((opportunity) => ["Fresh", "Recent"].includes(assessOpportunityFreshness(opportunity, this.clock().toISOString()).status)).length;
    return { providers: [...this.registrations.values()].sort((a, b) => a.priority - b.priority), queue, metrics: { registeredProviders: this.registrations.size, healthyProviders: health.filter((item) => ["available", "connected"].includes(item.status)).length, queuedRuns: queue.filter((item) => ["queued", "retrying", "running"].includes(item.status)).length, completedRuns: this.outcomes.filter((item) => item.run.status !== "failed").length, failedRuns: this.outcomes.filter((item) => item.run.status === "failed").length, opportunitiesObserved: observed, opportunitiesImported: imported, duplicateObservations: items.filter((item) => item.disposition === "duplicate").length, rejectedObservations: rejected, qualityRate: observed ? Math.round(((observed - rejected) / observed) * 100) : 100, freshnessRate: opportunities.length ? Math.round((fresh / opportunities.length) * 100) : 100, calculatedAt: this.clock().toISOString() } };
  }
}
