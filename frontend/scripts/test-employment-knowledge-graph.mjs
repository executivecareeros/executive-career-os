import assert from "node:assert/strict";
import {
  buildAtlasKnowledgeView,
  buildEmploymentKnowledgeGraph,
  createKnowledgeGraphBuilder,
  employmentKnowledgeGraphVersion,
  knowledgeEntityKinds,
  measureKnowledgeGraph,
} from "../lib/discovery/employment-knowledge-graph.ts";

const observedAt = "2026-07-17T15:00:00.000Z";
const result = ({ source = "greenhouse", sourceId = "role-1", company = "Acme", canonicalKey = "greenhouse:acme", location = "Amsterdam", title = "Chief Revenue Officer" } = {}) => ({
  job: { sourceId, source, title, company: { sourceId: "acme", canonicalKey, name: company, industry: "Software" }, location, country: "Netherlands", originalUrl: `https://example.com/${sourceId}`, publishedAt: observedAt, discoveredAt: observedAt, rawMetadata: {} },
  normalizedOpportunity: {
    id: "canonical-opportunity-1", externalIds: [sourceId], normalizedTitle: title.toLowerCase(), companyName: company, companyInitials: "ACM", jobTitle: title, location, country: "Netherlands", workArrangement: "Hybrid", employmentType: "Full-time", industry: "Software", companySize: "Not specified", source, publishedAt: observedAt, discoveredAt: observedAt, executiveFitScore: 0, strategicOpportunityScore: 0, overallScore: 0, confidenceScore: 90, status: "Discovered", priority: "Low", travelRequirement: "Not assessed", summary: "Evidence-backed role", keyResponsibilities: [], requiredSkills: ["Enterprise Sales"], preferredSkills: [], matchingStrengths: [], missingRequirements: [], riskFlags: [], exclusions: [], decisionRationale: "Awaiting Atlas assessment.", recommendedCVProfile: "Not assessed", coverLetterRecommended: false, notes: "", freshness: { status: "Fresh", staleAfterHours: 36 }, companyProfile: { canonicalKey, name: company, industry: "Software", evidenceStatus: "Partial" },
  },
  provenance: { source, connector: source, discoveredAt: observedAt, originalUrl: `https://example.com/${sourceId}`, originalId: sourceId, normalizationVersion: "1.0.0", importRunId: "run-1", confidence: { type: "Corporate Website", rating: "high", score: 90, rationale: "Employer-published source", assessedAt: observedAt }, evidence: [{ kind: "source-record", reference: sourceId, observedAt }] },
  warnings: [],
});

const graph = buildEmploymentKnowledgeGraph({ discoveryResults: [result()], generatedAt: observedAt });
assert.equal(graph.version, employmentKnowledgeGraphVersion);
assert.equal(knowledgeEntityKinds.length, 13);
assert.equal(graph.entities.some((entity) => entity.kind === "Employer" && entity.label === "Acme"), true);
assert.equal(graph.entities.some((entity) => entity.kind === "Opportunity"), true);
assert.equal(graph.entities.some((entity) => entity.kind === "Skill" && entity.label === "Enterprise Sales"), true);
assert.equal(graph.relationships.some((relationship) => relationship.kind === "EMPLOYER_OWNS_OPPORTUNITY"), true);
assert.equal(graph.evidence.every((evidence) => evidence.connectorId && evidence.dataSourceId && evidence.observedAt), true);
assert.equal(graph.assertions.every((assertion) => assertion.values.every((value) => value.evidenceIds.length)), true);

const metrics = measureKnowledgeGraph(graph);
assert.equal(metrics.entityCoverage, 100);
assert.equal(metrics.relationshipCoverage, 100);
assert.equal(metrics.evidenceCoverage, 100);
assert.equal(metrics.provenanceCoverage, 100);
assert.equal(metrics.atlasKnowledgeReadiness, 100);

const atlasView = buildAtlasKnowledgeView(graph);
assert.equal("job" in atlasView, false);
assert.equal("rawMetadata" in atlasView, false);
assert.equal(atlasView.evidence.every((evidence) => !("facts" in evidence) && !("reproductionReference" in evidence)), true);

const builder = createKnowledgeGraphBuilder();
builder.addCertificationObservation({ providerId: "greenhouse", certificationId: "cert-greenhouse-1", status: "Passed", frameworkVersion: "provider-certification-v1", observedAt, evidenceReference: "immutable certification report" });
builder.addOperationalObservation({ providerId: "greenhouse", measuredAt: observedAt, health: "Healthy", status: "connected", certificationStatus: "Passed", operationalTrust: { score: 100, confidence: "Measured" } });
const first = builder.projectDiscoveryResult(result());
const replay = builder.projectDiscoveryResult(result(), "2026-07-17T15:05:00.000Z");
assert.equal(first.opportunityId, replay.opportunityId);
assert.equal(first.employerId, replay.employerId);
let replayGraph = builder.finalize("2026-07-17T15:05:00.000Z");
assert.equal(replayGraph.entities.filter((entity) => entity.kind === "Opportunity").length, 1);
assert.equal(replayGraph.entities.filter((entity) => entity.kind === "Employer").length, 1);

builder.projectDiscoveryResult(result({ source: "lever", sourceId: "role-77", canonicalKey: "", location: "Berlin" }), "2026-07-17T15:10:00.000Z");
replayGraph = builder.finalize("2026-07-17T15:10:00.000Z");
assert.equal(replayGraph.entities.filter((entity) => entity.kind === "Opportunity").length, 1, "canonical opportunity identity remains stable");
assert.equal(replayGraph.entities.filter((entity) => entity.kind === "Employer").length, 2, "source-scoped employers are never silently merged");
const locationAssertion = replayGraph.assertions.find((assertion) => assertion.entityId === first.opportunityId && assertion.field === "location");
assert.equal(locationAssertion?.state, "Conflicted");
assert.equal(locationAssertion?.values.length, 2);
assert.equal(locationAssertion?.values.every((value) => value.evidenceIds.length > 0), true);

assert.throws(() => builder.recordIdentityDecision({ entityKind: "Employer", candidates: [first.employerId], decision: "Merged", evidenceIds: [], reason: "Unsupported", decidedAt: observedAt }), /require evidence/);
const identityId = builder.recordIdentityDecision({ entityKind: "Employer", candidates: replayGraph.entities.filter((entity) => entity.kind === "Employer").map((entity) => entity.id), decision: "Pending Evidence", evidenceIds: [], reason: "Names alone do not prove legal identity", decidedAt: observedAt });
assert.equal(Boolean(identityId), true);
assert.throws(() => builder.createAtlasInsight({ label: "Unsupported", insight: "Guess", evidenceIds: [], observedAt, confidenceScore: 90 }), /require existing graph evidence/);
const insightId = builder.createAtlasInsight({ label: "Evidence-backed fit", insight: "The source explicitly identifies an executive sales role.", evidenceIds: [first.evidenceId], observedAt, confidenceScore: 85 });
assert.equal(Boolean(insightId), true);
const finalGraph = builder.finalize(observedAt);
assert.equal(finalGraph.entities.some((entity) => entity.kind === "Certification"), true);
assert.equal(finalGraph.entities.some((entity) => entity.kind === "OperationalObservation"), true);
assert.equal(finalGraph.relationships.some((relationship) => relationship.kind === "OPERATIONAL_OBSERVATION_VALIDATES_CONNECTOR"), true);
assert.equal(finalGraph.entities.some((entity) => entity.id === insightId && entity.kind === "AtlasInsight"), true);
assert.equal(finalGraph.relationships.some((relationship) => relationship.kind === "ATLAS_INSIGHT_REFERENCES_EVIDENCE"), true);
assert.equal(finalGraph.identityHistory.some((decision) => decision.decision === "Pending Evidence"), true);

console.log(JSON.stringify({
  message: "Employment Knowledge Graph foundation checks passed.",
  entityKinds: knowledgeEntityKinds.length,
  entityCoverage: metrics.entityCoverage,
  relationshipCoverage: metrics.relationshipCoverage,
  evidenceCoverage: metrics.evidenceCoverage,
  provenanceCoverage: metrics.provenanceCoverage,
  conflictResolutionCoverage: metrics.conflictResolutionCoverage,
  atlasKnowledgeReadiness: metrics.atlasKnowledgeReadiness,
  silentIdentityMerges: 0,
}, null, 2));
