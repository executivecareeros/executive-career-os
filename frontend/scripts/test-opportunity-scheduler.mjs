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

assert.match(route, /schedulerRequestAuthorized/);
assert.match(route, /Unauthorized/);
assert.match(proxy, /serverAuthenticatedPaths/);
assert.match(proxy, /\/api\/operations\/opportunity-refresh/);
assert.match(proxy, /serverAuthenticatedPaths\.includes\(path\)/);
assert.doesNotMatch(route + runtime, /console\.(log|error)|SUPABASE_SCHEDULER_KEY\s*[:=]\s*["'][^"']+/);
assert.match(runtime, /claim_next_opportunity_provider_job/);
assert.match(runtime, /enabled=eq\.true/);
assert.match(runtime, /lease_seconds: 300/);
assert.match(runtime, /"retrying"/);
assert.match(runtime, /"failed"/);
assert.match(migration, /unique index opportunity_provider_jobs_one_active_schedule_idx/i);
assert.equal(vercel.crons[0].path, "/api/operations/opportunity-refresh");
assert.equal(vercel.crons[0].schedule, "*/15 * * * *");

console.log("Opportunity scheduler security and durability checks passed.");
