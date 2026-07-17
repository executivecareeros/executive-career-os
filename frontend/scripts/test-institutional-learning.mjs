import assert from "node:assert/strict";
import { approveLearning, buildLearningReusePlan, closeLearningRecord, createInstitutionalLearningLedger, createLearningDraft, evaluateInstitutionalLearning, getCurrentLearningRecords, institutionalKnowledgeDomains, institutionalLearningVersion, learningLifecycleStatuses, submitLearningForReview } from "../lib/discovery/institutional-learning.ts";

const reviewedEvidence = (evidenceId) => ({ evidenceId, sourceType: "Reviewed Feedback", provenance: `validation-case:${evidenceId}`, reviewStatus: "Reviewed", reviewedBy: "Authorized Reviewer", reviewedAt: "2026-07-17T10:00:00.000Z" });
const base = { domain: "Recurring Evidence Gaps", observation: "Role-scope evidence was repeatedly requested in reviewed validation cases.", supportingEvidence: [reviewedEvidence("scope-1")], documentedReasoning: "Two reviewed cases identified missing role scope; this is a process input, not an employer or executive fact.", scope: "Opportunity Intelligence evidence review", confidence: "Medium", reuseTargets: ["Evidence Requirements", "Review Playbooks"], createdAt: "2026-07-17T11:00:00.000Z", recordedBy: "Validation Owner", reviewDueAt: "2026-10-17T00:00:00.000Z", expiresAt: null, supersedesLearningId: null };

let ledger = createInstitutionalLearningLedger();
assert.equal(ledger.version, institutionalLearningVersion);
assert.equal(institutionalKnowledgeDomains.length, 10);
assert.deepEqual(learningLifecycleStatuses, ["Draft", "Under Review", "Approved", "Superseded", "Retired", "Archived"]);

ledger = createLearningDraft(ledger, base);
const learningId = ledger.revisions[0].learningId;
const draft = ledger.revisions[0];
ledger = submitLearningForReview(ledger, learningId, { reviewer: "Governance Reviewer", reviewedAt: "2026-07-17T12:00:00.000Z", reasoning: "Evidence provenance and scope were reviewed." });
ledger = approveLearning(ledger, learningId, { approver: "Governance Owner", approvedAt: "2026-07-17T13:00:00.000Z", reasoning: "Approved for bounded reuse in evidence requirements and review playbooks." });

assert.equal(draft.status, "Draft", "historical revisions remain immutable");
assert.deepEqual(ledger.revisions.map((revision) => revision.status), ["Draft", "Under Review", "Approved"]);
assert.equal(getCurrentLearningRecords(ledger)[0].approvalHistory.length, 1);
const report = evaluateInstitutionalLearning(ledger, "2026-07-18T00:00:00.000Z");
assert.equal(report.metrics.institutionalLearningCoverage, 10);
assert.equal(report.metrics.approvedLearningRecords, 1);
assert.equal(report.metrics.evidenceGapReductionOpportunities, 1);
assert.equal(report.metrics.governanceCoverage, 100);
assert.equal(report.metrics.reviewCompleteness, 100);
assert.equal(report.metrics.knowledgeReusePotential, 100);
assert.equal(report.reuse.targets["Evidence Requirements"].length, 1);
assert.equal(report.reuse.historicalRecommendationsModified, 0);
assert.equal(report.reuse.automaticModelUpdates, 0);
assert.equal(report.automaticLearning, false);
assert.equal(report.silentUpdates, false);

const beforeClose = ledger;
ledger = closeLearningRecord(ledger, learningId, { action: "Superseded", approver: "Governance Owner", approvedAt: "2026-08-01T00:00:00.000Z", reasoning: "A later reviewed pattern replaces this bounded finding." });
ledger = closeLearningRecord(ledger, learningId, { action: "Archived", approver: "Governance Owner", approvedAt: "2026-08-02T00:00:00.000Z", reasoning: "Preserved as immutable history after supersession." });
assert.equal(beforeClose.revisions.length, 3, "ledger operations do not mutate earlier ledgers");
assert.equal(getCurrentLearningRecords(ledger)[0].status, "Archived");
assert.equal(buildLearningReusePlan(ledger, "2026-08-03T00:00:00.000Z").eligibleLearningIds.length, 0, "closed learning cannot influence current guidance");

const pendingEvidence = { ...reviewedEvidence("pending"), reviewStatus: "Pending Review", reviewedBy: null, reviewedAt: null };
let invalidLedger = createLearningDraft(createInstitutionalLearningLedger(), { ...base, observation: "Unreviewed free text suggests a pattern.", supportingEvidence: [pendingEvidence] });
const invalidId = invalidLedger.revisions[0].learningId;
assert.throws(() => submitLearningForReview(invalidLedger, invalidId, { reviewer: "Reviewer", reviewedAt: "2026-07-17T12:00:00.000Z", reasoning: "Attempted review" }), /reviewed and traceable/);
assert.throws(() => approveLearning(invalidLedger, invalidId, { approver: "Owner", approvedAt: "2026-07-17T13:00:00.000Z", reasoning: "Attempted approval" }), /Only an Under Review/);
assert.throws(() => closeLearningRecord(beforeClose, learningId, { action: "Archived", approver: "Owner", approvedAt: "2026-07-17T14:00:00.000Z", reasoning: "Invalid direct archive" }), /Invalid institutional learning transition/);

console.log(JSON.stringify({ message: "Institutional Learning checks passed.", ...report.metrics, immutableRevisions: ledger.revisions.length, automaticLearning: false, historicalRecommendationsModified: 0 }, null, 2));
