import assert from "node:assert/strict";
import { MemoryOpportunityIngestionSink, OpportunityIngestionPipeline } from "../lib/discovery/pipeline.ts";
import { OpportunityProviderRegistry } from "../lib/discovery/registry.ts";

const requestedAt = "2026-07-14T08:00:00.000Z";
const filters = { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] };
const source = (id, name) => ({ id, name, category: "Corporate Website", description: `${name} approved provider`, capabilities: ["jobs"] });
const reliability = { type: "Corporate Website", rating: "high", score: 90, rationale: "Direct employer publication", assessedAt: requestedAt };
const job = (sourceId, providerId, overrides = {}) => ({ sourceId, source: providerId, title: "Chief Revenue Officer", company: { sourceId: `company-${sourceId}`, name: "North Star Holdings", country: "United Kingdom" }, location: "London", country: "United Kingdom", originalUrl: `https://example.test/${sourceId}`, publishedAt: requestedAt, discoveredAt: requestedAt, rawMetadata: { workArrangement: "Hybrid" }, ...overrides });
const provider = (id, name, jobs, health = "connected") => ({ id, source: source(id, name), reliability, async collect(request) { return { providerId: id, collectedAt: request.requestedAt, jobs }; }, async health() { return { source: id, status: health, checkedAt: requestedAt, message: health }; } });

const registry = new OpportunityProviderRegistry()
  .register(provider("greenhouse", "Greenhouse", [job("gh-1", "greenhouse")]))
  .register(provider("lever", "Lever", [job("lever-1", "lever")]))
  .register(provider("ashby", "Ashby", [job("", "ashby", { title: "" })]))
  .register(provider("smartrecruiters", "SmartRecruiters", [], "unavailable"));
const sink = new MemoryOpportunityIngestionSink();
const events = [];
const pipeline = new OpportunityIngestionPipeline(registry, sink, { record(event) { events.push(event); } });
const request = runId => ({ runId, requestedAt, maximumResults: 25, filters });

const first = await pipeline.ingest("greenhouse", request("run-1"));
assert.equal(first.run.status, "completed");
assert.equal(first.items[0].disposition, "inserted");
assert.equal(first.nextRefreshAt, "2026-07-14T20:00:00.000Z");
assert.equal((await sink.list())[0].employerDomain, undefined, "An ATS posting host must never become the employer domain");

const reconciled = await pipeline.ingest("lever", request("run-2"));
assert.equal(reconciled.items[0].disposition, "updated");
const stored = await sink.list();
assert.equal(stored.length, 1);
assert.equal(stored[0].sources.length, 2);
assert.equal(stored[0].freshness.status, "Fresh");
assert.equal(stored[0].source, "Greenhouse · Lever");

const repeated = await pipeline.ingest("greenhouse", request("run-2b"));
assert.equal(repeated.items[0].disposition, "duplicate");
assert.equal((await sink.list()).length, 1);

const invalid = await pipeline.ingest("ashby", request("run-3"));
assert.equal(invalid.run.status, "failed");
assert.equal(invalid.items[0].disposition, "rejected");
assert.equal(invalid.items[0].error.code, "INVALID_SOURCE_RECORD");

const unavailable = await pipeline.ingest("smartrecruiters", request("run-4"));
assert.equal(unavailable.run.status, "failed");
assert.equal(unavailable.run.errors[0].code, "PROVIDER_UNAVAILABLE");
assert.ok(unavailable.nextRetryAt);
assert.ok(events.some(event => event.type === "run-completed"));
assert.ok(events.some(event => event.type === "run-failed"));

const distinctRegistry = new OpportunityProviderRegistry().register(provider("greenhouse", "Greenhouse", [job("gh-100", "greenhouse"), job("gh-101", "greenhouse")]));
const distinctSink = new MemoryOpportunityIngestionSink();
await new OpportunityIngestionPipeline(distinctRegistry, distinctSink).ingest("greenhouse", request("run-distinct"));
assert.equal((await distinctSink.list()).length, 2, "Different requisitions from the same provider must remain separate");

const closureRegistry = new OpportunityProviderRegistry().register({ ...provider("greenhouse", "Greenhouse", []), async collect(current) { return { providerId: "greenhouse", collectedAt: current.requestedAt, jobs: [], completeSnapshot: true }; } });
const closureSink = new MemoryOpportunityIngestionSink(await distinctSink.list());
const closure = await new OpportunityIngestionPipeline(closureRegistry, closureSink).ingest("greenhouse", request("run-close"));
assert.equal(closure.items.filter(item => item.disposition === "deactivated").length, 2);
assert.equal((await closureSink.list()).every(item => item.status === "Archived" && item.sources.every(source => source.status === "Closed")), true, "A complete source snapshot must deactivate missing jobs");

const scopedJobs = [
  job("scope-a-1", "ashby", { title: "Vice President Sales", company: { sourceId: "a", canonicalKey: "ashby:scope-a", name: "Scope A" } }),
  job("scope-b-1", "ashby", { title: "Chief Commercial Officer", company: { sourceId: "b", canonicalKey: "ashby:scope-b", name: "Scope B" } }),
];
const scopedInitialRegistry = new OpportunityProviderRegistry().register(provider("ashby", "Ashby", scopedJobs));
const scopedSink = new MemoryOpportunityIngestionSink();
await new OpportunityIngestionPipeline(scopedInitialRegistry, scopedSink).ingest("ashby", request("run-scoped-initial"));
const scopedClosureRegistry = new OpportunityProviderRegistry().register({ ...provider("ashby", "Ashby", []), async collect(current) { return { providerId: "ashby", collectedAt: current.requestedAt, jobs: [], completeSnapshot: true, snapshotScopeKeys: ["ashby:scope-a"] }; } });
const scopedClosure = await new OpportunityIngestionPipeline(scopedClosureRegistry, scopedSink).ingest("ashby", request("run-scoped-close"));
assert.equal(scopedClosure.items.filter(item => item.disposition === "deactivated").length, 1, "A complete snapshot may close only its declared employer/feed scope");
assert.equal((await scopedSink.list()).find(item => item.companyProfile?.canonicalKey === "ashby:scope-b")?.status, "Discovered", "One employer cohort must never archive another cohort from the same provider");
const scopedRestoreRegistry = new OpportunityProviderRegistry().register(provider("ashby", "Ashby", [scopedJobs[0]]));
await new OpportunityIngestionPipeline(scopedRestoreRegistry, scopedSink).ingest("ashby", request("run-scoped-restore"));
assert.equal((await scopedSink.list()).find(item => item.companyProfile?.canonicalKey === "ashby:scope-a")?.status, "Discovered", "A newly observed active source must restore a previously archived canonical opportunity");

console.log("Discovery ingestion pipeline checks passed.");
