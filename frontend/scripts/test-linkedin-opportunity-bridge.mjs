import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { importLinkedInOpportunity, extractLinkedInJobUrlsFromAlert, SingleEmployerRecordProvider } from "../lib/discovery/linkedin-bridge.ts";
import { MemoryOpportunityIngestionSink } from "../lib/discovery/pipeline.ts";
import { parseLinkedInJobUrl, extractVisibleLinkedInDetails, resolveEmployerApplicationUrl } from "../lib/discovery/providers/linkedin-user-import.ts";
import { providerFromCareersUrl } from "../lib/discovery/providers/factory.ts";
import { buildExecutiveOpportunityIntelligence, opportunityIntelligenceBlueprint } from "../lib/opportunity-intelligence.ts";
import { mergeOpportunityObservations } from "../lib/opportunity-universe.ts";

const realShape = "https://www.linkedin.com/jobs/view/global-vice-president-sales-1234567890/?trackingId=ignored";
assert.deepEqual(parseLinkedInJobUrl(realShape), { url: "https://www.linkedin.com/jobs/view/1234567890", jobId: "1234567890" });
for (const invalid of ["https://linkedin.example/jobs/view/1234567890", "http://www.linkedin.com/jobs/view/1234567890", "https://www.linkedin.com/feed/", "javascript:alert(1)"]) assert.throws(() => parseLinkedInJobUrl(invalid));

const details = extractVisibleLinkedInDetails("Title: Chief Revenue Officer\nCompany: Example Holdings\nLocation: London\nApplication URL: https://jobs.example.com/cro");
assert.equal(details.title, "Chief Revenue Officer");
assert.equal(details.company, "Example Holdings");
assert.equal(details.employerUrl, "https://jobs.example.com/cro");
assert.equal(resolveEmployerApplicationUrl("", details), "https://jobs.example.com/cro");
for (const unsafe of ["http://127.0.0.1/job", "https://127.0.0.1/job", "https://169.254.169.254/latest/meta-data", "https://localhost/job", "https://user:secret@example.com/job"]) {
  if (unsafe.startsWith("http://") || unsafe.includes("user:secret")) assert.throws(() => resolveEmployerApplicationUrl(unsafe, {}));
  else assert.throws(() => providerFromCareersUrl(unsafe));
}

const sink = new MemoryOpportunityIngestionSink();
const input = { linkedInUrl: realShape, visibleDetails: "Title: Chief Revenue Officer\nCompany: Example Holdings\nLocation: London\nVisible job details selected by the user." };
const first = await importLinkedInOpportunity(input, sink);
const second = await importLinkedInOpportunity(input, sink);
const urlOnlyRepeat = await importLinkedInOpportunity({ linkedInUrl: realShape }, sink);
const records = await sink.list();
assert.equal(records.length, 1, "repeated imports must remain one canonical opportunity");
assert.equal(first.opportunityId, second.opportunityId);
assert.equal(second.linkedInOutcome.items[0].disposition, "duplicate");
assert.equal(urlOnlyRepeat.linkedInOutcome.items[0].disposition, "duplicate");
assert.equal(records[0].companyName, "Example Holdings", "a URL-only alert refresh must not replace richer user-supplied details");
assert.equal(records[0].jobTitle, "Chief Revenue Officer", "a repeated URL-only import must preserve the known role title");
assert.equal(records[0].visibility, "Private");
assert.equal(records[0].verificationStatus, "Unverified LinkedIn observation");
assert.equal(records[0].sources?.length, 1);
assert.equal(records[0].sources?.[0].id, "linkedin");
assert.equal(records[0].sources?.[0].originalId, "1234567890");
assert.equal(records[0].sources?.[0].confidence, "Low");

const intelligence = buildExecutiveOpportunityIntelligence(records[0], opportunityIntelligenceBlueprint(), records);
assert.equal(intelligence.opportunityId, records[0].id, "the canonical import must be immediately available to Atlas");
assert.ok(intelligence.provenance.some((source) => source.id === "linkedin"));
assert.equal(intelligence.evidence.find((item) => item.label === "Role")?.certainty, "Estimated", "Atlas must not present an unverified LinkedIn observation as confirmed fact");
assert.ok(intelligence.missingInformation.some((item) => item.includes("Employer-controlled source")));

const employer = { ...records[0], id: "discovered-greenhouse-example-42", source: "Greenhouse", sourceUrl: "https://job-boards.greenhouse.io/example/jobs/42", sources: [{ id: "greenhouse", name: "Greenhouse", kind: "Employer", originalId: "example-42", originalUrl: "https://job-boards.greenhouse.io/example/jobs/42", collectedAt: records[0].discoveredAt, confidence: "High" }], confidenceScore: 90, verificationStatus: undefined };
const linkedInMatched = { ...records[0], verificationStatus: "Employer source matched" };
const canonical = mergeOpportunityObservations(employer, linkedInMatched, new Date().toISOString());
assert.equal(canonical.id, employer.id);
assert.equal(canonical.sources?.length, 2);
assert.equal(canonical.verificationStatus, "Employer source matched");
assert.equal(canonical.sourceUrl, employer.sourceUrl, "the authoritative employer URL must remain the canonical listing");

const alertUrls = extractLinkedInJobUrlsFromAlert(`See https://www.linkedin.com/jobs/view/1234567890 and https://linkedin.com/jobs/view/another-role-9876543210?trk=email and again ${realShape}`);
assert.deepEqual(alertUrls, ["https://www.linkedin.com/jobs/view/1234567890", "https://www.linkedin.com/jobs/view/9876543210"]);

let requestedEmployerLimit = 0;
const employerTarget = "https://job-boards.greenhouse.io/example/jobs/42";
const employerProvider = { id: "greenhouse", source: { id: "greenhouse", name: "Greenhouse", category: "Corporate Website", description: "test", capabilities: ["jobs"] }, reliability: { type: "Corporate Website", rating: "high", score: 90, rationale: "test", assessedAt: new Date().toISOString() }, async health() { return { source: "greenhouse", status: "connected", checkedAt: new Date().toISOString(), message: "test" }; }, async collect(request) { requestedEmployerLimit = request.maximumResults; const discoveredAt = new Date().toISOString(); const job = (id) => ({ sourceId: `example-${id}`, source: "greenhouse", title: id === 42 ? "Chief Revenue Officer" : "Other role", company: { sourceId: "example", name: "Example Holdings" }, location: "London", originalUrl: `https://job-boards.greenhouse.io/example/jobs/${id}`, discoveredAt, rawMetadata: {} }); return { providerId: "greenhouse", collectedAt: discoveredAt, jobs: [job(1), job(42)] }; } };
const singleEmployer = new SingleEmployerRecordProvider(employerProvider, employerTarget);
const employerBatch = await singleEmployer.collect({ runId: "test", requestedAt: new Date().toISOString(), maximumResults: 1, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } });
assert.equal(requestedEmployerLimit, 100, "exact employer matching must inspect the bounded board rather than only its first role");
assert.equal(employerBatch.jobs.length, 1);
assert.equal(employerBatch.jobs[0].sourceId, "example-42");

const persistence = await readFile(new URL("../lib/discovery/supabase-ingestion.ts", import.meta.url), "utf8");
assert.match(persistence, /workspace_id=eq\.\$\{this\.workspace\.workspaceId\}/, "LinkedIn imports must use the existing workspace-scoped sink");
assert.doesNotMatch(persistence, /service[_-]?role/i, "the import sink must not introduce privileged cross-workspace access");

console.log("LinkedIn Opportunity Bridge tests passed: validation, consent input parsing, provenance, repeated-import deduplication, SSRF boundaries, Atlas availability, and workspace scoping.");
