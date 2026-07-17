import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { OpportunityIngestionPipeline } from "../lib/discovery/pipeline.ts";
import { OpportunityProviderRegistry } from "../lib/discovery/registry.ts";

const observedAt = "2026-07-18T00:00:00.000Z";
const filters = { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] };
const jobs = Array.from({ length: 125 }, (_, index) => ({ sourceId: `job-${index}`, source: "greenhouse", title: `Vice President Sales ${index}`, company: { sourceId: "verified-board", canonicalKey: "greenhouse:verified-board", name: "Verified Employer" }, location: "Berlin", country: "Germany", originalUrl: `https://example.test/jobs/${index}`, discoveredAt: observedAt, rawMetadata: {} }));
const provider = {
  id: "greenhouse",
  source: { id: "greenhouse", name: "Greenhouse", category: "Corporate Website", description: "Official employer board", capabilities: ["jobs", "companies"] },
  reliability: { type: "Corporate Website", rating: "high", score: 90, rationale: "Official employer evidence", assessedAt: observedAt },
  async health() { return { source: "greenhouse", status: "connected", checkedAt: observedAt, message: "Connected" }; },
  async collect() { return { providerId: "greenhouse", collectedAt: observedAt, completeSnapshot: true, snapshotScopeKeys: ["greenhouse:verified-board"], jobs }; },
};
let singleWrites = 0;
let batches = 0;
let received = 0;
const sink = {
  async listForBatch() { return []; },
  async list() { throw new Error("Global inventory must not be read"); },
  async upsert() { singleWrites += 1; },
  async upsertBatch(opportunities, context) { batches += 1; received += opportunities.length; assert.equal(context.runId, "batch-run"); return [{ batchId: `${context.runId}:1`, records: opportunities.length, inserted: opportunities.length, updated: 0, databaseCalls: 1, durationMs: 1, retrySafe: true }]; },
};
const outcome = await new OpportunityIngestionPipeline(new OpportunityProviderRegistry().register(provider), sink).ingest("greenhouse", { runId: "batch-run", requestedAt: observedAt, maximumResults: 250, filters });
assert.equal(outcome.run.status, "completed");
assert.equal(singleWrites, 0, "Batch-capable sinks must never fall back to one write per opportunity");
assert.equal(batches, 1);
assert.equal(received, 125);
assert.equal(outcome.persistence?.[0].databaseCalls, 1);

const root = resolve(import.meta.dirname, "../..");
const migration = await readFile(resolve(root, "supabase/migrations/202607180001_transaction_safe_opportunity_batches.sql"), "utf8");
const countries = await readFile(resolve(root, "supabase/migrations/202607180002_world_country_registry.sql"), "utf8");
const intelligence = await readFile(resolve(root, "supabase/migrations/202607180003_global_coverage_intelligence.sql"), "utf8");
assert.match(migration, /^begin;/);
assert.match(migration, /record_count between 1 and 250/, "Database batch size must be bounded");
assert.match(migration, /unique\(workspace_id,batch_id\)/, "Retry identity must be durable and workspace scoped");
assert.match(migration, /if found then return result_payload/, "Completed batches must replay without duplicate writes");
assert.match(migration, /on conflict\(workspace_id,domain_id\)/, "Canonical opportunity writes must remain idempotent");
assert.match(migration, /incoming_sources/, "Source reassignment protection must remain part of the transaction");
assert.match(migration, /distinct on\(lower\(trim\(candidate->'company'->>'canonicalKey'\)\)\)/, "Repeated opportunities from one employer must resolve that employer once per statement");
assert.match(migration, /distinct on\(candidate->'company'->>'providerId',candidate->'company'->>'sourceEmployerId'\)/, "Repeated employer observations must be consolidated before set-based upsert");
assert.match(migration, /auth\.role\(\) <> 'service_role'.*is_active_workspace_member/s, "Batch writes must remain workspace isolated");
assert.match(migration, /commit;\s*$/);
assert.equal((countries.match(/^  \('[A-Z]{2}',/gm) ?? []).length, 249, "Every ISO 3166-1 country and territory must have a canonical representation");
assert.match(countries, /Null intelligence fields mean unavailable, never inferred/);
assert.match(intelligence, /countryStandard','ISO 3166-1 alpha-2'/);
assert.match(intelligence, /normalized_industry/);
assert.match(intelligence, /opportunity_persistence_batches/);
assert.match(intelligence, /provider_runs/);

console.log("Transaction-safe batch persistence and global coverage intelligence checks passed.");
