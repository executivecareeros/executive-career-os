import assert from "node:assert/strict";
import { AshbyOpportunityProvider, parseAshbyBoard } from "../lib/discovery/providers/ashby.ts";

assert.equal(parseAshbyBoard("https://jobs.ashbyhq.com/lightspeedhq/role"), "lightspeedhq");
assert.throws(() => parseAshbyBoard("http://jobs.ashbyhq.com/acme"), /Only public Ashby/);
assert.throws(() => parseAshbyBoard("https://example.com/acme"), /Only public Ashby/);

let calls = 0;
const fetcher = async () => { calls += 1; return new Response(JSON.stringify({ apiVersion: "1", jobs: [{ title: "Vice President, Sales", location: "London, UK", department: "Sales", team: "Revenue", isListed: true, isRemote: false, workplaceType: "Hybrid", descriptionPlain: "Lead revenue.", publishedAt: "2026-07-17T08:00:00Z", employmentType: "FullTime", address: { postalAddress: { addressCountry: "GB" } }, jobUrl: "https://jobs.ashbyhq.com/lightspeedhq/role-1", compensation: { summaryComponents: [{ compensationType: "Salary", currencyCode: "GBP", minValue: 200000, maxValue: 250000 }] } }] }), { status: 200 }); };
const provider = new AshbyOpportunityProvider("lightspeedhq", "Lightspeed Commerce", fetcher);
const request = { runId: "ashby-run", requestedAt: "2026-07-17T10:00:00Z", maximumResults: 500, filters: {} };
const first = await provider.collect(request);
const replay = await provider.collect({ ...request, runId: "ashby-replay" });
assert.equal(first.jobs.length, 1);
assert.equal(first.completeSnapshot, true);
assert.equal(first.jobs[0].sourceId, replay.jobs[0].sourceId);
assert.equal(first.jobs[0].company.name, "Lightspeed Commerce");
assert.equal(first.jobs[0].company.careersUrl, "https://jobs.ashbyhq.com/lightspeedhq");
assert.equal(first.jobs[0].rawMetadata.workArrangement, "Hybrid");
assert.equal(first.jobs[0].salaryCurrency, undefined);
assert.equal(first.jobs[0].salary?.currency, "GBP");
assert.equal(calls, 2);
console.log("Ashby connector checks passed.");
