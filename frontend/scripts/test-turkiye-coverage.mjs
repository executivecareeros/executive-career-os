import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../../supabase/migrations/202607180012_turkiye_opportunity_cohort.sql", import.meta.url), "utf8");
const companies = await readFile(new URL("../components/companies/live-companies.tsx", import.meta.url), "utf8");

assert.match(migration, /canonical_name='Türkiye'/);
for (const alias of ["Turkey", "Turkiye", "Türkiye"]) assert.match(migration, new RegExp(alias));
for (const employer of ["Xometry Türkiye", "Constructor TECH", "OLIVER Agency", "Lostar", "Digiterra", "VusionGroup", "CRENNO", "Blockville"]) assert.match(migration, new RegExp(employer));
assert.match(migration, /on conflict\(workspace_id,provider_id,source_key\) do update/);
assert.match(companies, /türkiye\|turkiye\|turkey/);

console.log("Türkiye coverage cohort and geography aliases verified.");
