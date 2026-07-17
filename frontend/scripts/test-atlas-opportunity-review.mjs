import assert from "node:assert/strict";
import { atlasOpportunityReviewSectionIds, atlasOpportunityReviewVersion, buildAtlasOpportunityReview, measureAtlasOpportunityReviews, validateAtlasOpportunityReview } from "../lib/discovery/atlas-opportunity-review.ts";

const at = "2026-07-17T19:00:00.000Z";
const evidence = { evidenceId: "evidence:opportunity", source: "greenhouse", observedAt: at, confidence: { score: 90, rating: "Very High", basis: "Employer-controlled source" } };
const gates = ["Decision Quality", "Explainability", "Evidence", "Confidence", "Executive Trust"].map((gate) => ({ gate, passed: true, explanation: "The gate passed using reviewed Orion evidence." }));
const eligible = {
  version: "orion-decision-intelligence-v1", domain: "Opportunity Intelligence", focusEntityId: "opportunity:one", state: "Decision Support Available", summary: "The opportunity has sufficient evidence for executive review.", supportingEvidence: [evidence], confidence: { level: "High", score: 90, method: "Confidence equals the weakest cited evidence." },
  knownFacts: ["Opportunity: Chief Revenue Officer", "Employer: Acme", "ExecutiveRole: Chief Revenue Officer"], unknowns: ["Hiring manager is Unknown", "work arrangement has conflicting evidence"], alternativeInterpretations: ["The role may be hybrid rather than fully remote."],
  reasonsFor: [{ id: "for", direction: "For", statement: "The source explicitly identifies an executive commercial role.", evidenceIds: [evidence.evidenceId] }], reasonsAgainst: [{ id: "against", direction: "Against", statement: "The work arrangement requires verification.", evidenceIds: [evidence.evidenceId] }], context: [], suggestedNextActions: ["Verify role scope and work arrangement with the employer."], gates, recommendationEligible: true,
};
const withheld = {
  ...eligible, focusEntityId: "opportunity:two", state: "Insufficient Evidence", summary: "Required role-scope evidence is incomplete; Atlas will not recommend a decision.", confidence: { level: "Low", score: 49, method: "Required evidence is incomplete; confidence cannot exceed Low." }, unknowns: ["Role scope is Unknown", "Work authorization is Unknown"], alternativeInterpretations: [], reasonsFor: [], reasonsAgainst: [], suggestedNextActions: ["Collect role scope and work authorization evidence."], gates: gates.map((gate) => gate.gate === "Decision Quality" ? { ...gate, passed: false, explanation: "Required evidence is incomplete." } : gate), recommendationEligible: false,
};

const eligibleReview = buildAtlasOpportunityReview(eligible, at);
const withheldReview = buildAtlasOpportunityReview(withheld, "2026-07-17T19:05:00.000Z");
assert.equal(atlasOpportunityReviewVersion, "atlas-opportunity-review-v1");
assert.equal(atlasOpportunityReviewSectionIds.length, 12);
assert.equal(eligibleReview.state, "Recommendation Available");
assert.equal(eligibleReview.sections.length, 12);
assert.equal(eligibleReview.objects.filter((object) => object.kind === "Recommendation").length, 1);
assert.equal(eligibleReview.actualUnknownCount, 1);
assert.equal(eligibleReview.actualConflictCount, 1);
assert.equal(eligibleReview.estimatedReadingMinutes <= 5, true);
assert.equal(validateAtlasOpportunityReview(eligibleReview).valid, true);
assert.equal(withheldReview.state, "Recommendation Withheld");
assert.equal(withheldReview.objects.filter((object) => object.kind === "Recommendation").length, 0);
assert.equal(withheldReview.objects.some((object) => object.statement === "Recommendation Withheld"), true);
assert.equal(withheldReview.objects.some((object) => object.kind === "Investigation Request" && object.requestedEvidence.length), true);
assert.equal(validateAtlasOpportunityReview(withheldReview).valid, true);

const metrics = measureAtlasOpportunityReviews([eligibleReview, withheldReview]);
assert.equal(metrics.opportunityReviewCompletion, 100);
assert.equal(metrics.evidenceVisibility, 100);
assert.equal(metrics.recommendationEligibility, 50);
assert.equal(metrics.recommendationWithheldRate, 50);
assert.equal(metrics.averageUnknownCount, 1.5);
assert.equal(metrics.conflictVisibility, 100);
assert.equal(metrics.executiveReadingEfficiency.withinFiveMinutes, 100);
assert.equal(metrics.futurePersonalizationReadiness, "Ready");

assert.throws(() => buildAtlasOpportunityReview({ ...eligible, domain: "Employer Intelligence" }, at), /requires an Opportunity Intelligence assessment/);
assert.throws(() => buildAtlasOpportunityReview({ ...eligible, focusEntityId: null }, at), /requires a canonical opportunity focus/);
const unsafe = { ...eligibleReview, state: "Recommendation Available", decisionGates: eligibleReview.decisionGates.map((gate) => gate.gate === "Evidence" ? { ...gate, passed: false } : gate) };
assert.equal(validateAtlasOpportunityReview(unsafe).recommendationSafe, false);

console.log(JSON.stringify({ message: "Atlas Opportunity Review checks passed.", ...metrics, sections: atlasOpportunityReviewSectionIds.length, unsupportedRecommendations: 0 }, null, 2));
