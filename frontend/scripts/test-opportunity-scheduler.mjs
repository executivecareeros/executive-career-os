import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { schedulerRequestAuthorized } from "../lib/discovery/scheduler-auth.ts";

assert.equal(schedulerRequestAuthorized(null, "secret"), false);
assert.equal(schedulerRequestAuthorized("Bearer wrong", "secret"), false);
assert.equal(schedulerRequestAuthorized("Bearer secret", "secret"), true);
assert.equal(schedulerRequestAuthorized("Bearer secret", undefined), false);

const root = resolve(import.meta.dirname, "../..");
const route = await readFile(resolve(root, "frontend/app/api/operations/opportunity-refresh/route.ts"), "utf8");
const discoveryRoute = await readFile(resolve(root, "frontend/app/api/operations/source-discovery/route.ts"), "utf8");
const runtime = await readFile(resolve(root, "frontend/lib/discovery/scheduler-runtime.ts"), "utf8");
const publicDiscovery = await readFile(resolve(root, "frontend/lib/discovery/public-employer-discovery.ts"), "utf8");
const proxy = await readFile(resolve(root, "frontend/proxy.ts"), "utf8");
const migration = await readFile(resolve(root, "supabase/migrations/202607170003_provider_schedule_concurrency.sql"), "utf8");
const persistenceScopeMigration = await readFile(resolve(root, "supabase/migrations/202607200002_scope_opportunity_source_reconciliation.sql"), "utf8");
const vercel = JSON.parse(await readFile(resolve(root, "frontend/vercel.json"), "utf8"));
const networkStaging = JSON.parse(await readFile(resolve(root, "frontend/vercel.network-staging.json"), "utf8"));

assert.match(route, /schedulerRequestAuthorized/);
assert.match(route, /Unauthorized/);
assert.match(route, /maxDuration = 240/, "A full provider cohort must have enough runtime to finish before its queue lease expires");
assert.match(route, /Math\.max\(1, Math\.min\(18,/, "Bulk execution must retain a hard per-invocation safety ceiling");
assert.match(route, /OPPORTUNITY_SCHEDULER_MAX_JOBS \?\? 18/, "The Opportunity Factory must use the bounded eighteen-job production default");
assert.match(route, /runOpportunityScheduler\(client, undefined, maximumJobs\)/, "The bounded bulk limit must reach the scheduler runtime");
assert.match(route, /OPPORTUNITY_SCHEDULER_MAX_JOBS \?\? 18/, "The safe eighteen-job ceiling must be the default throughput");
assert.match(route, /shouldRefreshEmployerIntelligence\(startedAt\)/, "Derived employer intelligence must not block every ingestion cycle");
assert.doesNotMatch(route, /discoverPublicEmployerSources/, "Public-index latency must not consume the canonical ingestion execution window");
assert.match(route, /OPPORTUNITY_SCHEDULER_FAILURE/, "Scheduler failures must emit sanitized operational evidence instead of being silently suppressed");
assert.match(discoveryRoute, /schedulerRequestAuthorized/);
assert.match(discoveryRoute, /discoverPublicEmployerSources/, "The dedicated source cycle must continuously expand verified public employer coverage");
assert.match(discoveryRoute, /OPPORTUNITY_SOURCE_DISCOVERY_LIMIT/, "Employer expansion must remain bounded by configuration");
assert.match(discoveryRoute, /OPPORTUNITY_SOURCE_DISCOVERY_LIMIT \?\? 50/, "The dedicated cycle must use the bounded fifty-source default");
assert.match(discoveryRoute, /registerEmployerSourceBatch/, "Verified employer sources must enter the common Coverage Engine");
assert.match(discoveryRoute, /discoveryCursor/, "Every source cycle must advance public employer discovery");
assert.match(discoveryRoute, /timeBudgetMs:\s*150_000/, "Source discovery must retain a hard execution budget");
assert.match(discoveryRoute, /Math\.min\(50/, "Each source cycle must cap newly registered sources");
assert.match(discoveryRoute, /ZERO_TOKEN_SOURCE_DISCOVERY/, "Source discovery must expose aggregate operational evidence");
assert.match(publicDiscovery, /cursorWindow \* sampleTarget/, "Public discovery must rotate across the indexed employer universe instead of replaying its alphabetical prefix");
assert.match(publicDiscovery, /interleaveCandidates/, "Public discovery must distribute verification attempts across provider ecosystems");
assert.match(publicDiscovery, /selectDiverseSources/, "A successful discovery window must activate healthy sources across provider ecosystems before filling by volume");
assert.doesNotMatch(publicDiscovery, /Promise\.allSettled\(definitions/, "Common Crawl provider indexes must not be queried in a rate-limit-hostile parallel burst");
assert.match(publicDiscovery, /await pause\(150\)/, "Public index requests must be politely spaced");
assert.doesNotMatch(route + discoveryRoute, /OpenAI|anthropic|completion|embedding/i, "Source expansion must remain zero-token");
assert.match(runtime, /maximumJobs = 18/, "The scheduler runtime must share the eighteen-job safe default");
assert.match(proxy, /serverAuthenticatedPaths/);
assert.match(proxy, /\/api\/operations\/opportunity-refresh/);
assert.match(proxy, /\/api\/operations\/source-discovery/);
assert.match(proxy, /serverAuthenticatedPaths\.includes\(path\)/);
assert.doesNotMatch(route + runtime, /console\.(log|error)|SUPABASE_SCHEDULER_KEY\s*[:=]\s*["'][^"']+/);
assert.match(runtime, /claim_next_opportunity_provider_job/);
assert.match(runtime, /enabled=eq\.true/);
assert.match(runtime, /next_run_at=lte/, "The scheduler must request only bounded due schedules instead of loading the entire provider registry");
assert.match(runtime, /limit=\$\{maximumJobs\}/, "Due schedule reads must remain bounded as the employer registry grows");
assert.match(runtime, /status=in\.\(queued,running,retrying\)/, "Expired leased jobs must remain recoverable when their schedule is no longer due");
assert.match(runtime, /opportunity_provider_schedules\?select=\*&id=eq\./, "Claimed work must resolve its schedule without loading all registered providers");
assert.match(runtime, /lease_seconds: 300/);
assert.match(runtime, /"retrying"/);
assert.match(runtime, /"failed"/);
assert.match(migration, /unique index opportunity_provider_jobs_one_active_schedule_idx/i);
assert.match(persistenceScopeMigration, /opportunities_workspace_company_active_idx/i, "Canonical persistence must index its bounded employer scope");
assert.match(persistenceScopeMigration, /opportunity\.company_id in/i, "Source reconciliation must not scan every opportunity in the workspace for every provider batch");
assert.match(persistenceScopeMigration, /jsonb_array_elements\(items\)/i, "The persistence scope must derive only from the incoming provider batch");
assert.doesNotMatch(persistenceScopeMigration, /drop\s+(table|function)/i, "The throughput repair must preserve canonical inventory and ingestion contracts");
assert.deepEqual(vercel.crons, [
  { path: "/api/operations/opportunity-refresh", schedule: "*/3 * * * *" },
  { path: "/api/operations/source-discovery", schedule: "7,37 * * * *" },
]);
assert.deepEqual(networkStaging.crons, [
  { path: "/api/operations/opportunity-refresh", schedule: "* * * * *" },
  { path: "/api/operations/source-discovery", schedule: "*/5 * * * *" },
]);

console.log("Opportunity scheduler security and durability checks passed.");
