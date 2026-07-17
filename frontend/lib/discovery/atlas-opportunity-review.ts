import type { DecisionAssessment } from "./executive-decision-intelligence.ts";
import { adviseExecutiveDecision } from "./executive-decision-intelligence.ts";
import type { ExecutiveExperienceObject, ExecutiveJourneyInteraction, ExperienceConfidence } from "./executive-experience-contract.ts";
import { createExecutiveExperienceObject, executiveExperienceContractVersion, validateExecutiveJourney } from "./executive-experience-contract.ts";

export const atlasOpportunityReviewVersion = "atlas-opportunity-review-v1" as const;

export const atlasOpportunityReviewSectionIds = [
  "Executive Summary", "Recommendation", "Opportunity Overview", "Employer Overview", "Evidence Summary", "Confidence Statement",
  "Known Unknowns", "Conflicting Evidence", "Reasons to Pursue", "Reasons for Caution", "Suggested Next Investigations", "Decision Summary",
] as const;
export type AtlasOpportunityReviewSectionId = (typeof atlasOpportunityReviewSectionIds)[number];

export type AtlasOpportunityReviewSection = {
  id: AtlasOpportunityReviewSectionId;
  purpose: string;
  objectIds: readonly string[];
};

export type AtlasOpportunityReview = {
  version: typeof atlasOpportunityReviewVersion;
  decisionVersion: DecisionAssessment["version"];
  experienceVersion: typeof executiveExperienceContractVersion;
  opportunityId: string;
  generatedAt: string;
  state: "Recommendation Available" | "Recommendation Withheld";
  estimatedReadingMinutes: number;
  sections: readonly AtlasOpportunityReviewSection[];
  objects: readonly ExecutiveExperienceObject[];
  decisionGates: DecisionAssessment["gates"];
  sourceEvidenceIds: readonly string[];
  actualUnknownCount: number;
  actualConflictCount: number;
};

const unique = <T>(values: readonly T[]) => [...new Set(values)];
const conflictMarker = /conflict/i;
const mapConfidence = (assessment: DecisionAssessment): ExperienceConfidence => ({
  level: assessment.confidence.level === "Very High" || assessment.confidence.level === "High" ? "High" : assessment.confidence.level === "Moderate" ? "Medium" : assessment.confidence.level,
  score: assessment.confidence.score,
  basis: assessment.confidence.method,
});
const readingMinutes = (objects: readonly ExecutiveExperienceObject[]) => {
  const words = objects.flatMap((object) => [object.statement, ...object.facts, ...object.interpretations, ...object.unknowns, ...object.conflicts, ...object.alternatives, ...object.suggestedActions, ...object.requestedEvidence]).join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
};

export function buildAtlasOpportunityReview(assessment: DecisionAssessment, generatedAt: string): AtlasOpportunityReview {
  if (assessment.domain !== "Opportunity Intelligence") throw new Error("Atlas Opportunity Review requires an Opportunity Intelligence assessment");
  if (!assessment.focusEntityId) throw new Error("Atlas Opportunity Review requires a canonical opportunity focus");
  if (Number.isNaN(Date.parse(generatedAt))) throw new Error("generatedAt must be a valid timestamp");
  const advice = adviseExecutiveDecision(assessment);
  const evidenceIds = unique(assessment.supportingEvidence.map((evidence) => evidence.evidenceId));
  const allGatesPass = assessment.gates.length === 5 && assessment.gates.every((gate) => gate.passed);
  const recommendationEligible = assessment.recommendationEligible && allGatesPass;
  const actualConflicts = assessment.unknowns.filter((unknown) => conflictMarker.test(unknown));
  const actualUnknowns = assessment.unknowns.filter((unknown) => !conflictMarker.test(unknown));
  const confidence = mapConfidence(assessment);
  const facts = assessment.knownFacts.length ? assessment.knownFacts : ["No supported opportunity fact is available in the current assessment."];
  const interpretations = unique([assessment.summary, ...assessment.context.map((signal) => signal.statement)]);
  const disclosedUnknowns = actualUnknowns.length ? actualUnknowns : ["No material Unknown was identified in the current assessment."];
  const disclosedConflicts = actualConflicts.length ? actualConflicts : ["No unresolved conflict was identified in the current assessment."];
  const disclosedAlternatives = assessment.alternativeInterpretations.length ? assessment.alternativeInterpretations : ["No evidence-backed alternative interpretation was identified."];
  const requestedEvidence = actualUnknowns.length || actualConflicts.length ? assessment.suggestedNextActions : ["Recheck source evidence if the opportunity materially changes."];
  const make = (kind: ExecutiveExperienceObject["kind"], statement: string, change: Partial<Omit<ExecutiveExperienceObject, "id" | "version" | "kind" | "statement" | "generatedAt">> = {}) => createExecutiveExperienceObject({
    kind, statement, generatedAt, facts: [], interpretations: [], evidenceIds: [], confidence: null, unknowns: [], conflicts: [], alternatives: [], suggestedActions: [], requestedEvidence: [], decision: null, ...change,
  });

  const evidence = make("Evidence Summary", `${evidenceIds.length} traceable evidence record(s) support this review.`, { facts, evidenceIds, unknowns: actualUnknowns, conflicts: actualConflicts });
  const confidenceObject = make("Confidence Statement", confidence.basis, { confidence, evidenceIds, unknowns: actualUnknowns, conflicts: actualConflicts });
  const unknown = make("Unknown Statement", actualUnknowns.length ? "Material information remains Unknown." : "No material Unknown was identified in the current assessment.", { unknowns: disclosedUnknowns, requestedEvidence });
  const conflict = make("Conflict Statement", actualConflicts.length ? "Unresolved conflicting evidence requires review." : "No unresolved conflict was identified in the current assessment.", { conflicts: disclosedConflicts, evidenceIds });
  const alternative = make("Alternative Interpretation", assessment.alternativeInterpretations.length ? "Evidence supports an alternative interpretation." : "No evidence-backed alternative interpretation was identified.", { alternatives: disclosedAlternatives, evidenceIds, unknowns: actualUnknowns, conflicts: actualConflicts });
  const explanation = make("Explanation", assessment.summary, { facts, interpretations, evidenceIds, unknowns: actualUnknowns, conflicts: actualConflicts, alternatives: assessment.alternativeInterpretations });
  const pursue = make("Explanation", assessment.reasonsFor.length ? "Evidence-backed reasons to pursue further review are available." : "No evidence-backed reason to pursue was supplied by this assessment.", { facts, interpretations: assessment.reasonsFor.length ? assessment.reasonsFor.map((signal) => signal.statement) : ["The current assessment supplies no affirmative decision signal."], evidenceIds });
  const caution = make("Explanation", assessment.reasonsAgainst.length ? "Evidence-backed reasons for caution are available." : "No evidence-backed reason for caution was supplied by this assessment.", { facts, interpretations: assessment.reasonsAgainst.length ? assessment.reasonsAgainst.map((signal) => signal.statement) : ["The current assessment supplies no cautionary decision signal."], evidenceIds });
  const nextAction = make("Suggested Next Action", recommendationEligible ? "Review the evidence before taking an executive decision." : "Collect the missing evidence before requesting a recommendation.", { suggestedActions: assessment.suggestedNextActions, evidenceIds, requestedEvidence });
  const investigation = make("Investigation Request", recommendationEligible ? "Verify the remaining decision context." : "Recommendation is withheld until the required evidence is reviewed.", { requestedEvidence, unknowns: actualUnknowns, conflicts: actualConflicts });
  const decision = make("Decision Summary", "No executive decision has been recorded for this review.", { decision: "Not yet recorded", evidenceIds, confidence, unknowns: actualUnknowns, conflicts: actualConflicts, suggestedActions: assessment.suggestedNextActions, alternatives: assessment.alternativeInterpretations });
  const recommendation = recommendationEligible ? make("Recommendation", advice.summary, { evidenceIds, confidence, unknowns: actualUnknowns, conflicts: actualConflicts, alternatives: assessment.alternativeInterpretations, suggestedActions: assessment.suggestedNextActions }) : make("Explanation", "Recommendation Withheld", { facts, interpretations: [assessment.summary], evidenceIds, unknowns: actualUnknowns, conflicts: actualConflicts, alternatives: assessment.alternativeInterpretations });

  const objects = [explanation, recommendation, evidence, confidenceObject, unknown, conflict, alternative, pursue, caution, nextAction, investigation, decision];
  const sections: AtlasOpportunityReviewSection[] = [
    { id: "Executive Summary", purpose: "State the decision context in concise executive language.", objectIds: [explanation.id] },
    { id: "Recommendation", purpose: "Present a gated recommendation or explicitly withhold it.", objectIds: [recommendation.id] },
    { id: "Opportunity Overview", purpose: "Show observed opportunity facts separately from interpretation.", objectIds: [explanation.id, evidence.id] },
    { id: "Employer Overview", purpose: "Show employer facts available within the opportunity assessment.", objectIds: [explanation.id, evidence.id] },
    { id: "Evidence Summary", purpose: "Expose traceable evidence used by the review.", objectIds: [evidence.id] },
    { id: "Confidence Statement", purpose: "Explain the strength and limits of the evidence.", objectIds: [confidenceObject.id] },
    { id: "Known Unknowns", purpose: "Keep material evidence gaps visible.", objectIds: [unknown.id] },
    { id: "Conflicting Evidence", purpose: "Expose unresolved conflicts without choosing silently.", objectIds: [conflict.id] },
    { id: "Reasons to Pursue", purpose: "Present only evidence-backed affirmative signals.", objectIds: [pursue.id] },
    { id: "Reasons for Caution", purpose: "Present only evidence-backed cautionary signals.", objectIds: [caution.id] },
    { id: "Suggested Next Investigations", purpose: "Identify the minimum justified next evidence or action.", objectIds: recommendationEligible ? [nextAction.id, investigation.id] : [investigation.id] },
    { id: "Decision Summary", purpose: "Preserve the evidence and uncertainty visible when the executive decides.", objectIds: [decision.id] },
  ];
  const estimatedReadingMinutes = readingMinutes(objects);
  return { version: atlasOpportunityReviewVersion, decisionVersion: assessment.version, experienceVersion: executiveExperienceContractVersion, opportunityId: assessment.focusEntityId, generatedAt, state: recommendationEligible ? "Recommendation Available" : "Recommendation Withheld", estimatedReadingMinutes, sections, objects, decisionGates: assessment.gates, sourceEvidenceIds: evidenceIds, actualUnknownCount: actualUnknowns.length, actualConflictCount: actualConflicts.length };
}

export function validateAtlasOpportunityReview(review: AtlasOpportunityReview) {
  const objectIds = new Set(review.objects.map((object) => object.id));
  const sectionCoverage = atlasOpportunityReviewSectionIds.every((id) => review.sections.some((section) => section.id === id && section.purpose && section.objectIds.length && section.objectIds.every((objectId) => objectIds.has(objectId))));
  const evidenceTraceable = review.sourceEvidenceIds.length > 0 && review.objects.filter((object) => object.evidenceIds.length).every((object) => object.evidenceIds.every((evidenceId) => review.sourceEvidenceIds.includes(evidenceId)));
  const recommendationObjects = review.objects.filter((object) => object.kind === "Recommendation");
  const allGatesPass = review.decisionGates.length === 5 && review.decisionGates.every((gate) => gate.passed);
  const recommendationSafe = review.state === "Recommendation Available" ? recommendationObjects.length === 1 && allGatesPass : recommendationObjects.length === 0 && !allGatesPass;
  const experienceInteraction: ExecutiveJourneyInteraction = { journey: review.state === "Recommendation Available" ? "Opportunity Review" : "Recommendation Withheld", objects: review.objects, decisionGates: review.decisionGates };
  const experience = validateExecutiveJourney(experienceInteraction);
  const readable = review.estimatedReadingMinutes <= 5;
  return { valid: sectionCoverage && evidenceTraceable && recommendationSafe && experience.valid && readable, sectionCoverage, evidenceTraceable, recommendationSafe, experience, readable };
}

export function measureAtlasOpportunityReviews(reviews: readonly AtlasOpportunityReview[]) {
  const results = reviews.map(validateAtlasOpportunityReview);
  const percentage = (part: number, total: number) => total ? Math.round(part / total * 1000) / 10 : 0;
  const conflictCases = reviews.filter((review) => review.actualConflictCount > 0);
  return {
    opportunityReviewCompletion: percentage(results.filter((result) => result.valid).length, reviews.length),
    evidenceVisibility: percentage(results.filter((result) => result.evidenceTraceable).length, reviews.length),
    recommendationEligibility: percentage(reviews.filter((review) => review.state === "Recommendation Available").length, reviews.length),
    recommendationWithheldRate: percentage(reviews.filter((review) => review.state === "Recommendation Withheld").length, reviews.length),
    averageUnknownCount: reviews.length ? Math.round(reviews.reduce((sum, review) => sum + review.actualUnknownCount, 0) / reviews.length * 10) / 10 : 0,
    conflictVisibility: percentage(conflictCases.filter((review) => validateAtlasOpportunityReview(review).experience.missingDisclosures.includes("Conflicts") === false).length, conflictCases.length || 1),
    executiveReadingEfficiency: { averageMinutes: reviews.length ? Math.round(reviews.reduce((sum, review) => sum + review.estimatedReadingMinutes, 0) / reviews.length * 10) / 10 : 0, withinFiveMinutes: percentage(results.filter((result) => result.readable).length, reviews.length) },
    futurePersonalizationReadiness: reviews.every((review) => review.opportunityId && review.decisionVersion && review.experienceVersion) ? "Ready" : "Not Ready",
  };
}
