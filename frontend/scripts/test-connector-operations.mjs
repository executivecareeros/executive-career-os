import assert from "node:assert/strict";
import { buildConnectorOperationsSnapshot, classifyOperationalFailure, connectorOperationsVersion, searchOperationalFailures } from "../lib/discovery/connector-operations.ts";
import { MemoryOpportunityIngestionSink, OpportunityIngestionPipeline } from "../lib/discovery/pipeline.ts";
import { OpportunityProviderRegistry } from "../lib/discovery/registry.ts";
import { GreenhouseOpportunityProvider } from "../lib/discovery/providers/greenhouse.ts";
import { LeverOpportunityProvider } from "../lib/discovery/providers/lever.ts";
import { AshbyOpportunityProvider } from "../lib/discovery/providers/ashby.ts";
import { WorkableOpportunityProvider } from "../lib/discovery/providers/workable.ts";
import { greenhouseProviderManifest, leverProviderManifest, ashbyProviderManifest, workableProviderManifest } from "../lib/discovery/providers/manifests.ts";
import { runProviderCertification } from "../lib/discovery/provider-certification.ts";

const filters = { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] };
const fixtures = {
  greenhouse: async (input) => String(input).endsWith("/v1/boards/operations") ? new Response(JSON.stringify({ name: "Operations Employer" })) : new Response(JSON.stringify({ jobs: [{ id: 1, title: "Chief Revenue Officer", updated_at: "2026-07-17T08:00:00Z", absolute_url: "https://job-boards.greenhouse.io/operations/jobs/1", location: { name: "London" }, content: "Lead revenue." }], meta: { total: 1 } })),
  lever: async () => new Response(JSON.stringify([{ id: "one", text: "Chief Revenue Officer", categories: { location: "London", commitment: "Full-time" }, descriptionPlain: "Lead revenue.", hostedUrl: "https://jobs.lever.co/operations/one" }])),
  ashby: async () => new Response(JSON.stringify({ apiVersion: "1", jobs: [{ title: "Chief Revenue Officer", location: "London", isListed: true, descriptionPlain: "Lead revenue.", publishedAt: "2026-07-17T08:00:00Z", jobUrl: "https://jobs.ashbyhq.com/operations/one" }] })),
  workable: async () => new Response(JSON.stringify({ name: "Operations Employer", jobs: [{ title: "Chief Revenue Officer", shortcode: "one", country: "United Kingdom", city: "London", published_on: "2026-07-17", full_description: "Lead revenue.", url: "https://apply.workable.com/operations/j/one" }] })),
};
const definitions = [
  { provider: new GreenhouseOpportunityProvider("operations", fixtures.greenhouse), manifest: greenhouseProviderManifest },
  { provider: new LeverOpportunityProvider("operations", "global", "Operations Employer", fixtures.lever), manifest: leverProviderManifest },
  { provider: new AshbyOpportunityProvider("operations", "Operations Employer", fixtures.ashby), manifest: ashbyProviderManifest },
  { provider: new WorkableOpportunityProvider("operations", fixtures.workable), manifest: workableProviderManifest },
];

for (const { provider, manifest } of definitions) {
  const certification = { ...await runProviderCertification(provider, manifest, 100), certifiedAt: "2026-07-17T12:04:00.000Z" };
  const sink = new MemoryOpportunityIngestionSink();
  const pipeline = new OpportunityIngestionPipeline(new OpportunityProviderRegistry().register(provider), sink);
  const first = await pipeline.ingest(provider.id, { runId: `${provider.id}-first`, requestedAt: "2026-07-17T12:00:00.000Z", maximumResults: 100, filters });
  const replay = await pipeline.ingest(provider.id, { runId: `${provider.id}-replay`, requestedAt: "2026-07-17T12:01:00.000Z", maximumResults: 100, filters });
  const evidencedFirst = { ...first, run: { ...first.run, finishedAt: "2026-07-17T12:00:10.000Z", durationMs: 10_000 } };
  const evidencedReplay = { ...replay, run: { ...replay.run, finishedAt: "2026-07-17T12:01:10.000Z", durationMs: 10_000 } };
  const inventory = (await sink.list()).map((item) => ({ ...item, lastObservedAt: "2026-07-17T12:01:00.000Z" }));
  const health = await provider.health();
  const snapshot = buildConnectorOperationsSnapshot({ manifest, health, certification, runs: [evidencedFirst, evidencedReplay], inventory, replayRunIds: [replay.run.id], measuredAt: "2026-07-17T12:05:00.000Z" });
  assert.equal(snapshot.version, connectorOperationsVersion);
  assert.equal(snapshot.providerId, provider.id);
  assert.equal(snapshot.health, "Healthy");
  assert.equal(snapshot.certificationStatus, "Passed");
  assert.equal(snapshot.replay.replayConfidence, "Measured");
  assert.equal(snapshot.replay.canonicalDelta, 0);
  assert.equal(snapshot.replay.unexpectedClosures, 0);
  assert.equal(snapshot.operationalTrust.score, 100);
  assert.equal(snapshot.operationalTrust.method, "weakest-measured-control");
  assert.equal(snapshot.inventory.canonicalOpportunities, 1);
  assert.equal(snapshot.discovery.runs, 2);
  assert.equal(snapshot.operationalHistory.some((event) => event.kind === "certification"), true);
  assert.equal(snapshot.operationalHistory.some((event) => event.kind === "replay-completed"), true);
}

assert.equal(classifyOperationalFailure("HTTP_429_RATE_LIMIT"), "Rate limiting");
assert.equal(classifyOperationalFailure("NORMALIZATION_FAILED"), "Mapping");
assert.equal(classifyOperationalFailure("REQUEST_TIMEOUT"), "Timeout");
const failures = [{ providerId: "workable", kind: "failure", occurredAt: "2026-07-17T12:00:00Z", status: "failed", failureClass: "Timeout", code: "REQUEST_TIMEOUT" }];
assert.equal(searchOperationalFailures(failures, { providerId: "workable", failureClass: "Timeout" }).length, 1);
assert.equal(searchOperationalFailures(failures, { providerId: "lever" }).length, 0);

const failedRun = {
  run: { id: "failed", source: "workable", status: "failed", startedAt: "2026-07-17T12:00:00.000Z", finishedAt: "2026-07-17T12:00:01.000Z", durationMs: 1000, jobsFound: 0, jobsImported: 0, jobsIgnored: 0, errors: [{ code: "REQUEST_TIMEOUT", message: "Timed out", source: "workable", occurredAt: "2026-07-17T12:00:01.000Z", retryable: true }], warnings: [], isDemo: false },
  items: [], nextRetryAt: "2026-07-17T12:15:01.000Z",
};
const recoveredRun = { ...failedRun, run: { ...failedRun.run, id: "recovered", status: "completed", startedAt: "2026-07-17T12:16:00.000Z", finishedAt: "2026-07-17T12:16:01.000Z", errors: [] }, nextRetryAt: undefined };
assert.equal(buildConnectorOperationsSnapshot({ manifest: workableProviderManifest, measuredAt: "2026-07-17T12:20:00.000Z" }).health, "Unknown");
assert.equal(buildConnectorOperationsSnapshot({ manifest: workableProviderManifest, health: { source: "workable", status: "unavailable", checkedAt: "2026-07-17T12:20:00.000Z", message: "Unavailable" }, measuredAt: "2026-07-17T12:20:00.000Z" }).health, "Offline");
assert.equal(buildConnectorOperationsSnapshot({ manifest: workableProviderManifest, health: { source: "workable", status: "connected", checkedAt: "2026-07-17T12:20:00.000Z", message: "Connected" }, runs: [failedRun], measuredAt: "2026-07-17T12:20:00.000Z" }).health, "Degraded");
const recovering = buildConnectorOperationsSnapshot({ manifest: workableProviderManifest, health: { source: "workable", status: "connected", checkedAt: "2026-07-17T12:20:00.000Z", message: "Connected" }, runs: [failedRun, recoveredRun], measuredAt: "2026-07-17T12:20:00.000Z" });
assert.equal(recovering.health, "Recovering");
assert.equal(recovering.operationalHistory.some((event) => event.kind === "recovery"), true);
assert.equal(buildConnectorOperationsSnapshot({ manifest: workableProviderManifest, health: { source: "workable", status: "connected", checkedAt: "2026-07-17T12:20:00.000Z", message: "Connected" }, runs: [recoveredRun], measuredAt: "2026-07-17T12:20:00.000Z" }).health, "Warning");

console.log("Connector Engineering Operations Platform checks passed for Greenhouse, Lever, Ashby, and Workable.");
