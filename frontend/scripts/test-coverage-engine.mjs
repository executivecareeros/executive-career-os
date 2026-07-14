import assert from "node:assert/strict";
import { MemoryCoverageQueueStore, OpportunityCoverageEngine } from "../lib/discovery/coverage-engine.ts";
import { MemoryOpportunityIngestionSink } from "../lib/discovery/pipeline.ts";

const job = (source, sourceId, company, title, time) => ({ sourceId, source, title, company: { sourceId: company.toLowerCase(), name: company }, location: "London, United Kingdom", country: "United Kingdom", originalUrl: `https://example.com/${sourceId}`, publishedAt: time, discoveredAt: time, rawMetadata: { workArrangement: "Hybrid" } });
const provider = (id, name, jobs, health = "connected") => ({ id, source: { id, name, category: "Corporate Website", description: name, capabilities: ["jobs", "companies"] }, reliability: { type: "Corporate Website", rating: "high", score: 90, rationale: "Published employer record", assessedAt: "2026-07-14T09:00:00Z" }, async collect(request) { return { providerId: id, collectedAt: request.requestedAt, jobs }; }, async health() { return { source: id, status: health, checkedAt: "2026-07-14T09:00:00Z", message: health }; } });

const clock = () => new Date("2026-07-14T10:00:00Z");
const sink = new MemoryOpportunityIngestionSink();
const queue = new MemoryCoverageQueueStore();
const engine = new OpportunityCoverageEngine(sink, queue, undefined, clock)
  .register(provider("greenhouse", "Greenhouse", [job("greenhouse", "gh-1", "Northstar", "VP Sales", clock().toISOString())]), { priority: 2, enabled: true, maximumResults: 20 })
  .register(provider("lever", "Lever", [job("lever", "lv-9", "Northstar", "VP Sales", clock().toISOString())]), { priority: 1, enabled: true, maximumResults: 20 });

await engine.enqueue("greenhouse");
await engine.enqueue("lever");
const first = await engine.runNext();
assert.equal(first.run.source, "lever", "Higher-priority provider must run first");
await engine.runNext();
assert.equal((await sink.list()).length, 1, "Cross-provider observations must create one canonical opportunity");
assert.equal((await sink.list())[0].sources.length, 2, "Canonical opportunity must preserve both sources");
const snapshot = await engine.snapshot();
assert.equal(snapshot.metrics.registeredProviders, 2);
assert.equal(snapshot.metrics.healthyProviders, 2);
assert.equal(snapshot.metrics.opportunitiesObserved, 2);
assert.equal(snapshot.metrics.opportunitiesImported, 2);
assert.equal(snapshot.metrics.qualityRate, 100);
assert.equal(snapshot.metrics.freshnessRate, 100);

let attempts = 0;
const retryEngine = new OpportunityCoverageEngine(new MemoryOpportunityIngestionSink(), new MemoryCoverageQueueStore(), undefined, clock).register({ ...provider("ashby", "Ashby", []), async collect() { attempts += 1; throw Object.assign(new Error("Temporary outage"), { retryable: true }); } }, { priority: 1, enabled: true, maximumResults: 10 });
await retryEngine.enqueue("ashby");
const failed = await retryEngine.runNext();
assert.equal(failed.run.status, "failed");
assert.equal((await retryEngine.snapshot()).queue[0].status, "retrying");
assert.equal(attempts, 1);
console.log("Opportunity Coverage Engine checks passed.");
