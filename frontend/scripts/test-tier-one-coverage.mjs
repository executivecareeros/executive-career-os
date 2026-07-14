import assert from "node:assert/strict";
import { CompanyCareerSiteOpportunityProvider, isSafePublicCareerUrl, parseCompanyCareerUrl, parseJobPostingJsonLd } from "../lib/discovery/providers/company-career-site.ts";
import { providerFromCareersUrl } from "../lib/discovery/providers/factory.ts";
import { productionProviderAdapters } from "../lib/discovery/providers/production-catalog.ts";
import { tierOneProviderPriorities } from "../lib/discovery/provider-priorities.ts";

const request = { runId: "tier-one-test", requestedAt: "2026-07-14T12:00:00Z", maximumResults: 10, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } };
const markup = `<!doctype html><html><head><script type="application/ld+json">{
  "@context":"https://schema.org","@type":"JobPosting","identifier":{"@type":"PropertyValue","value":"ACME-CRO-1"},
  "title":"Chief Revenue Officer","description":"<p>Lead global revenue.</p>","datePosted":"2026-07-12","validThrough":"2026-08-12",
  "employmentType":"FULL_TIME","jobLocationType":"TELECOMMUTE","url":"https://careers.acme.example/cro",
  "hiringOrganization":{"@type":"Organization","name":"Acme","sameAs":"https://acme.example"},
  "baseSalary":{"@type":"MonetaryAmount","currency":"EUR","value":{"@type":"QuantitativeValue","minValue":220000,"maxValue":280000}}
}</script></head><body>Chief Revenue Officer</body></html>`;

assert.equal(parseJobPostingJsonLd(markup).length, 1);
assert.equal(isSafePublicCareerUrl(new URL("https://careers.acme.example/cro")), true);
assert.equal(isSafePublicCareerUrl(new URL("http://careers.acme.example/cro")), false);
assert.equal(isSafePublicCareerUrl(new URL("https://localhost/cro")), false);
assert.equal(isSafePublicCareerUrl(new URL("https://127.0.0.1/cro")), false);
assert.throws(() => parseCompanyCareerUrl("https://service.internal/jobs"), /public HTTPS/);
assert.equal(providerFromCareersUrl("https://boards.greenhouse.io/acme").id, "greenhouse", "Specific providers must resolve before the generic company-site adapter");
assert.equal(providerFromCareersUrl("https://careers.acme.example/cro").id, "corporate-career-site");

const fetcher = async () => new Response(markup, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
const resolver = async () => [{ address: "93.184.216.34", family: 4 }];
const provider = new CompanyCareerSiteOpportunityProvider(new URL("https://careers.acme.example/cro"), fetcher, resolver);
const batch = await provider.collect(request);
assert.equal(batch.jobs.length, 1);
assert.equal(batch.jobs[0].sourceId, "ACME-CRO-1");
assert.equal(batch.jobs[0].company.name, "Acme");
assert.equal(batch.jobs[0].location, "Remote");
assert.equal(batch.jobs[0].salary?.minimum, 220000);
assert.equal(batch.jobs[0].salary?.currency, "EUR");
assert.equal((await provider.health()).status, "connected");
const privateProvider = new CompanyCareerSiteOpportunityProvider(new URL("https://careers.acme.example/cro"), fetcher, async () => [{ address: "127.0.0.1", family: 4 }]);
assert.equal((await privateProvider.health()).status, "unavailable");

assert.deepEqual(tierOneProviderPriorities.map((item) => item.name), ["Greenhouse", "Lever", "Ashby", "Company Career Sites", "LinkedIn Jobs", "Workday"]);
assert.equal(tierOneProviderPriorities.filter((item) => item.status === "implemented").length, 4);
assert.equal(tierOneProviderPriorities.filter((item) => item.status === "founder-approval-required").length, 2);
assert.equal(productionProviderAdapters.some((adapter) => adapter.id === "linkedin" || adapter.id === "workday"), false, "Gated providers must not be activated silently");

console.log("Tier 1 opportunity coverage checks passed.");
