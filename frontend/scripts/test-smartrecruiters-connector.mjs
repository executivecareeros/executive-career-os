import assert from "node:assert/strict";
import { SmartRecruitersOpportunityProvider, parseSmartRecruitersCompany } from "../lib/discovery/providers/smartrecruiters.ts";
import { providerFromCareersUrl } from "../lib/discovery/providers/factory.ts";

assert.equal(parseSmartRecruitersCompany("https://careers.smartrecruiters.com/Acme"), "Acme");
assert.equal(parseSmartRecruitersCompany("https://jobs.smartrecruiters.com/Acme/role"), "Acme");
assert.throws(() => parseSmartRecruitersCompany("http://careers.smartrecruiters.com/Acme"));
assert.throws(() => parseSmartRecruitersCompany("https://example.com/Acme"));
assert.equal(providerFromCareersUrl("https://careers.smartrecruiters.com/Acme").id, "smartrecruiters");

const postings = Array.from({ length: 101 }, (_, index) => ({
  id: `role-${index}`,
  name: index === 0 ? "Chief Revenue Officer" : `Vice President, Commercial ${index}`,
  company: { identifier: "Acme", name: "Acme Global" },
  releasedDate: "2026-07-17T08:00:00Z",
  location: { city: "Berlin", country: "Germany", hybrid: true, fullLocation: "Berlin, Germany" },
  industry: { label: "Enterprise Software" },
  department: { label: "Commercial" },
  function: { label: "Sales" },
  typeOfEmployment: { label: "Full-time" },
  experienceLevel: { label: "Executive" },
}));
const calls = [];
const fetcher = async (input) => {
  const url = new URL(String(input));
  calls.push(url);
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 5) {
    const id = segments.at(-1);
    const posting = postings.find((record) => record.id === id);
    return new Response(JSON.stringify({
      ...posting,
      postingUrl: `https://jobs.smartrecruiters.com/Acme/${id}`,
      applyUrl: `https://jobs.smartrecruiters.com/Acme/${id}/apply`,
      active: true,
      jobAd: { sections: {
        companyDescription: { title: "Company", text: "<p>Global software company.</p>" },
        jobDescription: { title: "Role", text: "<p>Lead global commercial growth.</p>" },
        qualifications: { title: "Qualifications", text: "<p>Executive leadership experience.</p>" },
      } },
    }));
  }
  const offset = Number(url.searchParams.get("offset") ?? 0);
  const limit = Number(url.searchParams.get("limit") ?? 100);
  return new Response(JSON.stringify({ offset, limit, totalFound: postings.length, content: postings.slice(offset, offset + limit) }));
};

const provider = new SmartRecruitersOpportunityProvider("Acme", fetcher);
const batch = await provider.collect({ runId: "test", requestedAt: "2026-07-17T12:00:00Z", maximumResults: 150, filters: {} });
assert.equal(batch.jobs.length, 101);
assert.equal(batch.completeSnapshot, true);
assert.deepEqual(batch.snapshotScopeKeys, ["smartrecruiters:Acme"]);
assert.equal(batch.jobs[0].company.name, "Acme Global");
assert.equal(batch.jobs[0].company.industry, "Enterprise Software");
assert.equal(batch.jobs[0].rawMetadata.function, "Sales");
assert.equal(batch.jobs[0].rawMetadata.seniority, "Executive");
assert.equal(batch.jobs[0].rawMetadata.workArrangement, "Hybrid");
assert.match(batch.jobs[0].description, /Lead global commercial growth/);
assert.equal(calls.filter((url) => url.searchParams.has("offset")).length, 2);
assert.equal(calls.filter((url) => !url.searchParams.has("offset")).length, 101);
assert.equal((await provider.health()).status, "connected");

console.log(JSON.stringify({ message: "SmartRecruiters connector checks passed.", jobs: batch.jobs.length, completeSnapshot: batch.completeSnapshot }, null, 2));
