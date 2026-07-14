import assert from "node:assert/strict";
import { GreenhouseOpportunityProvider, parseGreenhouseBoardToken } from "../lib/discovery/providers/greenhouse.ts";

assert.equal(parseGreenhouseBoardToken("https://job-boards.greenhouse.io/example/jobs/123"), "example");
assert.equal(parseGreenhouseBoardToken("example-board"), "example-board");
assert.throws(() => parseGreenhouseBoardToken("https://example.com/jobs"), /Only public Greenhouse/);

const fetcher = async (url) => {
  if (String(url).endsWith("/v1/boards/example")) return new Response(JSON.stringify({ name: "Example Company" }), { status: 200 });
  return new Response(JSON.stringify({ jobs: [{ id: 42, title: "Vice President, Sales", updated_at: "2026-07-14T08:00:00Z", absolute_url: "https://job-boards.greenhouse.io/example/jobs/42", location: { name: "Europe (Remote)" }, content: "<p>Lead global growth &amp; partnerships.</p>", departments: [{ name: "Commercial" }] }], meta: { total: 1 } }), { status: 200 });
};
const provider = new GreenhouseOpportunityProvider("example", fetcher);
const result = await provider.collect({ runId: "run-1", requestedAt: "2026-07-14T09:00:00Z", maximumResults: 10, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } });
assert.equal(result.jobs.length, 1);
assert.equal(result.jobs[0].company.name, "Example Company");
assert.equal(result.jobs[0].rawMetadata.workArrangement, "Remote");
assert.equal(result.jobs[0].description, "Lead global growth & partnerships.");
assert.equal(result.jobs[0].originalUrl, "https://job-boards.greenhouse.io/example/jobs/42");
console.log("Greenhouse production connector checks passed.");
