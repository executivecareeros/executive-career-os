import { randomUUID } from "node:crypto";
import { summarizeCanonicalInventory } from "../opportunity-universe.ts";
import { OpportunityIngestionPipeline, refreshPolicyFor } from "./pipeline.ts";
import { OpportunityProviderRegistry } from "./registry.ts";
import type { CoverageQueueItem, CoverageQueueStore, CoverageRunStore, DiscoveryFilter, DiscoveryHealth, IngestionMonitor, OpportunityCoverageSnapshot, OpportunityIngestionOutcome, OpportunityIngestionSink, OpportunityProvider, OpportunityProviderRegistration } from "./types";

const emptyFilters: DiscoveryFilter = { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] };
const nowClock = () => new Date();

export class MemoryCoverageQueueStore implements CoverageQueueStore {
  private readonly items = new Map<string, CoverageQueueItem>();
  async list() { return [...this.items.values()]; }
  async put(item: CoverageQueueItem) { this.items.set(item.id, item); }
  async remove(id: string) { const item = this.items.get(id); if (item) this.items.set(id, { ...item, status: "cancelled" }); }
  async claimNext(availableAt: string) {
    const item = [...this.items.values()].filter((candidate) => ["queued", "retrying"].includes(candidate.status) && candidate.availableAt <= availableAt).sort((a, b) => a.priority - b.priority || a.requestedAt.localeCompare(b.requestedAt))[0];
    if (!item) return undefined;
    const claimed = { ...item, status: "running" as const, attempt: item.attempt + 1 };
    this.items.set(item.id, claimed);
    return claimed;
  }
}

export class MemoryCoverageRunStore implements CoverageRunStore {
  private readonly outcomes: OpportunityIngestionOutcome[] = [];
  async list() { return [...this.outcomes]; }
  async put(outcome: OpportunityIngestionOutcome) { this.outcomes.push(outcome); }
}

export class OpportunityCoverageEngine {
  private readonly registry = new OpportunityProviderRegistry();
  private readonly registrations = new Map<OpportunityProvider["id"], OpportunityProviderRegistration>();
  private readonly pipeline: OpportunityIngestionPipeline;

  constructor(private readonly sink: OpportunityIngestionSink, private readonly queue: CoverageQueueStore = new MemoryCoverageQueueStore(), monitor?: IngestionMonitor, private readonly clock: () => Date = nowClock, private readonly runs: CoverageRunStore = new MemoryCoverageRunStore()) {
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
    const workerId = randomUUID();
    const item = this.queue.claimNext
      ? await this.queue.claimNext(at, workerId, 300)
      : (await this.queue.list()).filter((candidate) => ["queued", "retrying"].includes(candidate.status) && candidate.availableAt <= at).sort((a, b) => a.priority - b.priority || a.requestedAt.localeCompare(b.requestedAt))[0];
    if (!item) return undefined;
    const registration = this.registrations.get(item.providerId)!;
    const attempt = this.queue.claimNext ? item.attempt : item.attempt + 1;
    if (!this.queue.claimNext) await this.queue.put({ ...item, status: "running", attempt });
    const outcome = await this.pipeline.ingest(item.providerId, { runId: item.id, requestedAt: at, maximumResults: registration.maximumResults, filters: item.filters });
    await this.runs.put(outcome, attempt);
    if (outcome.run.status === "failed" && outcome.nextRetryAt && attempt < item.maximumAttempts) await this.queue.put({ ...item, status: "retrying", attempt, availableAt: outcome.nextRetryAt });
    else await this.queue.put({ ...item, status: outcome.run.status === "failed" ? "failed" : "completed", attempt, availableAt: outcome.nextRefreshAt ?? at });
    return outcome;
  }

  async snapshot(): Promise<OpportunityCoverageSnapshot> {
    const [health, queue, opportunities, outcomes] = await Promise.all([this.health(), this.queue.list(), this.sink.list(), this.runs.list()]);
    const items = outcomes.flatMap((outcome) => outcome.items);
    const observed = outcomes.reduce((total, outcome) => total + outcome.run.jobsFound, 0);
    const imported = items.filter((item) => item.disposition === "inserted" || item.disposition === "updated").length;
    const rejected = items.filter((item) => item.disposition === "rejected").length;
    const inventory = summarizeCanonicalInventory(opportunities, this.clock().toISOString());
    return { providers: [...this.registrations.values()].sort((a, b) => a.priority - b.priority), queue, metrics: { registeredProviders: this.registrations.size, healthyProviders: health.filter((item) => ["available", "connected"].includes(item.status)).length, queuedRuns: queue.filter((item) => ["queued", "retrying", "running"].includes(item.status)).length, completedRuns: outcomes.filter((item) => item.run.status !== "failed").length, failedRuns: outcomes.filter((item) => item.run.status === "failed").length, opportunitiesObserved: observed, opportunitiesImported: imported, ...inventory, duplicateObservations: items.filter((item) => item.disposition === "duplicate").length, rejectedObservations: rejected, qualityRate: observed ? Math.round(((observed - rejected) / observed) * 100) : 100, freshnessRate: inventory.activeCanonicalOpportunities ? Math.round(((inventory.activeCanonicalOpportunities - inventory.staleOpportunities) / inventory.activeCanonicalOpportunities) * 100) : 100, calculatedAt: this.clock().toISOString() } };
  }
}
