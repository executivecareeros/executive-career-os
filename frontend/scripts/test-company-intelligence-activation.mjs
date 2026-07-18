import assert from "node:assert/strict";
import { activateCompanyIntelligence, parseCompanyIntelligenceActivationDomains } from "../lib/company-intelligence/activation.ts";

const requests = [];
let persistenceCalls = 0;
const client = {
  async health() { return true; },
  async request(path, init) {
    requests.push({ path, init });
    if (path.startsWith("companies?")) return { status: 200, data: [
      { id: "company-1", official_domain: "one.example", identity_confidence: 95 },
      { id: "company-2", official_domain: "empty.example", identity_confidence: 90 },
      { id: "company-3", official_domain: "failed.example", identity_confidence: 85 },
    ] };
    if (path === "rpc/persist_company_intelligence_observation") {
      persistenceCalls += 1;
      return { status: 200, data: { changed: persistenceCalls === 1, observationCreated: persistenceCalls === 1 } };
    }
    throw new Error(`Unexpected request: ${path}`);
  },
};
const retriever = async ({ officialDomain, observedAt }) => {
  if (officialDomain === "failed.example") throw Object.assign(new Error("failed"), { code: "OFFICIAL_COMPANY_UNAVAILABLE" });
  const facts = officialDomain === "empty.example" ? [] : [{ field: "overview", value: "Verified overview", sourceUrl: `https://${officialDomain}/`, sourceType: "Schema.org", observedAt, confidence: 95 }];
  return { canonicalName: "Company", facts, sourceUrl: `https://${officialDomain}/`, fingerprint: `official-company-facts-v1:${officialDomain}`, status: 200, contentType: "text/html", bytes: 100, durationMs: 2 };
};

assert.deepEqual(parseCompanyIntelligenceActivationDomains(" ONE.example,invalid,one.example., two.example "), ["one.example", "two.example"]);
const summary = await activateCompanyIntelligence(client, "workspace-1", { maximumCompanies: 100, approvedDomains: ["one.example", "empty.example", "failed.example"], retriever });
assert.match(requests[0].path, /identity_confidence=gte\.80/);
assert.match(requests[0].path, /official_domain=in\.\(one\.example,empty\.example,failed\.example\)/);
assert.match(requests[0].path, /limit=3/);
assert.equal(summary.approved, 3);
assert.equal(summary.eligible, 3);
assert.equal(summary.attempted, 3);
assert.equal(summary.retrieved, 2);
assert.equal(summary.useful, 1);
assert.equal(summary.persisted, 1);
assert.equal(summary.unchanged, 1);
assert.equal(summary.failed, 1);
assert.equal(summary.failures.OFFICIAL_COMPANY_UNAVAILABLE, 1);
assert.equal(summary.aiTokens, 0);
assert.equal(persistenceCalls, 1);
const body = JSON.parse(requests.find((item) => item.path.startsWith("rpc/"))?.init.body);
assert.equal(body.target_workspace, "workspace-1");
assert.equal(body.target_company, "company-1");
assert.equal(body.facts.length, 1);

const disabled = await activateCompanyIntelligence(client, "workspace-1", { maximumCompanies: 25, approvedDomains: [], retriever });
assert.equal(disabled.attempted, 0);
console.log("Company intelligence activation checks passed.");
