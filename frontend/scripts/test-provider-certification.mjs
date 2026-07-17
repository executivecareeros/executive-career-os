import assert from "node:assert/strict";
import { runProviderCertification } from "../lib/discovery/provider-certification.ts";
import { createProviderScaffold } from "../lib/discovery/provider-scaffold.ts";
import { GreenhouseOpportunityProvider } from "../lib/discovery/providers/greenhouse.ts";
import { LeverOpportunityProvider } from "../lib/discovery/providers/lever.ts";
import { AshbyOpportunityProvider } from "../lib/discovery/providers/ashby.ts";
import { WorkableOpportunityProvider } from "../lib/discovery/providers/workable.ts";
import { greenhouseProviderManifest, leverProviderManifest, ashbyProviderManifest, workableProviderManifest } from "../lib/discovery/providers/manifests.ts";

const greenhouseFetch = async (input) => String(input).endsWith("/v1/boards/certified")
  ? new Response(JSON.stringify({ name: "Certified Greenhouse Employer" }))
  : new Response(JSON.stringify({ jobs: [{ id: 1, title: "Vice President, Revenue", updated_at: "2026-07-17T08:00:00Z", absolute_url: "https://job-boards.greenhouse.io/certified/jobs/1", location: { name: "London, United Kingdom" }, content: "Lead revenue." }], meta: { total: 1 } }));

const leverPosting = (index) => ({ id: `role-${index}`, text: `Vice President ${index}`, categories: { location: "London, United Kingdom", commitment: "Full-time" }, country: "GB", descriptionPlain: "Lead growth.", hostedUrl: `https://jobs.lever.co/certified/role-${index}`, workplaceType: "hybrid" });
const leverFetch = async (input) => {
  const url = new URL(String(input));
  const skip = Number(url.searchParams.get("skip"));
  const limit = Number(url.searchParams.get("limit"));
  const count = Math.max(0, Math.min(limit, 101 - skip));
  return new Response(JSON.stringify(Array.from({ length: count }, (_, offset) => leverPosting(skip + offset))));
};

const ashbyFetch = async () => new Response(JSON.stringify({ apiVersion: "1", jobs: [{ title: "Vice President, Commercial", location: "Berlin, Germany", isListed: true, workplaceType: "Hybrid", descriptionPlain: "Lead commercial growth.", publishedAt: "2026-07-17T08:00:00Z", employmentType: "FullTime", address: { postalAddress: { addressCountry: "DE" } }, jobUrl: "https://jobs.ashbyhq.com/certified/role-1" }] }));
const workableFetch = async () => new Response(JSON.stringify({ name: "Certified Workable Employer", jobs: [{ title: "Chief Revenue Officer", shortcode: "CRO-1", country: "United Kingdom", city: "London", department: "Executive", telecommuting: true, published_on: "2026-07-17", full_description: "<p>Lead global revenue.</p>", url: "https://apply.workable.com/certified/j/CRO-1", employment_type: "Full-time", salary: { salary_from: 200000, salary_to: 260000, salary_currency: "GBP" } }] }));

const reports = [];
reports.push(await runProviderCertification(new GreenhouseOpportunityProvider("certified", greenhouseFetch), greenhouseProviderManifest, 500));
reports.push(await runProviderCertification(new LeverOpportunityProvider("certified", "global", "Certified Lever Employer", leverFetch), leverProviderManifest, 500));
reports.push(await runProviderCertification(new AshbyOpportunityProvider("certified", "Certified Ashby Employer", ashbyFetch), ashbyProviderManifest, 500));
reports.push(await runProviderCertification(new WorkableOpportunityProvider("certified", workableFetch), workableProviderManifest, 500));

assert.deepEqual(reports.map((report) => report.providerId), ["greenhouse", "lever", "ashby", "workable"]);
assert.equal(reports.every((report) => report.checks.replay === "passed" && report.checks.canonicalization === "passed" && report.checks.scheduler === "passed" && report.checks.metrics === "passed"), true);
assert.equal(reports.find((report) => report.providerId === "lever")?.checks.pagination, "passed");
assert.equal(reports.find((report) => report.providerId === "ashby")?.checks.lifecycle, "passed");
assert.equal(reports.find((report) => report.providerId === "workable")?.checks.lifecycle, "passed");

const scaffold = createProviderScaffold({
  manifest: ashbyProviderManifest,
  endpoint: () => "https://api.ashbyhq.com/scaffold",
  notFoundMessage: "Scaffold not found.",
  records: (payload) => payload.jobs,
  map: (record, context) => ({ sourceId: record.id, source: "ashby", title: record.title, company: { sourceId: "scaffold", canonicalKey: "ashby:scaffold", name: "Scaffold Employer" }, discoveredAt: context.collectedAt, rawMetadata: {} }),
  revision: (_payload, records) => `scaffold:${records.length}`,
  scopeKey: () => "ashby:scaffold",
}, "scaffold", async () => new Response(JSON.stringify({ jobs: [{ id: "one", title: "Chief Revenue Officer" }] })));
assert.equal((await scaffold.collect({ runId: "scaffold", requestedAt: "2026-07-17T12:00:00Z", maximumResults: 10, filters: {} })).jobs.length, 1);

console.log(JSON.stringify({ message: "Provider certification framework checks passed.", reports }, null, 2));
