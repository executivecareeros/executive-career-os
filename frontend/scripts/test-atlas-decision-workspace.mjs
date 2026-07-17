import assert from "node:assert/strict";
import { addDecisionNote, addWorkspaceEvidence, addWorkspaceQuestion, addWorkspaceTask, atlasDecisionWorkspaceVersion, changeDecisionStage, changeWorkspaceTask, completeWorkspaceQuestion, createAtlasDecisionWorkspace, decisionJourneyStages, measureAtlasDecisionWorkspaces, reassessAtlasOpportunity, recordWorkspaceDecision, reviewWorkspaceEvidence, validateAtlasDecisionWorkspace, workspaceObjectKinds, workspaceObjectRegistry } from "../lib/discovery/atlas-decision-workspace.ts";
import { buildAtlasOpportunityReview } from "../lib/discovery/atlas-opportunity-review.ts";

const at = (minute) => `2026-07-17T20:${String(minute).padStart(2, "0")}:00.000Z`;
const baseEvidence = { evidenceId: "evidence:base", source: "greenhouse", observedAt: at(0), confidence: { score: 90, rating: "Very High", basis: "Employer source" } };
const gates = (passed) => ["Decision Quality", "Explainability", "Evidence", "Confidence", "Executive Trust"].map((gate) => ({ gate, passed: gate === "Decision Quality" ? passed : true, explanation: passed ? "Passed" : "Required evidence is missing." }));
const assessment = (input = {}) => ({
  version: "orion-decision-intelligence-v1", domain: "Opportunity Intelligence", focusEntityId: "opportunity:workspace", state: "Insufficient Evidence", summary: "Role scope remains insufficiently evidenced.", supportingEvidence: [baseEvidence], confidence: { level: "Low", score: 49, method: "Required evidence is incomplete." }, knownFacts: ["Opportunity: Chief Revenue Officer", "Employer: Acme"], unknowns: ["Role scope is Unknown"], alternativeInterpretations: [], reasonsFor: [], reasonsAgainst: [], context: [], suggestedNextActions: ["Verify role scope."], gates: gates(false), recommendationEligible: false, ...input,
});

const initialReview = buildAtlasOpportunityReview(assessment(), at(1));
let workspace = createAtlasDecisionWorkspace(initialReview, at(2));
const emptyWorkspace = workspace;
assert.equal(atlasDecisionWorkspaceVersion, "atlas-decision-workspace-v1");
assert.equal(decisionJourneyStages.length, 15);
assert.equal(workspaceObjectRegistry.length, 10);
assert.deepEqual(workspaceObjectRegistry.map((definition) => definition.kind), workspaceObjectKinds);
assert.equal(workspaceObjectRegistry.every((definition) => definition.purpose && definition.requiredFields.length && definition.evidenceLinkage && definition.lifecycle), true);

workspace = addWorkspaceEvidence(workspace, { statement: "The employer confirmed global reporting responsibility.", reference: "employer-confirmation:scope", at: at(3) });
const scopeEvidence = workspace.evidence[0];
workspace = reviewWorkspaceEvidence(workspace, { evidenceId: scopeEvidence.id, reviewedBy: "Authorized Reviewer", at: at(4) });
workspace = addWorkspaceTask(workspace, { title: "Verify reporting structure", source: "Atlas", evidenceIds: [scopeEvidence.id], at: at(5) });
assert.equal(workspace.tasks[0].status, "Suggested", "Atlas never performs or accepts a task automatically");
workspace = changeWorkspaceTask(workspace, { taskId: workspace.tasks[0].id, status: "Open", at: at(6), actor: "Executive" });
workspace = changeWorkspaceTask(workspace, { taskId: workspace.tasks[0].id, status: "Completed", at: at(7), actor: "Executive" });
workspace = addWorkspaceQuestion(workspace, { question: "Who does the role report to?", evidenceIds: [scopeEvidence.id], at: at(8) });
workspace = completeWorkspaceQuestion(workspace, { questionId: workspace.questions[0].id, answer: "The role reports to the CEO.", evidenceIds: [scopeEvidence.id], at: at(9), actor: "Executive" });
workspace = addDecisionNote(workspace, { text: "Reporting scope materially improves the opportunity context.", evidenceIds: [scopeEvidence.id], at: at(10), actor: "Executive" });

const newEvidence = { evidenceId: scopeEvidence.id, source: "reviewed-employer-confirmation", observedAt: at(4), confidence: { score: 90, rating: "Very High", basis: "Reviewed employer confirmation" } };
const reassessed = assessment({ state: "Decision Support Available", summary: "Reviewed evidence now supports structured opportunity review.", supportingEvidence: [baseEvidence, newEvidence], confidence: { level: "High", score: 90, method: "All required evidence is reviewed." }, unknowns: [], reasonsFor: [{ id: "scope", direction: "For", statement: "The employer confirmed global reporting responsibility.", evidenceIds: [scopeEvidence.id] }], suggestedNextActions: ["Review the evidence before deciding."], gates: gates(true), recommendationEligible: true });
workspace = reassessAtlasOpportunity(workspace, { assessment: reassessed, reason: "New reviewed role-scope evidence resolves the primary gap.", triggerEvidenceIds: [scopeEvidence.id], requestedAt: at(11), completedAt: at(12), requestedBy: "Executive" });
workspace = recordWorkspaceDecision(workspace, { action: "Pursue", at: at(12), actor: "Executive" });
assert.equal(emptyWorkspace.reviews.length, 1, "workspace operations do not mutate earlier workspace snapshots");
assert.equal(workspace.reviews.length, 2);
assert.equal(workspace.reviews[0].state, "Recommendation Withheld");
assert.equal(workspace.reviews[1].state, "Recommendation Available");
assert.equal(workspace.reassessments[0].previousUnknowns, 1);
assert.equal(workspace.reassessments[0].newUnknowns, 0);
assert.equal(workspace.decisions.length, 1);
assert.equal(workspace.decisions[0].reviewId, `${workspace.reviews[1].version}:${workspace.reviews[1].generatedAt}`);

const journey = ["Initial Review", "Evidence Collection", "Employer Research", "Recruiter Contact", "Interview Preparation", "Interview Completed", "Compensation Review", "Negotiation", "Offer Evaluation", "Decision Pending", "Accepted", "Archived"];
journey.forEach((toStage, index) => { workspace = changeDecisionStage(workspace, { toStage, reason: `Executive moved to ${toStage}.`, evidenceIds: [scopeEvidence.id], at: at(13 + index), actor: "Executive" }); });
assert.equal(workspace.currentStage, "Archived");
assert.equal(validateAtlasDecisionWorkspace(workspace).valid, true);

const metrics = measureAtlasDecisionWorkspaces([workspace]);
assert.equal(metrics.decisionJourneyCoverage, 100);
assert.equal(metrics.workspaceCompletion, 100);
assert.equal(metrics.taskTraceability, 100);
assert.equal(metrics.evidenceProgression, 100);
assert.equal(metrics.reassessmentReadiness, 100);
assert.equal(metrics.decisionContinuity, 100);
assert.equal(metrics.executiveWorkflowReadiness, "Ready");

assert.throws(() => changeDecisionStage(workspace, { toStage: "Initial Review", reason: "Invalid reopening", at: at(30), actor: "Executive" }), /Invalid decision stage transition/);
assert.throws(() => changeWorkspaceTask(workspace, { taskId: workspace.tasks[0].id, status: "Open", at: at(30), actor: "Atlas" }), /Only the executive/);
assert.throws(() => addWorkspaceEvidence(workspace, { statement: "Duplicate", reference: "employer-confirmation:scope", at: at(30) }), /already exists/);
assert.throws(() => reassessAtlasOpportunity(emptyWorkspace, { assessment: reassessed, reason: "Unsupported reassessment", triggerEvidenceIds: [scopeEvidence.id], requestedAt: at(11), completedAt: at(12), requestedBy: "Executive" }), /requires new reviewed workspace evidence/);

console.log(JSON.stringify({ message: "Atlas Decision Workspace checks passed.", ...metrics, stages: decisionJourneyStages.length, workspaceObjects: workspaceObjectKinds.length, preservedReviews: workspace.reviews.length, automaticActions: 0 }, null, 2));
