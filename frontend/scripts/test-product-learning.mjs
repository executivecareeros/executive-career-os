import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");
const migration = readFileSync(join(root, "supabase/migrations/202607180010_founder_product_learning.sql"), "utf8");
const liveAnalyticsMigration = readFileSync(join(root, "supabase/migrations/202607200001_founder_live_executive_analytics.sql"), "utf8");
const route = readFileSync(join(root, "frontend/app/api/product-learning/route.ts"), "utf8");
const dashboard = readFileSync(join(root, "frontend/app/company-control/product-learning/page.tsx"), "utf8");
const controlCenter = readFileSync(join(root, "frontend/components/company-control/company-control-center.tsx"), "utf8");

assert.match(migration, /alter table public\.product_learning_events enable row level security/);
assert.match(migration, /revoke all on public\.product_learning_events from public,anon,authenticated/);
assert.match(migration, /founder_bootstrap_audit_events where auth_user_id=auth\.uid\(\)/);
assert.match(migration, /raw executive activity is never returned/i);
const eventTable = migration.match(/create table public\.product_learning_events\([\s\S]*?\n\);/)?.[0] ?? "";
assert.doesNotMatch(eventTable, /\bip_address\b|\bemail\b|\bgender\b|\bage\b|raw_user_agent/i);
assert.match(route, /currentSession\(\)/);
assert.match(route, /user-agent/);
assert.doesNotMatch(route, /x-forwarded-for|cf-connecting-ip|request\.url/);
assert.match(dashboard, /resolveFounderAccess\(\)/);
assert.match(dashboard, /does not collect age, gender, exact location, IP addresses/i);
assert.match(liveAnalyticsMigration, /registeredExecutives/);
assert.match(liveAnalyticsMigration, /activeNow/);
assert.match(liveAnalyticsMigration, /interval '15 minutes'/);
assert.match(liveAnalyticsMigration, /currentTitles/);
assert.doesNotMatch(liveAnalyticsMigration, /email|ip_address|gender|date_of_birth/i);
assert.match(controlCenter, /Current professional titles/);
assert.match(controlCenter, /text-\[#182234\]/, "Live values must remain visible on the light Company Control surface");

console.log("Founder product-learning privacy, access, and aggregation checks passed.");
