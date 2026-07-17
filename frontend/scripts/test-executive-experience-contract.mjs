import assert from "node:assert/strict";
import { createExecutiveExperienceObject, evaluateExecutiveExperienceContract, executiveExperienceContractVersion, executiveExperienceObjectKinds, executiveExperienceObjectRegistry, executiveJourneyIds, executiveJourneyRegistry, validateExecutiveJourney } from "../lib/discovery/executive-experience-contract.ts";

const at = "2026-07-17T18:00:00.000Z";
const base = { statement: "Evidence-backed executive communication.", facts: [], interpretations: [], evidenceIds: [], confidence: null, unknowns: [], conflicts: [], alternatives: [], suggestedActions: [], requestedEvidence: [], decision: null, generatedAt: at };
const make = (kind, changes = {}) => createExecutiveExperienceObject({ ...base, kind, ...changes });
const evidence = make("Evidence Summary", { facts: ["The role was observed on the employer-controlled source."], evidenceIds: ["evidence:role"] });
const confidence = make("Confidence Statement", { confidence: { level: "High", score: 90, basis: "Employer-controlled evidence is current and traceable." }, evidenceIds: ["evidence:role"] });
const unknown = make("Unknown Statement", { unknowns: ["Hiring manager is Unknown."], requestedEvidence: ["Confirm the hiring manager with the employer."] });
const conflict = make("Conflict Statement", { conflicts: ["Source states remote.", "Location metadata states office-based."], evidenceIds: ["evidence:role", "evidence:location"], requestedEvidence: ["Confirm work arrangement."] });
const alternative = make("Alternative Interpretation", { alternatives: ["The role may be hybrid rather than fully remote."], evidenceIds: ["evidence:role", "evidence:location"], unknowns: ["Work arrangement remains Unknown."] });
const explanation = make("Explanation", { facts: ["The employer lists the role."], interpretations: ["The scope may align with executive leadership."], evidenceIds: ["evidence:role"], unknowns: unknown.unknowns, conflicts: conflict.conflicts, alternatives: alternative.alternatives });
const action = make("Suggested Next Action", { statement: "Verify scope before deciding.", suggestedActions: ["Ask the employer to confirm role scope."], evidenceIds: ["evidence:role"] });
const recommendation = make("Recommendation", { statement: "Review this opportunity.", evidenceIds: ["evidence:role"], confidence: confidence.confidence, unknowns: unknown.unknowns, conflicts: conflict.conflicts, alternatives: alternative.alternatives, suggestedActions: action.suggestedActions });
const investigation = make("Investigation Request", { statement: "Additional evidence is needed.", requestedEvidence: ["Confirm role scope and work arrangement."], unknowns: unknown.unknowns, conflicts: conflict.conflicts });
const decision = make("Decision Summary", { statement: "The executive chose to watch the opportunity.", decision: "Watch", evidenceIds: ["evidence:role"], confidence: confidence.confidence, unknowns: unknown.unknowns, conflicts: conflict.conflicts, suggestedActions: ["Review when scope is confirmed."] });

assert.equal(executiveExperienceContractVersion, "orion-executive-experience-v1");
assert.equal(executiveExperienceObjectRegistry.length, 10);
assert.deepEqual(executiveExperienceObjectRegistry.map((definition) => definition.kind), executiveExperienceObjectKinds);
assert.equal(executiveExperienceObjectRegistry.every((definition) => definition.purpose && definition.requiredFields.length && definition.evidenceRequirements && definition.unknownBehavior && definition.renderingIndependence), true);
assert.equal(executiveJourneyRegistry.length, 7);
assert.deepEqual(executiveJourneyRegistry.map((journey) => journey.id), executiveJourneyIds);

const passedFive = ["Decision Quality", "Explainability", "Evidence", "Confidence", "Executive Trust"].map((gate) => ({ gate, passed: true }));
const reviews = ["Opportunity Review", "Employer Review", "Compensation Review"].map((journey) => ({ journey, objects: [recommendation, explanation, evidence, confidence, unknown, conflict, alternative, action], decisionGates: passedFive }));
const interactions = [
  ...reviews,
  { journey: "Recommendation Withheld", objects: [explanation, evidence, confidence, unknown, conflict, alternative, investigation], decisionGates: passedFive.map((result) => result.gate === "Decision Quality" ? { ...result, passed: false } : result) },
  { journey: "Evidence Insufficient", objects: [evidence, make("Confidence Statement", { confidence: { level: "Unknown", score: null, basis: "Required evidence is absent." }, unknowns: unknown.unknowns }), unknown, investigation], decisionGates: ["Evidence", "Confidence", "Executive Trust"].map((gate) => ({ gate, passed: false })) },
  { journey: "Conflict Detected", objects: [evidence, confidence, unknown, conflict, alternative, investigation], decisionGates: ["Evidence", "Confidence", "Explainability", "Executive Trust"].map((gate) => ({ gate, passed: true })) },
  { journey: "Unknown Outcome", objects: [decision, confidence, unknown, conflict, action], decisionGates: ["Evidence", "Explainability", "Executive Trust"].map((gate) => ({ gate, passed: true })) },
];

const report = evaluateExecutiveExperienceContract(interactions);
assert.equal(report.metrics.experienceContractCoverage, 100);
assert.equal(report.metrics.journeyCoverage, 100);
assert.equal(report.metrics.communicationConsistency, 100);
assert.equal(report.metrics.disclosureCoverage, 100);
assert.equal(report.metrics.trustCommunicationReadiness, "Ready");
assert.equal(report.metrics.futureUxReusePotential, "High");
assert.equal(report.unsupportedRecommendations, 0);

const unsafe = { journey: "Opportunity Review", objects: [recommendation, explanation, evidence, confidence, unknown, conflict, alternative, action], decisionGates: passedFive.map((result) => result.gate === "Evidence" ? { ...result, passed: false } : result) };
assert.equal(validateExecutiveJourney(unsafe).recommendationSafe, false);
assert.throws(() => make("Recommendation", { suggestedActions: ["Proceed"] }), /requires evidence/);
assert.throws(() => make("Explanation", { facts: ["Same"], interpretations: ["Same"], evidenceIds: ["evidence:one"] }), /Facts and interpretations/);
assert.throws(() => make("Unknown Statement", { unknowns: ["Unknown"] }), /requires Unknowns and requested evidence/);
assert.throws(() => make("Conflict Statement", { conflicts: ["Only one claim"], evidenceIds: ["evidence:one"] }), /conflicting claims/);

console.log(JSON.stringify({ message: "Executive Experience Contract checks passed.", ...report.metrics, objectKinds: executiveExperienceObjectKinds.length, journeys: executiveJourneyIds.length, unsupportedRecommendations: report.unsupportedRecommendations }, null, 2));
