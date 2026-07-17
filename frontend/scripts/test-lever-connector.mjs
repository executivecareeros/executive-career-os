import assert from "node:assert/strict";
import { LeverOpportunityProvider, parseLeverBoard } from "../lib/discovery/providers/lever.ts";

assert.deepEqual(parseLeverBoard("https://jobs.lever.co/palantir"), { site: "palantir", region: "global" });
assert.deepEqual(parseLeverBoard("https://jobs.eu.lever.co/example/jobs/123"), { site: "example", region: "eu" });
assert.throws(() => parseLeverBoard("http://jobs.lever.co/example"), /Only public Lever/);

const posting = (index) => ({
  id: `posting-${index}`,
  text: index === 0 ? "Vice President, Sales" : `Role ${index}`,
  categories: { location: "London, United Kingdom", commitment: "Full-time", department: "Commercial" },
  country: "GB",
  descriptionPlain: "Lead international growth.",
  hostedUrl: `https://jobs.lever.co/palantir/posting-${index}`,
  workplaceType: "hybrid",
});
const calls = [];
const fetcher = async (input) => {
  const url = new URL(String(input));
  calls.push({ skip: Number(url.searchParams.get("skip")), limit: Number(url.searchParams.get("limit")) });
  const skip = Number(url.searchParams.get("skip"));
  const limit = Number(url.searchParams.get("limit"));
  const available = 101;
  return new Response(JSON.stringify(Array.from({ length: Math.max(0, Math.min(limit, available - skip)) }, (_, offset) => posting(skip + offset))), { status: 200 });
};

const provider = new LeverOpportunityProvider("palantir", "global", "Palantir Technologies", fetcher);
const result = await provider.collect({ runId: "lever-run", requestedAt: "2026-07-17T13:00:00Z", maximumResults: 200, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } });
assert.equal(result.jobs.length, 101);
assert.deepEqual(calls, [{ skip: 0, limit: 100 }, { skip: 100, limit: 100 }], "Lever must page using the documented skip/limit contract");
assert.equal(result.completeSnapshot, true);
assert.equal(result.jobs[0].company.name, "Palantir Technologies");
assert.equal(result.jobs[0].company.canonicalKey, "lever:global:palantir");
assert.equal(result.jobs[0].company.careersUrl, "https://jobs.lever.co/palantir");
assert.equal(result.jobs[0].sourceId, "palantir-posting-0");
assert.equal(result.jobs[0].rawMetadata.workArrangement, "Hybrid");
assert.equal((await provider.health()).status, "connected");

console.log("Lever production connector checks passed.");
