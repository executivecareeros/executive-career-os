import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const directory = readFileSync(new URL("../app/companies/page.tsx", import.meta.url), "utf8");
const detail = readFileSync(new URL("../app/companies/[id]/page.tsx", import.meta.url), "utf8");

assert.doesNotMatch(directory, /opportunities\?select=/, "Company directory must use cached canonical aggregates, not read the opportunity universe.");
assert.match(directory, /activeOpportunities/);
assert.match(directory, /loadNetworkCoverageMetrics/);
assert.match(directory, /hiringEmployers=\{networkMetrics\?\.employers\}/);
assert.match(detail, /loadNetworkCompanyByName\(companyName\)/);
assert.match(detail, /loadNetworkOpportunitiesForCompany\(company\.id\)/);
assert.doesNotMatch(detail, /\.find\(\(row\) => row\.name/);
assert.doesNotMatch(detail, /\.filter\(\(row\) => row\.company_id/);
console.log("Company query boundary checks passed.");
