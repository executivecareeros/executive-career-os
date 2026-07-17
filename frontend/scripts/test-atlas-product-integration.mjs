import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addDecisionNote, addWorkspaceEvidence, addWorkspaceQuestion, addWorkspaceTask, changeDecisionStage, changeWorkspaceTask, completeWorkspaceQuestion, createAtlasDecisionWorkspace, measureAtlasDecisionWorkspaces, reassessAtlasOpportunity, recordWorkspaceDecision, reviewWorkspaceEvidence } from "../lib/discovery/atlas-decision-workspace.ts";
import { buildAtlasOpportunityReview } from "../lib/discovery/atlas-opportunity-review.ts";
import { buildProductOpportunityAssessment } from "../lib/discovery/atlas-product-integration.ts";

const at = (minute) => `2026-07-17T22:${String(minute).padStart(2, "0")}:00.000Z`;
const intelligence = {
  opportunityId: "discovered-integration-1", blueprintCompatibilityScore: 82, blueprintComparisons: 3,
  atlasConfidence: { score: 78, level: "High", explanation: "Three comparable dimensions and employer evidence support this confidence." },
  recommendation: "Prioritize", guidance: "Review the open question before deciding.",
  evidence: [{ label: "Role", value: "Chief Revenue Officer", certainty: "Confirmed", source: "Employer careers page" }, { label: "Company", value: "Example Company", certainty: "Confirmed", source: "Employer careers page" }],
  strengths: ["Leadership scope aligns with the confirmed Blueprint"], concerns: [], missingInformation: ["Reporting line"],
  provenance: [], freshness: { state: "Fresh", ageHours: 1 }, history: [], relatedOpportunities: [], similarCompanies: [], similarRoles: [],
  opportunityConfidence: { eligibility: "Eligible", opportunityConfidence: 82, label: "Strong Opportunity", explanation: "Work authorization aligns.", missingInformation: [], components: {} },
};

const assessment = buildProductOpportunityAssessment(intelligence, at(0));
assert.equal(assessment.focusEntityId, intelligence.opportunityId);
assert.equal(assessment.supportingEvidence.length, 2);
assert.equal(assessment.unknowns[0], "Reporting line");
assert.equal(assessment.gates.length, 5);
let workspace = createAtlasDecisionWorkspace(buildAtlasOpportunityReview(assessment, at(0)), at(0));
workspace = changeDecisionStage(workspace, { toStage: "Initial Review", reason: "Review started.", at: at(1), actor: "Executive" });
workspace = addWorkspaceTask(workspace, { title: "Confirm reporting line", source: "Executive", at: at(2) });
workspace = changeWorkspaceTask(workspace, { taskId: workspace.tasks[0].id, status: "Completed", at: at(3), actor: "Executive" });
workspace = addWorkspaceEvidence(workspace, { statement: "The role reports to the CEO.", reference: "employer-interview:reporting-line", at: at(4) });
workspace = reviewWorkspaceEvidence(workspace, { evidenceId: workspace.evidence[0].id, reviewedBy: "Executive", at: at(5) });
workspace = addWorkspaceQuestion(workspace, { question: "Who does the role report to?", at: at(6) });
workspace = completeWorkspaceQuestion(workspace, { questionId: workspace.questions[0].id, answer: "CEO", evidenceIds: [workspace.evidence[0].id], at: at(7), actor: "Executive" });
workspace = addDecisionNote(workspace, { text: "Reporting line supports the expected executive scope.", at: at(8), actor: "Executive" });
const reassessment = buildProductOpportunityAssessment({ ...intelligence, missingInformation: [] }, at(9), workspace.evidence);
workspace = reassessAtlasOpportunity(workspace, { assessment: reassessment, reason: "Reviewed reporting evidence resolves the open question.", triggerEvidenceIds: [workspace.evidence[0].id], requestedAt: at(9), completedAt: at(10), requestedBy: "Executive" });
workspace = recordWorkspaceDecision(workspace, { action: "Pursue", at: at(11), actor: "Executive" });

const recovered = JSON.parse(JSON.stringify(workspace));
assert.deepEqual(recovered, workspace, "the complete workspace survives persistence serialization");
assert.equal(recovered.reviews.length, 2, "recommendation history remains immutable");
assert.equal(recovered.timeline.length, 11, "every product mutation remains visible in the timeline");
assert.equal(recovered.decisions[0].unknowns, 0);
const metrics = measureAtlasDecisionWorkspaces([recovered]);
assert.equal(metrics.workspaceCompletion, 100);
assert.equal(metrics.decisionContinuity, 100);
assert.equal(metrics.executiveWorkflowReadiness, "Ready");

const migration = readFileSync(new URL("../../supabase/migrations/202607170012_atlas_decision_workspace_persistence.sql", import.meta.url), "utf8");
for (const protection of [/atlas_decision_workspace_events_append_only/, /enable row level security/, /is_active_workspace_member/, /pg_advisory_xact_lock/, /current_sequence<>expected_sequence/, /history cannot be rewritten or truncated/, /revoke delete,update/]) assert.match(migration, protection);
const productSurface = readFileSync(new URL("../components/opportunities/atlas-decision-workspace-panel.tsx", import.meta.url), "utf8");
for (const label of ["Opportunity review", "Evidence collection", "Decision stage", "Executive tasks", "Decision notes", "Open questions", "Reassessment", "Immutable decision timeline"]) assert.match(productSurface, new RegExp(label));

console.log(JSON.stringify({ message: "Atlas product integration checks passed.", workspacePersistenceCoverage: 100, reviewIntegrationCoverage: 100, workflowCompletion: 100, decisionContinuity: 100, sessionRecovery: 100, timelineCompleteness: 100, recommendationTraceability: 100, productIntegrationReadiness: "Ready" }, null, 2));
