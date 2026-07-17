import assert from "node:assert/strict";
import { DefaultOpportunityNormalizer, opportunityContentFingerprint } from "../lib/discovery/normalizer.ts";
import { mergeOpportunityObservations } from "../lib/opportunity-universe.ts";

const job = { sourceId: "one", source: "smartrecruiters", title: "VP Sales", company: { sourceId: "acme", canonicalKey: "smartrecruiters:acme", name: "Acme" }, location: "Amsterdam", country: "Netherlands", description: "Lead commercial growth.", publishedAt: "2026-07-17T08:00:00Z", discoveredAt: "2026-07-17T12:00:00Z", employmentType: "Full-time", rawMetadata: {} };
assert.equal(opportunityContentFingerprint(job), opportunityContentFingerprint({ ...job, discoveredAt: "2026-07-18T12:00:00Z" }), "Observation time must not change content identity");
assert.notEqual(opportunityContentFingerprint(job), opportunityContentFingerprint({ ...job, description: "Lead global commercial growth." }), "Material source content must change the fingerprint");
const context = { configuration: { source: "smartrecruiters", enabled: true, priority: 1, maximumResults: 10, filters: {} }, runId: "run", requestedAt: job.discoveredAt };
const reliability = { type: "Official API", rating: "high", score: 90, rationale: "Official source", assessedAt: job.discoveredAt };
const normalizer = new DefaultOpportunityNormalizer();
const original = { ...normalizer.normalize(job, context, reliability).normalizedOpportunity, atlasAnalysisStatus: "Current", atlasAnalyzedFingerprint: opportunityContentFingerprint(job) };
const unchanged = normalizer.normalize({ ...job, discoveredAt: "2026-07-18T12:00:00Z" }, context, reliability).normalizedOpportunity;
assert.equal(mergeOpportunityObservations(original, unchanged, unchanged.discoveredAt).atlasAnalysisStatus, "Current", "Unchanged refresh must reuse Atlas analysis");
const changed = normalizer.normalize({ ...job, description: "Lead global commercial growth.", discoveredAt: "2026-07-19T12:00:00Z" }, context, reliability).normalizedOpportunity;
assert.equal(mergeOpportunityObservations(original, changed, changed.discoveredAt).atlasAnalysisStatus, "Pending", "Changed content must request reassessment");
console.log(JSON.stringify({ message: "Opportunity fingerprint and Atlas reuse checks passed.", unchangedAnalysisReused: true, changedAnalysisQueued: true }, null, 2));
