import type { DecisionAssessment, DecisionConfidenceLevel, DecisionDomainId } from "./executive-decision-intelligence.ts";

export const executiveValidationPlatformVersion = "orion-executive-validation-v1" as const;

export const validationDimensionIds = [
  "Recommendation Accuracy", "Recommendation Acceptance", "Explanation Clarity", "Evidence Helpfulness",
  "Confidence Calibration", "Decision Outcome", "Research Time Reduction", "Executive Trust",
  "Unknown Handling", "Alternative Explanation Quality",
] as const;
export type ValidationDimensionId = (typeof validationDimensionIds)[number];

export type ValidationDimensionDefinition = {
  id: ValidationDimensionId;
  purpose: string;
  evidenceRequired: readonly string[];
  measurementMethod: string;
  unknownConditions: readonly string[];
  successCriteria: string;
};

export const validationDimensionRegistry: readonly ValidationDimensionDefinition[] = [
  { id: "Recommendation Accuracy", purpose: "Determine whether reviewed recommendations were supported by the evidence available at decision time.", evidenceRequired: ["Immutable recommendation", "Reviewed validation judgment", "Judgment evidence"], measurementMethod: "Reviewed Supported judgments divided by Supported plus Not Supported judgments; Inconclusive is disclosed separately.", unknownConditions: ["No reviewed judgment", "Judgment lacks evidence"], successCriteria: "A baseline is valid after at least 20 reviewed judgments; no target is claimed before a production baseline." },
  { id: "Recommendation Acceptance", purpose: "Measure whether executives choose to use the recommendation in their decision process.", evidenceRequired: ["Structured executive response"], measurementMethod: "Accepted responses divided by Accepted plus Rejected responses; Deferred is disclosed separately.", unknownConditions: ["No executive response", "Only unreviewed free text exists"], successCriteria: "A baseline is valid after at least 20 structured responses; acceptance is not treated as accuracy." },
  { id: "Explanation Clarity", purpose: "Measure whether executives understand why Atlas reached its assessment.", evidenceRequired: ["Structured 1–5 clarity rating"], measurementMethod: "Mean structured clarity rating with response count.", unknownConditions: ["No clarity rating"], successCriteria: "Mean at least 4.0/5 with at least 20 responses." },
  { id: "Evidence Helpfulness", purpose: "Measure whether cited evidence helps the executive evaluate the recommendation.", evidenceRequired: ["Useful evidence IDs", "Insufficient evidence IDs"], measurementMethod: "Useful evidence selections divided by all useful plus insufficient selections.", unknownConditions: ["No evidence evaluated"], successCriteria: "At least 80% helpful with at least 20 evaluated evidence selections." },
  { id: "Confidence Calibration", purpose: "Test whether stated confidence aligns with reviewed recommendation validity without equating outcome with correctness.", evidenceRequired: ["Predicted confidence", "Reviewed validation judgment", "Observed outcome where available"], measurementMethod: "Mean absolute difference between numeric confidence and reviewed Supported/Not Supported result; outcomes remain contextual and Inconclusive is excluded.", unknownConditions: ["Confidence Unknown", "No reviewed binary judgment"], successCriteria: "Calibration error at or below 0.15 across at least 50 reviewed binary judgments." },
  { id: "Decision Outcome", purpose: "Describe what happened after a decision without attributing causality to Orion.", evidenceRequired: ["Verified structured outcome"], measurementMethod: "Count and distribution by outcome status; no success score is inferred.", unknownConditions: ["Outcome Unknown", "Outcome unverified"], successCriteria: "At least 80% outcome follow-up coverage for decisions old enough to observe; no correctness claim follows from outcome alone." },
  { id: "Research Time Reduction", purpose: "Measure whether Orion reduces executive research effort.", evidenceRequired: ["Structured baseline minutes", "Structured actual minutes"], measurementMethod: "Baseline minutes minus actual minutes, reported with sample count and median when sufficient.", unknownConditions: ["Either time value absent", "Negative or implausible values rejected"], successCriteria: "Positive median reduction across at least 20 comparable decisions." },
  { id: "Executive Trust", purpose: "Measure whether transparent recommendations increase confidence in using Orion.", evidenceRequired: ["Structured 1–5 trust rating"], measurementMethod: "Mean structured trust rating with response count.", unknownConditions: ["No trust rating"], successCriteria: "Mean at least 4.0/5 with at least 20 responses." },
  { id: "Unknown Handling", purpose: "Measure whether uncertainty is visible and useful rather than concealed.", evidenceRequired: ["Structured Unknown-handling response"], measurementMethod: "Clear responses divided by Clear plus Unclear responses; Not Applicable is disclosed separately.", unknownConditions: ["No response", "No Unknown was presented"], successCriteria: "At least 90% Clear across at least 20 applicable responses." },
  { id: "Alternative Explanation Quality", purpose: "Measure whether alternatives help executives challenge the primary interpretation.", evidenceRequired: ["Structured 1–5 alternative-quality rating"], measurementMethod: "Mean structured quality rating with response count.", unknownConditions: ["No alternative shown", "No rating"], successCriteria: "Mean at least 4.0/5 with at least 20 responses where alternatives were shown." },
] as const;

export const decisionOutcomeStatuses = ["Applied", "Declined", "Interviewed", "Offer Received", "Offer Accepted", "Opportunity Withdrawn", "Outcome Unknown"] as const;
export type DecisionOutcomeStatus = (typeof decisionOutcomeStatuses)[number];

export type RecommendationSnapshot = {
  id: string;
  version: typeof executiveValidationPlatformVersion;
  decisionVersion: string;
  domain: DecisionDomainId;
  focusEntityId: string | null;
  generatedAt: string;
  recommendation: "Review evidence" | "Do not recommend";
  confidence: { level: DecisionConfidenceLevel; score: number | null; method: string };
  evidenceIds: readonly string[];
  unknowns: readonly string[];
  reasonsFor: readonly string[];
  reasonsAgainst: readonly string[];
  alternativeInterpretations: readonly string[];
};

export type ExecutiveFeedback = {
  id: string;
  recommendationId: string;
  recordedAt: string;
  response: "Accepted" | "Rejected" | "Deferred";
  rejectionReasons: readonly ("Evidence insufficient" | "Context incorrect" | "Confidence inappropriate" | "Alternative more credible" | "Recommendation not actionable" | "Other reviewed reason")[];
  usefulEvidenceIds: readonly string[];
  insufficientEvidenceIds: readonly string[];
  confidencePerception: "Too High" | "Appropriate" | "Too Low" | "Unable to Judge";
  additionalEvidenceRequested: readonly ("Employer" | "Compensation" | "Role Scope" | "Location or Eligibility" | "Market" | "Executive Fit" | "Other Reviewed Request")[];
  explanationClarity: 1 | 2 | 3 | 4 | 5 | null;
  executiveTrust: 1 | 2 | 3 | 4 | 5 | null;
  unknownHandling: "Clear" | "Unclear" | "Not Applicable";
  alternativeExplanationQuality: 1 | 2 | 3 | 4 | 5 | null;
  baselineResearchMinutes: number | null;
  actualResearchMinutes: number | null;
  freeText: { text: string; reviewStatus: "Pending Review" | "Reviewed" } | null;
};

export type DecisionOutcome = {
  id: string;
  recommendationId: string;
  status: DecisionOutcomeStatus;
  occurredAt: string;
  recordedAt: string;
  verification: "Executive Confirmed" | "System Observed" | "Unverified";
  evidenceReferences: readonly string[];
};

export type RecommendationValidationJudgment = {
  id: string;
  recommendationId: string;
  verdict: "Supported" | "Not Supported" | "Inconclusive";
  reviewedAt: string;
  reviewer: "Executive" | "Authorized Reviewer";
  evidenceReferences: readonly string[];
  reasoning: string;
};

export type ExecutiveValidationCase = {
  recommendation: RecommendationSnapshot;
  feedback: readonly ExecutiveFeedback[];
  outcomes: readonly DecisionOutcome[];
  judgments: readonly RecommendationValidationJudgment[];
};

const hash = (value: string) => {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return (result >>> 0).toString(36);
};
const id = (prefix: string, value: string) => `${prefix}:${hash(value)}`;
const unique = <T>(values: readonly T[]) => [...new Set(values)];
const mean = (values: readonly number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100 : null;
const percentage = (part: number, total: number) => total ? Math.round(part / total * 1000) / 10 : null;
const assertDate = (value: string, field: string) => { if (Number.isNaN(Date.parse(value))) throw new Error(`${field} must be a valid timestamp`); };
const assertMinutes = (value: number | null, field: string) => { if (value !== null && (!Number.isFinite(value) || value < 0 || value > 10080)) throw new Error(`${field} must be between 0 and 10080 minutes`); };

export function snapshotRecommendation(assessment: DecisionAssessment, recommendation: RecommendationSnapshot["recommendation"], generatedAt: string): RecommendationSnapshot {
  assertDate(generatedAt, "generatedAt");
  if (recommendation === "Review evidence" && (!assessment.recommendationEligible || !assessment.gates.every((gate) => gate.passed))) throw new Error("A recommendation cannot be snapshotted unless all five decision gates pass");
  const evidenceIds = unique(assessment.supportingEvidence.map((evidence) => evidence.evidenceId));
  return {
    id: id("recommendation", `${assessment.domain}|${assessment.focusEntityId}|${generatedAt}|${recommendation}`),
    version: executiveValidationPlatformVersion,
    decisionVersion: assessment.version,
    domain: assessment.domain,
    focusEntityId: assessment.focusEntityId,
    generatedAt,
    recommendation,
    confidence: assessment.confidence,
    evidenceIds,
    unknowns: [...assessment.unknowns],
    reasonsFor: assessment.reasonsFor.map((reason) => reason.statement),
    reasonsAgainst: assessment.reasonsAgainst.map((reason) => reason.statement),
    alternativeInterpretations: [...assessment.alternativeInterpretations],
  };
}

export function createValidationCase(recommendation: RecommendationSnapshot): ExecutiveValidationCase {
  return { recommendation, feedback: [], outcomes: [], judgments: [] };
}

export function recordExecutiveFeedback(validationCase: ExecutiveValidationCase, input: Omit<ExecutiveFeedback, "id" | "recommendationId">): ExecutiveValidationCase {
  assertDate(input.recordedAt, "recordedAt");
  assertMinutes(input.baselineResearchMinutes, "baselineResearchMinutes");
  assertMinutes(input.actualResearchMinutes, "actualResearchMinutes");
  const citedEvidence = [...input.usefulEvidenceIds, ...input.insufficientEvidenceIds];
  if (citedEvidence.some((evidenceId) => !validationCase.recommendation.evidenceIds.includes(evidenceId))) throw new Error("Feedback evidence must reference recommendation evidence");
  if (input.response !== "Rejected" && input.rejectionReasons.length) throw new Error("Rejection reasons require a Rejected response");
  const feedback: ExecutiveFeedback = { ...input, id: id("feedback", `${validationCase.recommendation.id}|${input.recordedAt}|${validationCase.feedback.length}`), recommendationId: validationCase.recommendation.id };
  return { ...validationCase, feedback: [...validationCase.feedback, feedback] };
}

export function recordDecisionOutcome(validationCase: ExecutiveValidationCase, input: Omit<DecisionOutcome, "id" | "recommendationId">): ExecutiveValidationCase {
  assertDate(input.occurredAt, "occurredAt");
  assertDate(input.recordedAt, "recordedAt");
  if (input.verification !== "Unverified" && !input.evidenceReferences.length) throw new Error("Verified outcomes require an evidence reference");
  const outcome: DecisionOutcome = { ...input, id: id("outcome", `${validationCase.recommendation.id}|${input.status}|${input.occurredAt}`), recommendationId: validationCase.recommendation.id };
  return { ...validationCase, outcomes: [...validationCase.outcomes, outcome] };
}

export function recordValidationJudgment(validationCase: ExecutiveValidationCase, input: Omit<RecommendationValidationJudgment, "id" | "recommendationId">): ExecutiveValidationCase {
  assertDate(input.reviewedAt, "reviewedAt");
  if (!input.evidenceReferences.length || !input.reasoning.trim()) throw new Error("Validation judgments require reviewed evidence and reasoning");
  const judgment: RecommendationValidationJudgment = { ...input, id: id("judgment", `${validationCase.recommendation.id}|${input.reviewedAt}|${input.verdict}`), recommendationId: validationCase.recommendation.id };
  return { ...validationCase, judgments: [...validationCase.judgments, judgment] };
}

export type DimensionMeasurement = {
  dimension: ValidationDimensionId;
  state: "Measured" | "Unknown";
  value: number | Readonly<Record<string, number>> | null;
  unit: "percent" | "rating-1-5" | "minutes" | "calibration-error" | "distribution";
  denominator: number;
  explanation: string;
};

export type ConfidenceCalibrationPoint = {
  recommendationId: string;
  predictedConfidence: number;
  observedOutcome: DecisionOutcomeStatus;
  validationVerdict: "Supported" | "Not Supported";
  absoluteError: number;
};

export function buildConfidenceCalibrationReport(cases: readonly ExecutiveValidationCase[]) {
  const points: ConfidenceCalibrationPoint[] = cases.flatMap((item) => {
    const predictedConfidence = item.recommendation.confidence.score;
    if (predictedConfidence === null) return [];
    const observedOutcome = [...item.outcomes].reverse().find((outcome) => outcome.verification !== "Unverified")?.status ?? "Outcome Unknown";
    return item.judgments.flatMap((judgment) => judgment.verdict === "Inconclusive" ? [] : [{ recommendationId: item.recommendation.id, predictedConfidence, observedOutcome, validationVerdict: judgment.verdict, absoluteError: Math.round(Math.abs(predictedConfidence / 100 - (judgment.verdict === "Supported" ? 1 : 0)) * 1000) / 1000 }]);
  });
  const meanError = mean(points.map((point) => point.absoluteError));
  const midpoint = Math.floor(points.length / 2);
  const previousError = points.length >= 4 ? mean(points.slice(0, midpoint).map((point) => point.absoluteError)) : null;
  const currentError = points.length >= 4 ? mean(points.slice(midpoint).map((point) => point.absoluteError)) : null;
  const calibrationDrift = previousError === null || currentError === null ? null : Math.round((currentError - previousError) * 1000) / 1000;
  const confidenceReliability = points.length < 20 ? "Insufficient Evidence" : (meanError ?? 1) <= 0.15 ? "Reliable" : "Needs Review";
  return { points, meanAbsoluteError: meanError, calibrationDrift, confidenceReliability, automatedAdjustment: false as const };
}

export function evaluateExecutiveValidation(cases: readonly ExecutiveValidationCase[]) {
  const feedback = cases.flatMap((item) => item.feedback);
  const outcomes = cases.flatMap((item) => item.outcomes).filter((outcome) => outcome.verification !== "Unverified");
  const judgments = cases.flatMap((item) => item.judgments);
  const binaryJudgments = judgments.filter((judgment) => judgment.verdict !== "Inconclusive");
  const responses = feedback.filter((item) => item.response !== "Deferred");
  const evidenceSelections = feedback.flatMap((item) => [...item.usefulEvidenceIds.map(() => "useful"), ...item.insufficientEvidenceIds.map(() => "insufficient")]);
  const clarity = feedback.flatMap((item) => item.explanationClarity === null ? [] : [item.explanationClarity]);
  const trust = feedback.flatMap((item) => item.executiveTrust === null ? [] : [item.executiveTrust]);
  const unknownHandling = feedback.filter((item) => item.unknownHandling !== "Not Applicable");
  const alternatives = feedback.flatMap((item) => item.alternativeExplanationQuality === null ? [] : [item.alternativeExplanationQuality]);
  const timeReductions = feedback.flatMap((item) => item.baselineResearchMinutes === null || item.actualResearchMinutes === null ? [] : [item.baselineResearchMinutes - item.actualResearchMinutes]);
  const confidenceCalibration = buildConfidenceCalibrationReport(cases);
  const distribution = Object.fromEntries(decisionOutcomeStatuses.map((status) => [status, outcomes.filter((outcome) => outcome.status === status).length]));
  const measured = (dimension: ValidationDimensionId, value: DimensionMeasurement["value"], unit: DimensionMeasurement["unit"], denominator: number, explanation: string): DimensionMeasurement => ({ dimension, state: denominator ? "Measured" : "Unknown", value: denominator ? value : null, unit, denominator, explanation: denominator ? explanation : `${dimension} remains Unknown because required evidence is absent.` });
  const dimensions: DimensionMeasurement[] = [
    measured("Recommendation Accuracy", percentage(binaryJudgments.filter((item) => item.verdict === "Supported").length, binaryJudgments.length), "percent", binaryJudgments.length, "Reviewed evidence judgments only; outcomes are not treated as correctness."),
    measured("Recommendation Acceptance", percentage(responses.filter((item) => item.response === "Accepted").length, responses.length), "percent", responses.length, "Deferred responses are excluded; acceptance is not accuracy."),
    measured("Explanation Clarity", mean(clarity), "rating-1-5", clarity.length, "Mean structured executive rating."),
    measured("Evidence Helpfulness", percentage(evidenceSelections.filter((item) => item === "useful").length, evidenceSelections.length), "percent", evidenceSelections.length, "Structured evidence selections only."),
    measured("Confidence Calibration", confidenceCalibration.meanAbsoluteError, "calibration-error", confidenceCalibration.points.length, "Mean absolute calibration error against reviewed validity; observed outcomes remain contextual."),
    measured("Decision Outcome", distribution, "distribution", outcomes.length, "Verified outcome distribution without causal attribution."),
    measured("Research Time Reduction", mean(timeReductions), "minutes", timeReductions.length, "Mean self-reported or observed reduction; baseline and actual values required."),
    measured("Executive Trust", mean(trust), "rating-1-5", trust.length, "Mean structured executive rating."),
    measured("Unknown Handling", percentage(unknownHandling.filter((item) => item.unknownHandling === "Clear").length, unknownHandling.length), "percent", unknownHandling.length, "Applicable structured responses only."),
    measured("Alternative Explanation Quality", mean(alternatives), "rating-1-5", alternatives.length, "Mean structured rating where alternatives were shown."),
  ];
  const reviewedFeedback = feedback.filter((item) => !item.freeText || item.freeText.reviewStatus === "Reviewed");
  const evidenceImprovementOpportunities = feedback.reduce((count, item) => count + item.insufficientEvidenceIds.length + item.additionalEvidenceRequested.length, 0);
  const validationCoverage = percentage(dimensions.filter((dimension) => dimension.state === "Measured").length, validationDimensionIds.length) ?? 0;
  const metrics = {
    validationCoverage,
    recommendationValidationRate: percentage(cases.filter((item) => item.judgments.length).length, cases.length) ?? 0,
    confidenceCalibrationCoverage: percentage(cases.filter((item) => item.recommendation.confidence.score !== null && item.judgments.some((judgment) => judgment.verdict !== "Inconclusive")).length, cases.length) ?? 0,
    executiveFeedbackCoverage: percentage(cases.filter((item) => item.feedback.length).length, cases.length) ?? 0,
    outcomeCoverage: percentage(cases.filter((item) => item.outcomes.some((outcome) => outcome.verification !== "Unverified")).length, cases.length) ?? 0,
    evidenceImprovementOpportunities,
    learningReadiness: validationCoverage === 100 && reviewedFeedback.length === feedback.length && binaryJudgments.length >= 20 && feedback.length >= 20 ? "Ready for reviewed evidence analysis" : "Not ready",
    unreviewedFreeTextExcluded: feedback.length - reviewedFeedback.length,
    automatedConfidenceAdjustments: 0,
    automatedModelTuning: 0,
  } as const;
  return { version: executiveValidationPlatformVersion, dimensions, confidenceCalibration, metrics };
}
