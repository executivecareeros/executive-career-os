import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { MemoryCoverageQueueStore, MemoryCoverageRunStore, OpportunityCoverageEngine } from "../lib/discovery/coverage-engine.ts";
import { MemoryOpportunityIngestionSink } from "../lib/discovery/pipeline.ts";

const time = "2026-07-17T12:00:00.000Z";
const clock = () => new Date(time);
const provider = {
  id: "greenhouse",
  source: { id: "greenhouse", name: "Greenhouse", category: "Corporate Website", description: "Official employer board", capabilities: ["jobs", "companies"] },
  reliability: { type: "Corporate Website", rating: "high", score: 90, rationale: "Employer evidence", assessedAt: time },
  async collect() { return { providerId: "greenhouse", collectedAt: time, completeSnapshot: true, jobs: [{ sourceId: "gh-1", source: "greenhouse", title: "Chief Revenue Officer", company: { sourceId: "northstar", name: "Northstar" }, country: "Germany", location: "Berlin, Germany", originalUrl: "https://boards.example/gh-1", discoveredAt: time, rawMetadata: {} }] }; },
  async health() { return { source: "greenhouse", status: "connected", checkedAt: time, message: "Connected" }; },
};

const queue = new MemoryCoverageQueueStore();
const runs = new MemoryCoverageRunStore();
const sink = new MemoryOpportunityIngestionSink();
const engine = new OpportunityCoverageEngine(sink, queue, undefined, clock, runs).register(provider, { priority: 1, enabled: true, maximumResults: 100 });
await engine.enqueue("greenhouse");
const concurrent = await Promise.all([engine.runNext(time), engine.runNext(time)]);
assert.equal(concurrent.filter(Boolean).length, 1, "Concurrency claim must allow only one worker to run a queued job");
assert.equal((await runs.list()).length, 1, "Provider attempt outcome must be recorded once");
assert.equal((await queue.list())[0].status, "completed");
await queue.remove((await queue.list())[0].id);
assert.equal((await queue.list())[0].status, "cancelled", "Cancellation must remain observable");

const root = resolve(import.meta.dirname, "../..");
const migration = await readFile(resolve(root, "supabase/migrations/202607170002_durable_opportunity_ingestion.sql"), "utf8");
const schedulerClaimMigration = await readFile(resolve(root, "supabase/migrations/202607170004_scheduler_service_role_claim.sql"), "utf8");
const employerMigration = await readFile(resolve(root, "supabase/migrations/202607170005_employer_intelligence_registry.sql"), "utf8");
const employerCompatibilityMigration = await readFile(resolve(root, "supabase/migrations/202607170006_remove_employer_digest_dependency.sql"), "utf8");
const employerCoverageMigration = await readFile(resolve(root, "supabase/migrations/202607170008_employer_intelligence_coverage.sql"), "utf8");
const greenhouseBackfillMigration = await readFile(resolve(root, "supabase/migrations/202607170009_backfill_greenhouse_employers.sql"), "utf8");
const greenhouseSourceBackfillMigration = await readFile(resolve(root, "supabase/migrations/202607170010_backfill_greenhouse_source_ids.sql"), "utf8");
const greenhouseConfidenceMigration = await readFile(resolve(root, "supabase/migrations/202607170011_greenhouse_employer_confidence.sql"), "utf8");
const store = await readFile(resolve(root, "frontend/lib/discovery/supabase-ingestion.ts"), "utf8");
for (const table of ["opportunity_provider_schedules", "opportunity_provider_jobs", "opportunity_provider_runs"]) assert.match(migration, new RegExp(`create table public\\.${table}`));
assert.match(migration, /for update skip locked/i, "Database claim must be concurrency-safe");
assert.match(migration, /lease_expires_at/, "Claims must expire safely after interrupted workers");
assert.match(migration, /is_active_workspace_member/, "Durable ingestion data must remain workspace isolated");
assert.match(schedulerClaimMigration, /auth\.role\(\) <> 'service_role'/, "The isolated scheduler service role must be able to claim queued provider work");
assert.match(schedulerClaimMigration, /to authenticated,service_role/, "Claim execution remains limited to authenticated users and the scheduler service role");
assert.match(store, /rpc\/claim_next_opportunity_provider_job/, "Runtime queue must use the atomic claim RPC");
assert.match(employerMigration, /create table public\.employer_source_observations/, "Employer evidence must remain independently observable");
assert.match(employerMigration, /unique\(workspace_id,provider_id,source_employer_id\)/, "Repeated provider observations must remain idempotent");
assert.match(employerMigration, /is_active_workspace_member/, "Employer intelligence must remain workspace isolated");
assert.match(employerMigration, /auth\.role\(\) <> 'service_role'/, "The isolated scheduler may update employer intelligence");
assert.match(store, /rpc\/upsert_employer_observation/, "Every durable opportunity must resolve a canonical employer");
assert.match(store, /company_id: companyId/, "Canonical opportunities must link to the canonical employer");
assert.match(store, /private rows: Row\[\] \| null = null/, "A provider run must cache its workspace inventory instead of reloading it for every opportunity");
assert.match(store, /const rows = await this\.loadRows\(\)/, "Opportunity upserts must reuse the run-scoped inventory cache");
assert.match(store, /limit=\$\{pageSize\}&offset=\$\{offset\}/, "Durable opportunity inventory must page beyond the PostgREST 1,000-row response limit");
assert.match(store, /if \(page\.length < pageSize\) break/, "Durable opportunity pagination must stop after the final page");
assert.match(store, /async listForBatch\(batch: ProviderCollectionBatch\)/, "Provider refreshes must support employer-scoped canonical inventory reads");
assert.match(store, /companies\?select=id/, "Batch-scoped reads must resolve canonical employers first");
assert.match(store, /company_id=in\./, "Batch-scoped reads must load only opportunities belonging to matching employers");
assert.match(store, /if \(!canonicalKeys\.length && !companyNames\.length\) return this\.list\(\)/, "Unscoped snapshots must retain the safe full-inventory fallback");
assert.match(employerCompatibilityMigration, /create or replace function public\.upsert_employer_observation/, "The compatibility migration must replace the original function");
assert.doesNotMatch(employerCompatibilityMigration, /\bdigest\s*\(/, "The active employer identity function must not depend on an extension schema");
assert.match(employerCoverageMigration, /orion-employer-intelligence-v1/, "Employer intelligence coverage must be explicitly versioned");
assert.match(employerCoverageMigration, /is_active_workspace_member/, "Employer coverage must remain workspace isolated");
assert.match(employerCoverageMigration, /registryCoverage/, "Operational registry coverage must remain distinct from optional enrichment");
assert.match(employerCoverageMigration, /extendedIntelligenceCoverage/, "Optional employer enrichment must be measured truthfully");
assert.match(greenhouseBackfillMigration, /backfill_greenhouse_employers/, "Existing Greenhouse observations require a controlled backfill path");
assert.match(greenhouseBackfillMigration, /is_active_workspace_member/, "Employer backfill must remain workspace isolated");
assert.match(greenhouseBackfillMigration, /on function public\.backfill_greenhouse_employers.*from public,anon/s, "Employer backfill must not be publicly executable");
assert.match(greenhouseBackfillMigration, /greenhouse-employer-backfill-v1/, "Employer backfill must be versioned and measurable");
assert.match(greenhouseSourceBackfillMigration, /greenhouse-employer-backfill-v2/, "Legacy source-identity backfill must be versioned and measurable");
assert.match(greenhouseSourceBackfillMigration, /originalId.*\^\[a-zA-Z0-9_-\]\+\-\[0-9\]\+\$/s, "Legacy fallback must accept only an explicit Greenhouse source identity");
assert.doesNotMatch(greenhouseSourceBackfillMigration, /similarity\s*\(/i, "Employer backfill must not use ambiguous fuzzy matching");
assert.match(greenhouseConfidenceMigration, /source_employer_id/, "Employer confidence requires explicit provider identity evidence");
assert.match(greenhouseConfidenceMigration, /source_url/, "Employer confidence requires explicit source provenance");
assert.match(greenhouseConfidenceMigration, /greatest\(c\.identity_confidence,90\)/, "Exact Greenhouse board provenance has deterministic resolution confidence");

console.log("Durable opportunity ingestion checks passed.");
