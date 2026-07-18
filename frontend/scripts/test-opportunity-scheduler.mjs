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
const runtime = await readFile(resolve(root, "frontend/lib/discovery/scheduler-runtime.ts"), "utf8");
const proxy = await readFile(resolve(root, "frontend/proxy.ts"), "utf8");
const migration = await readFile(resolve(root, "supabase/migrations/202607170003_provider_schedule_concurrency.sql"), "utf8");
const vercel = JSON.parse(await readFile(resolve(root, "frontend/vercel.json"), "utf8"));
const networkStaging = JSON.parse(await readFile(resolve(root, "frontend/vercel.network-staging.json"), "utf8"));

assert.match(route, /schedulerRequestAuthorized/);
assert.match(route, /Unauthorized/);
assert.match(route, /maxDuration = 240/, "A full provider cohort must have enough runtime to finish before its queue lease expires");
assert.match(route, /Math\.max\(1, Math\.min\(12,/, "Bulk execution must retain a hard per-invocation safety ceiling");
assert.match(route, /OPPORTUNITY_SCHEDULER_MAX_JOBS \?\? 6/, "The Opportunity Factory must process six provider jobs by default");
assert.match(route, /runOpportunityScheduler\(client, undefined, maximumJobs\)/, "The bounded bulk limit must reach the scheduler runtime");
assert.match(route, /discoverPublicEmployerSources/, "The scheduler must continuously expand verified public employer coverage");
assert.match(route, /OPPORTUNITY_SOURCE_EXPANSION_LIMIT/, "Employer expansion must remain bounded by configuration");
assert.match(route, /registerEmployerSourceBatch/, "Verified employer sources must enter the common Coverage Engine");
assert.match(route, /sourceExpansion/, "Employer expansion must expose aggregate operational evidence");
assert.doesNotMatch(route, /OpenAI|anthropic|completion|embedding/i, "Source expansion must remain zero-token");
assert.match(runtime, /maximumJobs = 6/, "The scheduler runtime must share the six-job safe default");
assert.match(proxy, /serverAuthenticatedPaths/);
assert.match(proxy, /\/api\/operations\/opportunity-refresh/);
assert.match(proxy, /serverAuthenticatedPaths\.includes\(path\)/);
assert.doesNotMatch(route + runtime, /console\.(log|error)|SUPABASE_SCHEDULER_KEY\s*[:=]\s*["'][^"']+/);
assert.match(runtime, /claim_next_opportunity_provider_job/);
assert.match(runtime, /enabled=eq\.true/);
assert.doesNotMatch(runtime, /next_run_at=lte/, "Expired leased jobs must be recoverable even when their schedule is no longer due");
assert.match(runtime, /dueSchedules = schedules\.filter/, "Due schedules must be selected independently from recoverable queued work");
assert.match(runtime, /lease_seconds: 300/);
assert.match(runtime, /"retrying"/);
assert.match(runtime, /"failed"/);
assert.match(migration, /unique index opportunity_provider_jobs_one_active_schedule_idx/i);
assert.equal(vercel.crons[0].path, "/api/operations/opportunity-refresh");
assert.equal(vercel.crons[0].schedule, "*/15 * * * *");
assert.equal(networkStaging.crons[0].path, "/api/operations/opportunity-refresh");
assert.equal(networkStaging.crons[0].schedule, "* * * * *");

console.log("Opportunity scheduler security and durability checks passed.");
