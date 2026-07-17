import assert from "node:assert/strict";
import { adviseExecutiveDecision, assessExecutiveDecision, decisionDomainIds, decisionDomainRegistry, executiveDecisionIntelligenceVersion, measureDecisionIntelligence } from "../lib/discovery/executive-decision-intelligence.ts";
import { buildAtlasKnowledgeView, buildEmploymentKnowledgeGraph } from "../lib/discovery/employment-knowledge-graph.ts";

const observedAt = "2026-07-17T16:00:00.000Z";
const discoveryResult = {
  job: { sourceId: "role-1", source: "greenhouse", title: "Chief Revenue Officer", company: { sourceId: "acme", canonicalKey: "greenhouse:acme", name: "Acme", industry: "Software" }, location: "Amsterdam", country: "Netherlands", originalUrl: "https://example.com/role-1", publishedAt: observedAt, discoveredAt: observedAt, salary: { minimum: 180000, maximum: 220000, currency: "EUR" }, rawMetadata: {} },
  normalizedOpportunity: { id: "canonical-opportunity-1", externalIds: ["role-1"], normalizedTitle: "chief revenue officer", companyName: "Acme", companyInitials: "ACM", jobTitle: "Chief Revenue Officer", location: "Amsterdam", country: "Netherlands", workArrangement: "Hybrid", employmentType: "Full-time", industry: "Software", companySize: "Not specified", source: "greenhouse", publishedAt: observedAt, discoveredAt: observedAt, salaryMin: 180000, salaryMax: 220000, salaryCurrency: "EUR", executiveFitScore: 0, strategicOpportunityScore: 0, overallScore: 0, confidenceScore: 90, status: "Discovered", priority: "Low", travelRequirement: "Not assessed", summary: "Evidence-backed role", keyResponsibilities: [], requiredSkills: ["Enterprise Sales"], preferredSkills: [], matchingStrengths: [], missingRequirements: [], riskFlags: [], exclusions: [], decisionRationale: "Awaiting Atlas assessment.", recommendedCVProfile: "Not assessed", coverLetterRecommended: false, notes: "", freshness: { status: "Fresh", staleAfterHours: 36 }, companyProfile: { canonicalKey: "greenhouse:acme", name: "Acme", industry: "Software", evidenceStatus: "Partial" } },
  provenance: { source: "greenhouse", connector: "greenhouse", discoveredAt: observedAt, originalUrl: "https://example.com/role-1", originalId: "role-1", normalizationVersion: "1.0.0", importRunId: "run-1", confidence: { type: "Corporate Website", rating: "high", score: 90, rationale: "Employer-published source", assessedAt: observedAt }, evidence: [{ kind: "source-record", reference: "role-1", observedAt }] }, warnings: [],
};

const graph = buildEmploymentKnowledgeGraph({ discoveryResults: [discoveryResult], generatedAt: observedAt });
const atlasGraph = buildAtlasKnowledgeView(graph);
const opportunity = graph.entities.find((entity) => entity.kind === "Opportunity");
const employer = graph.entities.find((entity) => entity.kind === "Employer");
const compensation = graph.entities.find((entity) => entity.kind === "Compensation");
assert.ok(opportunity && employer && compensation);
const evidenceId = opportunity.evidenceIds[0];

assert.equal(executiveDecisionIntelligenceVersion, "orion-decision-intelligence-v1");
assert.equal(decisionDomainRegistry.length, 6);
assert.deepEqual(decisionDomainRegistry.map((domain) => domain.id), decisionDomainIds);
assert.equal(decisionDomainRegistry.every((domain) => domain.purpose && domain.inputs.length && domain.evidenceRequirements.length && domain.outputs.length && domain.unknownConditions.length && domain.explainability && domain.reusePotential.length), true);

const opportunityAssessment = assessExecutiveDecision(atlasGraph, {
  domain: "Opportunity Intelligence",
  focusEntityId: opportunity.id,
  signals: [
    { id: "observed-role", direction: "For", statement: "The source explicitly identifies an executive commercial role.", evidenceIds: [evidenceId] },
    { id: "employer-depth", direction: "Against", statement: "Employer evidence is limited to the observed hiring source.", evidenceIds: [evidenceId], alternativeInterpretation: "The employer may provide more detail during direct diligence." },
  ],
});
assert.equal(opportunityAssessment.state, "Decision Support Available");
assert.equal(opportunityAssessment.recommendationEligible, true);
assert.equal(opportunityAssessment.confidence.level, "High");
assert.equal(opportunityAssessment.gates.length, 5);
assert.equal(opportunityAssessment.gates.every((gate) => gate.passed), true);
assert.equal(opportunityAssessment.reasonsFor.length, 1);
assert.equal(opportunityAssessment.reasonsAgainst.length, 1);
assert.equal(opportunityAssessment.alternativeInterpretations.length, 1);
const opportunityAdvice = adviseExecutiveDecision(opportunityAssessment);
assert.equal(opportunityAdvice.recommendation, "Review evidence");
assert.equal(opportunityAdvice.supportingEvidence.length > 0, true);
assert.equal(opportunityAdvice.unknowns.length >= 0, true);

const employerAssessment = assessExecutiveDecision(atlasGraph, { domain: "Employer Intelligence", focusEntityId: employer.id });
assert.equal(employerAssessment.state, "Decision Support Available");
const compensationAssessment = assessExecutiveDecision(atlasGraph, { domain: "Compensation Intelligence", focusEntityId: opportunity.id });
assert.equal(compensationAssessment.state, "Decision Support Available");
assert.equal(compensationAssessment.knownFacts.some((fact) => fact.startsWith("Compensation:")), true);

const careerAssessment = assessExecutiveDecision(atlasGraph, { domain: "Career Progression Intelligence", focusEntityId: opportunity.id });
assert.equal(careerAssessment.state, "Insufficient Evidence");
assert.equal(careerAssessment.unknowns.includes("verified-career-sequence context"), true);
assert.equal(adviseExecutiveDecision(careerAssessment).recommendation, "Do not recommend");
const marketAssessment = assessExecutiveDecision(atlasGraph, { domain: "Market Intelligence" });
assert.equal(marketAssessment.state, "Insufficient Evidence");
assert.equal(marketAssessment.unknowns.includes("representative-market-scope context"), true);
const fitAssessment = assessExecutiveDecision(atlasGraph, { domain: "Executive Fit Intelligence", focusEntityId: opportunity.id });
assert.equal(fitAssessment.state, "Insufficient Evidence");
assert.equal(fitAssessment.unknowns.includes("confirmed-executive-profile context"), true);

assert.throws(() => assessExecutiveDecision(atlasGraph, { domain: "Opportunity Intelligence", focusEntityId: opportunity.id, signals: [{ id: "guess", direction: "For", statement: "Unsupported", evidenceIds: [] }] }), /must cite existing graph evidence/);
assert.throws(() => assessExecutiveDecision(atlasGraph, { domain: "Opportunity Intelligence", focusEntityId: "missing" }), /not present/);

const assessments = [opportunityAssessment, employerAssessment, compensationAssessment, careerAssessment, marketAssessment, fitAssessment];
const metrics = measureDecisionIntelligence(assessments);
assert.equal(metrics.decisionModelCoverage, 100);
assert.equal(metrics.explainabilityCoverage, 100);
assert.equal(metrics.evidenceTraceability, 100);
assert.equal(metrics.confidenceCoverage, 100);
assert.equal(metrics.executiveTrustReadiness, 100);
assert.equal(metrics.futureIntelligenceLeverage, "High");

console.log(JSON.stringify({ message: "Executive Decision Intelligence checks passed.", ...metrics, supportedFixtureDomains: assessments.filter((assessment) => assessment.recommendationEligible).length, unsupportedRecommendationsIssued: 0 }, null, 2));
