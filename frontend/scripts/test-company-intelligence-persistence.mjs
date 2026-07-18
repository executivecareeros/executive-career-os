import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(new URL("../../supabase/migrations/202607180006_company_intelligence_observations.sql", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/operations/opportunity-refresh/route.ts", import.meta.url), "utf8");

assert.match(migration, /company_intelligence_observations/);
assert.match(migration, /unique\(workspace_id,company_id,fingerprint\)/);
assert.match(migration, /reject_append_only_mutation/);
assert.match(migration, /is_active_workspace_member/);
assert.match(migration, /current_user <> 'service_role'/);
assert.match(migration, /jsonb_array_length\(facts\) between 1 and 50/);
assert.match(migration, /coalesce\(fact->>'sourceUrl',''\) <> source_url/);
assert.match(migration, /on conflict\(workspace_id,company_id,fingerprint\) do nothing/);
assert.match(migration, /payload#>>'\{companyIntelligence,fingerprint\}'/);
assert.match(migration, /grant execute .* to service_role/);
assert.doesNotMatch(migration, /grant execute .* to authenticated/);
assert.match(route, /COMPANY_INTELLIGENCE_ACTIVATION_LIMIT/);
assert.match(route, /Math\.min\(25/);
assert.match(route, /activateCompanyIntelligence/);
console.log("Company intelligence persistence contract checks passed.");
