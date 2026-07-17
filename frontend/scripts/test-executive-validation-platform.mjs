import assert from "node:assert/strict";
import { createValidationCase, decisionOutcomeStatuses, evaluateExecutiveValidation, executiveValidationPlatformVersion, recordDecisionOutcome, recordExecutiveFeedback, recordValidationJudgment, snapshotRecommendation, validationDimensionIds, validationDimensionRegistry } from "../lib/discovery/executive-validation-platform.ts";

const observedAt = "2026-07-17T17:00:00.000Z";
const evidence = { evidenceId: "evidence:one", source: "greenhouse", observedAt, confidence: { score: 90, rating: "Very High", basis: "Employer source" } };
const assessment = {
  version: "orion-decision-intelligence-v1", domain: "Opportunity Intelligence", focusEntityId: "opportunity:one", state: "Decision Support Available", summary: "Evidence supports review.", supportingEvidence: [evidence], confidence: { level: "High", score: 90, method: "Weakest evidence" }, knownFacts: ["Opportunity observed"], unknowns: ["Hiring manager Unknown"], alternativeInterpretations: ["Scope may change"],
  reasonsFor: [{ id: "for", direction: "For", statement: "Role is explicitly observed.", evidenceIds: [evidence.evidenceId] }], reasonsAgainst: [{ id: "against", direction: "Against", statement: "Scope is incomplete.", evidenceIds: [evidence.evidenceId] }], context: [], suggestedNextActions: ["Verify scope"], recommendationEligible: true,
  gates: ["Decision Quality", "Explainability", "Evidence", "Confidence", "Executive Trust"].map((gate) => ({ gate, passed: true, explanation: "Passed" })),
};

assert.equal(executiveValidationPlatformVersion, "orion-executive-validation-v1");
assert.equal(validationDimensionRegistry.length, 10);
assert.deepEqual(validationDimensionRegistry.map((dimension) => dimension.id), validationDimensionIds);
assert.equal(validationDimensionRegistry.every((dimension) => dimension.purpose && dimension.evidenceRequired.length && dimension.measurementMethod && dimension.unknownConditions.length && dimension.successCriteria), true);
assert.deepEqual(decisionOutcomeStatuses, ["Applied", "Declined", "Interviewed", "Offer Received", "Offer Accepted", "Opportunity Withdrawn", "Outcome Unknown"]);

const recommendationOne = snapshotRecommendation(assessment, "Review evidence", observedAt);
const emptyCase = createValidationCase(recommendationOne);
const feedbackOne = recordExecutiveFeedback(emptyCase, {
  recordedAt: "2026-07-17T18:00:00.000Z", response: "Accepted", rejectionReasons: [], usefulEvidenceIds: [evidence.evidenceId], insufficientEvidenceIds: [], confidencePerception: "Appropriate", additionalEvidenceRequested: ["Role Scope"], explanationClarity: 5, executiveTrust: 5, unknownHandling: "Clear", alternativeExplanationQuality: 4, baselineResearchMinutes: 60, actualResearchMinutes: 20, freeText: { text: "Useful structure", reviewStatus: "Reviewed" },
});
assert.equal(emptyCase.feedback.length, 0, "append-only operations do not mutate prior snapshots");
let caseOne = recordDecisionOutcome(feedbackOne, { status: "Offer Received", occurredAt: "2026-07-20T10:00:00.000Z", recordedAt: "2026-07-20T11:00:00.000Z", verification: "Executive Confirmed", evidenceReferences: ["executive-confirmation:1"] });
caseOne = recordValidationJudgment(caseOne, { verdict: "Supported", reviewedAt: "2026-07-20T12:00:00.000Z", reviewer: "Executive", evidenceReferences: ["review:1"], reasoning: "The recommendation accurately represented the evidence available at decision time." });

const recommendationTwo = snapshotRecommendation(assessment, "Review evidence", "2026-07-18T17:00:00.000Z");
let caseTwo = createValidationCase(recommendationTwo);
caseTwo = recordExecutiveFeedback(caseTwo, { recordedAt: "2026-07-18T18:00:00.000Z", response: "Rejected", rejectionReasons: ["Alternative more credible"], usefulEvidenceIds: [], insufficientEvidenceIds: [evidence.evidenceId], confidencePerception: "Too High", additionalEvidenceRequested: ["Employer"], explanationClarity: 4, executiveTrust: 4, unknownHandling: "Clear", alternativeExplanationQuality: 5, baselineResearchMinutes: 45, actualResearchMinutes: 30, freeText: null });
caseTwo = recordDecisionOutcome(caseTwo, { status: "Offer Accepted", occurredAt: "2026-07-25T10:00:00.000Z", recordedAt: "2026-07-25T11:00:00.000Z", verification: "Executive Confirmed", evidenceReferences: ["executive-confirmation:2"] });
caseTwo = recordValidationJudgment(caseTwo, { verdict: "Not Supported", reviewedAt: "2026-07-25T12:00:00.000Z", reviewer: "Authorized Reviewer", evidenceReferences: ["review:2"], reasoning: "The recommendation overstated what the cited evidence established." });

const report = evaluateExecutiveValidation([caseOne, caseTwo]);
assert.equal(report.version, executiveValidationPlatformVersion);
assert.equal(report.dimensions.length, 10);
assert.equal(report.dimensions.every((dimension) => dimension.state === "Measured"), true);
assert.equal(report.dimensions.find((dimension) => dimension.dimension === "Recommendation Accuracy")?.value, 50, "positive outcomes do not override reviewed recommendation validity");
assert.equal(report.dimensions.find((dimension) => dimension.dimension === "Decision Outcome")?.value["Offer Accepted"], 1);
assert.equal(report.metrics.validationCoverage, 100);
assert.equal(report.metrics.recommendationValidationRate, 100);
assert.equal(report.metrics.confidenceCalibrationCoverage, 100);
assert.equal(report.metrics.executiveFeedbackCoverage, 100);
assert.equal(report.metrics.outcomeCoverage, 100);
assert.equal(report.metrics.evidenceImprovementOpportunities, 3);
assert.equal(report.metrics.learningReadiness, "Not ready");
assert.equal(report.metrics.automatedConfidenceAdjustments, 0);
assert.equal(report.metrics.automatedModelTuning, 0);
assert.equal(report.confidenceCalibration.points.length, 2);
assert.deepEqual(report.confidenceCalibration.points.map((point) => point.observedOutcome), ["Offer Received", "Offer Accepted"]);
assert.deepEqual(report.confidenceCalibration.points.map((point) => point.validationVerdict), ["Supported", "Not Supported"]);
assert.equal(report.confidenceCalibration.calibrationDrift, null);
assert.equal(report.confidenceCalibration.confidenceReliability, "Insufficient Evidence");
assert.equal(report.confidenceCalibration.automatedAdjustment, false);

const unknownReport = evaluateExecutiveValidation([createValidationCase(recommendationOne)]);
assert.equal(unknownReport.dimensions.every((dimension) => dimension.state === "Unknown"), true);
assert.equal(unknownReport.metrics.learningReadiness, "Not ready");

assert.throws(() => recordExecutiveFeedback(emptyCase, { recordedAt: observedAt, response: "Accepted", rejectionReasons: [], usefulEvidenceIds: ["evidence:unknown"], insufficientEvidenceIds: [], confidencePerception: "Appropriate", additionalEvidenceRequested: [], explanationClarity: null, executiveTrust: null, unknownHandling: "Not Applicable", alternativeExplanationQuality: null, baselineResearchMinutes: null, actualResearchMinutes: null, freeText: null }), /must reference recommendation evidence/);
assert.throws(() => recordDecisionOutcome(emptyCase, { status: "Applied", occurredAt: observedAt, recordedAt: observedAt, verification: "Executive Confirmed", evidenceReferences: [] }), /require an evidence reference/);
assert.throws(() => recordValidationJudgment(emptyCase, { verdict: "Supported", reviewedAt: observedAt, reviewer: "Executive", evidenceReferences: [], reasoning: "" }), /require reviewed evidence/);
assert.throws(() => snapshotRecommendation({ ...assessment, recommendationEligible: false }, "Review evidence", observedAt), /all five decision gates pass/);

console.log(JSON.stringify({ message: "Executive Validation Platform checks passed.", ...report.metrics, validationDimensions: validationDimensionIds.length, positiveOutcomeTreatedAsAccuracy: false, historicalRecommendationsOverwritten: 0 }, null, 2));
