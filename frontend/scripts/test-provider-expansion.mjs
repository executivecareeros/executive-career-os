import assert from "node:assert/strict";
import { PersonioOpportunityProvider, parsePersonioAccount } from "../lib/discovery/providers/personio.ts";
import { RecruiteeOpportunityProvider, parseRecruiteeCompany } from "../lib/discovery/providers/recruitee.ts";
import { WorkableOpportunityProvider, parseWorkableAccount } from "../lib/discovery/providers/workable.ts";
import { providerFromCareersUrl } from "../lib/discovery/providers/factory.ts";

const request = { runId: "expansion-test", requestedAt: "2026-07-14T12:00:00Z", maximumResults: 10, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } };

assert.equal(parseRecruiteeCompany("https://acme.recruitee.com/o/chief-revenue-officer"), "acme");
assert.equal(parseWorkableAccount("https://apply.workable.com/acme/j/ABC"), "acme");
assert.deepEqual(parsePersonioAccount("https://acme.jobs.personio.com/job/123"), { account: "acme", region: "com" });
assert.equal(providerFromCareersUrl("https://acme.recruitee.com").id, "recruitee");
assert.equal(providerFromCareersUrl("https://apply.workable.com/acme").id, "workable");
assert.equal(providerFromCareersUrl("https://acme.jobs.personio.de").id, "personio");

const recruiteeFetch = async () => new Response(JSON.stringify({ offers: [{ id: 10, slug: "cro", title: "Chief Revenue Officer", company_name: "Acme", location: "Amsterdam", country: "Netherlands", country_code: "NL", remote: false, hybrid: true, department: "Executive", description: "<p>Lead revenue.</p>", requirements: "<p>Board experience.</p>", careers_url: "https://acme.recruitee.com/o/cro", published_at: "2026-07-10 09:00:00 UTC", employment_type_code: "fulltime", salary: { min: 220000, max: 280000, currency: "EUR" } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
const recruitee = await new RecruiteeOpportunityProvider("acme", recruiteeFetch).collect(request);
assert.equal(recruitee.jobs[0].title, "Chief Revenue Officer");
assert.equal(recruitee.jobs[0].rawMetadata.workArrangement, "Hybrid");
assert.equal(recruitee.jobs[0].description, "Lead revenue. Board experience.");

const workableFetch = async () => new Response(JSON.stringify({ name: "Acme", jobs: [{ title: "Chief Revenue Officer", shortcode: "CRO1", country: "United Kingdom", city: "London", department: "Executive", telecommuting: true, published_on: "2026-07-11", full_description: "<p>Lead global revenue.</p>", url: "https://apply.workable.com/acme/j/CRO1", employment_type: "Full-time", salary: { salary_from: 200000, salary_to: 260000, salary_currency: "GBP" } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
const workable = await new WorkableOpportunityProvider("acme", workableFetch).collect(request);
assert.equal(workable.jobs[0].location, "London, United Kingdom");
assert.equal(workable.jobs[0].rawMetadata.workArrangement, "Remote");
assert.equal(workable.jobs[0].salary?.currency, "GBP");

const personioXml = `<?xml version="1.0"?><workzag-jobs><position><id>42</id><subcompany>Acme &amp; Co.</subcompany><office>Berlin</office><additionalOffices><office>London</office></additionalOffices><department>Executive</department><name>Chief Revenue Officer</name><jobDescriptions><jobDescription><value><![CDATA[<p>Lead international growth.</p>]]></value></jobDescription></jobDescriptions><employmentType>permanent</employmentType><schedule>full-time</schedule><createdAt>2026-07-12T08:00:00+00:00</createdAt></position></workzag-jobs>`;
const personioFetch = async () => new Response(personioXml, { status: 200, headers: { "Content-Type": "application/xml" } });
const personio = await new PersonioOpportunityProvider("acme", "com", personioFetch).collect(request);
assert.equal(personio.jobs[0].company.name, "Acme & Co.");
assert.equal(personio.jobs[0].location, "Berlin, London");
assert.equal(personio.jobs[0].employmentType, "Full-time");

for (const batch of [recruitee, workable, personio]) {
  assert.equal(batch.jobs.length, 1);
  assert.equal(Boolean(batch.jobs[0].sourceId && batch.jobs[0].originalUrl && batch.jobs[0].discoveredAt), true);
}

console.log("Opportunity provider expansion checks passed.");
