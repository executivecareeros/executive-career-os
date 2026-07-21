import assert from "node:assert/strict";
import { AshbyOpportunityProvider, parseAshbyBoard } from "../lib/discovery/providers/ashby.ts";
import { LeverOpportunityProvider, parseLeverBoard } from "../lib/discovery/providers/lever.ts";
import { providerFromCareersUrl } from "../lib/discovery/providers/factory.ts";
import { OpportunityProviderCatalog } from "../lib/discovery/providers/catalog.ts";
import { productionProviderAdapters } from "../lib/discovery/providers/production-catalog.ts";
import { JobicyOpportunityProvider } from "../lib/discovery/providers/jobicy.ts";
import { ArbeitnowOpportunityProvider } from "../lib/discovery/providers/arbeitnow.ts";
import { OpportunityCoverageEngine } from "../lib/discovery/coverage-engine.ts";
import { MemoryOpportunityIngestionSink } from "../lib/discovery/pipeline.ts";

assert.deepEqual(parseLeverBoard("https://jobs.eu.lever.co/Acme/jobs/123"), { site: "Acme", region: "eu" });
assert.equal(parseAshbyBoard("https://jobs.ashbyhq.com/Acme/job-id"), "Acme");
assert.equal(providerFromCareersUrl("https://boards.greenhouse.io/acme").id, "greenhouse");
assert.equal(providerFromCareersUrl("https://jobs.lever.co/acme").id, "lever");
assert.equal(providerFromCareersUrl("https://jobs.ashbyhq.com/acme").id, "ashby");
assert.equal(providerFromCareersUrl("https://jobicy.com/api/v2/remote-jobs").id, "jobicy");
assert.equal(providerFromCareersUrl("https://www.arbeitnow.com/api/job-board-api").id, "arbeitnow");
assert.equal(providerFromCareersUrl("https://example.com/jobs").id, "corporate-career-site");
assert.equal(productionProviderAdapters.every((adapter) => adapter.evaluation.reviewStatus === "approved" && adapter.evaluation.legalCompliance === "high"), true);

const jobicyFetch = async () => new Response(JSON.stringify({ apiVersion: "2.2", lastUpdate: "2026-07-21T09:00:00Z", jobs: [{ id: 17, url: "https://jobicy.com/jobs/17-cro", jobTitle: "Chief Revenue Officer", companyName: "RemoteCo", jobIndustry: ["Business"], jobType: ["Full-Time"], jobGeo: "Europe", jobLevel: "Executive", jobDescription: "<p>Lead global revenue.</p>", pubDate: "2026-07-21T08:00:00Z", salaryMin: 180000, salaryMax: 230000, salaryCurrency: "EUR" }] }), { status: 200 });
const jobicyBatch = await new JobicyOpportunityProvider(jobicyFetch).collect({ runId: "jobicy-test", requestedAt: "2026-07-21T10:00:00Z", maximumResults: 100, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } });
assert.equal(jobicyBatch.jobs[0].company.name, "RemoteCo");
assert.equal(jobicyBatch.jobs[0].rawMetadata.attribution, "Jobicy");
assert.equal(jobicyBatch.jobs[0].salary?.currency, "EUR");

const arbeitnowFetch = async () => new Response(JSON.stringify({ data: [{ slug: "cro-1", company_name: "EuropeCo", title: "Chief Revenue Officer", description: "<p>Lead European growth.</p>", remote: true, url: "https://www.arbeitnow.com/jobs/companies/europeco/cro-1", tags: ["Sales"], job_types: ["Full-time"], location: "Berlin", created_at: 1784620800 }], links: { next: null }, meta: { current_page: 1 } }), { status: 200 });
const arbeitnowBatch = await new ArbeitnowOpportunityProvider(arbeitnowFetch).collect({ runId: "arbeitnow-test", requestedAt: "2026-07-21T10:00:00Z", maximumResults: 500, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } });
assert.equal(arbeitnowBatch.jobs[0].company.name, "EuropeCo");
assert.equal(arbeitnowBatch.jobs[0].rawMetadata.attribution, "Arbeitnow");
assert.equal(arbeitnowBatch.jobs[0].rawMetadata.workArrangement, "Remote");

const customProvider = { id: "future-approved-provider", source: { id: "future-approved-provider", name: "Future provider", category: "Verified Feed", description: "Test adapter", capabilities: ["jobs"] }, reliability: { type: "Verified Feed", rating: "high", score: 80, rationale: "Test", assessedAt: "2026-07-14T00:00:00Z" }, async collect() { return { providerId: "future-approved-provider", collectedAt: "2026-07-14T00:00:00Z", jobs: [] }; }, async health() { return { source: "future-approved-provider", status: "available", checkedAt: "2026-07-14T00:00:00Z", message: "Ready" }; } };
const approvedEvaluation = { executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high", accessModel: "public-feed", reviewStatus: "approved", founderGateReasons: [], reviewedAt: "2026-07-14T00:00:00Z" };
const extensibleCatalog = new OpportunityProviderCatalog().register({ id: "future-approved-provider", name: "Future provider", supports: (url) => url.hostname === "careers.future.example", create: () => customProvider, evaluation: approvedEvaluation });
assert.equal(providerFromCareersUrl("https://careers.future.example/jobs", extensibleCatalog).id, "future-approved-provider", "A future provider must plug in without changing the engine or domain model");
assert.throws(() => new OpportunityProviderCatalog().register({ id: "gated-provider", name: "Gated provider", supports: () => true, create: () => customProvider, evaluation: { ...approvedEvaluation, founderGateReasons: ["paid-licensing"] } }), /requires founder approval/, "Reserved decisions must stop autonomous provider approval");

const leverFetch = async () => new Response(JSON.stringify([{ id: "lever-1", text: "Chief Revenue Officer", categories: { location: "London", commitment: "Full-time", department: "Sales" }, country: "GB", descriptionPlain: "Lead global revenue.", hostedUrl: "https://jobs.lever.co/acme/lever-1", workplaceType: "hybrid", salaryRange: { currency: "GBP", min: 200000, max: 250000 } }]), { status: 200 });
const ashbyFetch = async () => new Response(JSON.stringify({ apiVersion: "1", jobs: [{ title: "Chief Revenue Officer", location: "London", department: "Sales", isListed: true, workplaceType: "Hybrid", descriptionPlain: "Lead global revenue.", publishedAt: "2026-07-14T08:00:00Z", employmentType: "FullTime", address: { postalAddress: { addressCountry: "GB" } }, jobUrl: "https://jobs.ashbyhq.com/acme/ashby-1", compensation: { summaryComponents: [{ compensationType: "Salary", currencyCode: "GBP", minValue: 200000, maxValue: 250000 }] } }] }), { status: 200 });
const lever = new LeverOpportunityProvider("acme", "global", leverFetch);
const ashby = new AshbyOpportunityProvider("acme", ashbyFetch);
const sink = new MemoryOpportunityIngestionSink();
const engine = new OpportunityCoverageEngine(sink).register(lever, { priority: 1, enabled: true, maximumResults: 20 }).register(ashby, { priority: 2, enabled: true, maximumResults: 20 });
await engine.enqueue("lever", undefined, "2026-07-14T10:00:00Z");
await engine.enqueue("ashby", undefined, "2026-07-14T10:00:00Z");
await engine.runNext("2026-07-14T10:00:00Z");
await engine.runNext("2026-07-14T10:00:00Z");
const records = await sink.list();
assert.equal(records.length, 1, "Equivalent postings from Lever and Ashby must reconcile to one opportunity");
assert.equal(records[0].sources.length, 2);
assert.equal(records[0].salaryCurrency, "GBP");
assert.equal(records[0].workArrangement, "Hybrid");
assert.equal((await engine.snapshot()).metrics.duplicateObservations, 0);
console.log("Opportunity Provider Pack Alpha checks passed.");
