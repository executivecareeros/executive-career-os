export const institutionalLearningVersion = "orion-institutional-learning-v1" as const;

export const institutionalKnowledgeDomains = [
  "Validated Decision Patterns",
  "Recurring Evidence Gaps",
  "Frequently Requested Evidence",
  "Recommendation Rejection Reasons",
  "Recommendation Acceptance Reasons",
  "Explanation Effectiveness",
  "Confidence Calibration Findings",
  "Validation Process Improvements",
  "Engineering Process Improvements",
  "Governance Decisions",
] as const;
export type InstitutionalKnowledgeDomain = (typeof institutionalKnowledgeDomains)[number];

export const learningLifecycleStatuses = ["Draft", "Under Review", "Approved", "Superseded", "Retired", "Archived"] as const;
export type LearningLifecycleStatus = (typeof learningLifecycleStatuses)[number];
export type LearningConfidence = "Unknown" | "Low" | "Medium" | "High";
export type LearningReuseTarget = "Documentation" | "Review Playbooks" | "Validation Procedures" | "Evidence Requirements" | "Decision Guidance" | "Engineering Practices";

export type ReviewedLearningEvidence = {
  evidenceId: string;
  sourceType: "Validation Report" | "Decision Record" | "Operations Record" | "Incident Record" | "Reviewed Feedback" | "Governance Record";
  provenance: string;
  reviewStatus: "Pending Review" | "Reviewed";
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type LearningApproval = {
  action: "Approved" | "Superseded" | "Retired" | "Archived";
  approvedBy: string;
  approvedAt: string;
  reasoning: string;
};

export type InstitutionalLearningRevision = {
  id: string;
  learningId: string;
  revision: number;
  version: typeof institutionalLearningVersion;
  domain: InstitutionalKnowledgeDomain;
  status: LearningLifecycleStatus;
  observation: string;
  supportingEvidence: readonly ReviewedLearningEvidence[];
  documentedReasoning: string;
  scope: string;
  confidence: LearningConfidence;
  reuseTargets: readonly LearningReuseTarget[];
  createdAt: string;
  recordedBy: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewReasoning: string | null;
  reviewDueAt: string | null;
  expiresAt: string | null;
  supersedesLearningId: string | null;
  approvalHistory: readonly LearningApproval[];
};

export type InstitutionalLearningLedger = {
  version: typeof institutionalLearningVersion;
  revisions: readonly InstitutionalLearningRevision[];
};

const hash = (value: string) => {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return (result >>> 0).toString(36);
};
const assertText = (value: string, field: string) => { if (!value.trim()) throw new Error(`${field} is required`); };
const assertDate = (value: string | null, field: string) => { if (value !== null && Number.isNaN(Date.parse(value))) throw new Error(`${field} must be a valid timestamp`); };
const latestByLearningId = (ledger: InstitutionalLearningLedger) => {
  const latest = new Map<string, InstitutionalLearningRevision>();
  for (const revision of ledger.revisions) {
    const current = latest.get(revision.learningId);
    if (!current || revision.revision > current.revision) latest.set(revision.learningId, revision);
  }
  return [...latest.values()];
};
const latest = (ledger: InstitutionalLearningLedger, learningId: string) => {
  const revision = latestByLearningId(ledger).find((item) => item.learningId === learningId);
  if (!revision) throw new Error(`Unknown institutional learning record: ${learningId}`);
  return revision;
};
const append = (ledger: InstitutionalLearningLedger, revision: InstitutionalLearningRevision): InstitutionalLearningLedger => ({ ...ledger, revisions: [...ledger.revisions, revision] });
const nextRevision = (record: InstitutionalLearningRevision, change: Partial<InstitutionalLearningRevision>): InstitutionalLearningRevision => {
  const revision = record.revision + 1;
  return { ...record, ...change, id: `${record.learningId}:r${revision}`, revision };
};
const evidenceIsGoverned = (evidence: ReviewedLearningEvidence) => evidence.reviewStatus === "Reviewed" && Boolean(evidence.provenance.trim()) && Boolean(evidence.reviewedBy?.trim()) && evidence.reviewedAt !== null && !Number.isNaN(Date.parse(evidence.reviewedAt));

export function createInstitutionalLearningLedger(): InstitutionalLearningLedger {
  return { version: institutionalLearningVersion, revisions: [] };
}

export function createLearningDraft(ledger: InstitutionalLearningLedger, input: Omit<InstitutionalLearningRevision, "id" | "learningId" | "revision" | "version" | "status" | "reviewedBy" | "reviewedAt" | "reviewReasoning" | "approvalHistory">): InstitutionalLearningLedger {
  assertText(input.observation, "observation");
  assertText(input.scope, "scope");
  assertText(input.recordedBy, "recordedBy");
  assertDate(input.createdAt, "createdAt");
  assertDate(input.reviewDueAt, "reviewDueAt");
  assertDate(input.expiresAt, "expiresAt");
  if (input.expiresAt === null && input.reviewDueAt === null) throw new Error("A review due date or expiration is required");
  const learningId = `learning:${hash(`${input.domain}|${input.observation}|${input.createdAt}`)}`;
  if (ledger.revisions.some((item) => item.learningId === learningId)) throw new Error("Duplicate institutional learning draft");
  return append(ledger, {
    ...input,
    id: `${learningId}:r1`,
    learningId,
    revision: 1,
    version: institutionalLearningVersion,
    status: "Draft",
    reviewedBy: null,
    reviewedAt: null,
    reviewReasoning: null,
    approvalHistory: [],
  });
}

export function submitLearningForReview(ledger: InstitutionalLearningLedger, learningId: string, input: { reviewer: string; reviewedAt: string; reasoning: string }): InstitutionalLearningLedger {
  const record = latest(ledger, learningId);
  if (record.status !== "Draft") throw new Error("Only a Draft can enter review");
  assertText(input.reviewer, "reviewer");
  assertText(input.reasoning, "review reasoning");
  assertText(record.documentedReasoning, "documented reasoning");
  assertDate(input.reviewedAt, "reviewedAt");
  if (!record.supportingEvidence.length) throw new Error("Reviewed evidence is required before review");
  if (!record.supportingEvidence.every(evidenceIsGoverned)) throw new Error("All learning evidence must be reviewed and traceable");
  return append(ledger, nextRevision(record, { status: "Under Review", reviewedBy: input.reviewer, reviewedAt: input.reviewedAt, reviewReasoning: input.reasoning }));
}

export function approveLearning(ledger: InstitutionalLearningLedger, learningId: string, input: { approver: string; approvedAt: string; reasoning: string }): InstitutionalLearningLedger {
  const record = latest(ledger, learningId);
  if (record.status !== "Under Review") throw new Error("Only an Under Review record can be approved");
  assertText(input.approver, "approver");
  assertText(input.reasoning, "approval reasoning");
  assertDate(input.approvedAt, "approvedAt");
  if (!record.supportingEvidence.every(evidenceIsGoverned) || !record.reviewedBy || !record.reviewReasoning) throw new Error("Approval requires reviewed evidence and documented review");
  const approval: LearningApproval = { action: "Approved", approvedBy: input.approver, approvedAt: input.approvedAt, reasoning: input.reasoning };
  return append(ledger, nextRevision(record, { status: "Approved", approvalHistory: [...record.approvalHistory, approval] }));
}

export function closeLearningRecord(ledger: InstitutionalLearningLedger, learningId: string, input: { action: "Superseded" | "Retired" | "Archived"; approver: string; approvedAt: string; reasoning: string }): InstitutionalLearningLedger {
  const record = latest(ledger, learningId);
  const allowed = (record.status === "Approved" && (input.action === "Superseded" || input.action === "Retired")) || ((record.status === "Superseded" || record.status === "Retired") && input.action === "Archived");
  if (!allowed) throw new Error(`Invalid institutional learning transition: ${record.status} to ${input.action}`);
  assertText(input.approver, "approver");
  assertText(input.reasoning, "governance reasoning");
  assertDate(input.approvedAt, "approvedAt");
  const approval: LearningApproval = { action: input.action, approvedBy: input.approver, approvedAt: input.approvedAt, reasoning: input.reasoning };
  return append(ledger, nextRevision(record, { status: input.action, approvalHistory: [...record.approvalHistory, approval] }));
}

export function getCurrentLearningRecords(ledger: InstitutionalLearningLedger) {
  return latestByLearningId(ledger);
}

export function buildLearningReusePlan(ledger: InstitutionalLearningLedger, asOf: string) {
  assertDate(asOf, "asOf");
  const asOfTime = Date.parse(asOf);
  const approved = latestByLearningId(ledger).filter((record) => record.status === "Approved" && (record.expiresAt === null || Date.parse(record.expiresAt) > asOfTime) && (record.reviewDueAt === null || Date.parse(record.reviewDueAt) > asOfTime));
  return {
    asOf,
    eligibleLearningIds: approved.map((record) => record.learningId),
    targets: Object.fromEntries(["Documentation", "Review Playbooks", "Validation Procedures", "Evidence Requirements", "Decision Guidance", "Engineering Practices"].map((target) => [target, approved.filter((record) => record.reuseTargets.includes(target as LearningReuseTarget)).map((record) => record.learningId)])),
    historicalRecommendationsModified: 0 as const,
    automaticModelUpdates: 0 as const,
  };
}

export function evaluateInstitutionalLearning(ledger: InstitutionalLearningLedger, asOf: string) {
  const current = latestByLearningId(ledger);
  const reuse = buildLearningReusePlan(ledger, asOf);
  const approved = current.filter((record) => record.status === "Approved");
  const governed = current.filter((record) => record.supportingEvidence.length && record.supportingEvidence.every(evidenceIsGoverned) && record.documentedReasoning && record.scope && (record.reviewDueAt || record.expiresAt));
  const submitted = current.filter((record) => record.status !== "Draft");
  const reviewed = submitted.filter((record) => record.reviewedBy && record.reviewedAt && record.reviewReasoning);
  const evidenceGapReductionOpportunities = approved.filter((record) => record.domain === "Recurring Evidence Gaps" || record.domain === "Frequently Requested Evidence").length;
  const percentage = (part: number, total: number) => total ? Math.round(part / total * 1000) / 10 : 0;
  return {
    version: institutionalLearningVersion,
    metrics: {
      institutionalLearningCoverage: percentage(new Set(approved.map((record) => record.domain)).size, institutionalKnowledgeDomains.length),
      approvedLearningRecords: approved.length,
      evidenceGapReductionOpportunities,
      governanceCoverage: percentage(governed.length, current.length),
      reviewCompleteness: percentage(reviewed.length, submitted.length),
      knowledgeReusePotential: percentage(approved.filter((record) => record.reuseTargets.length).length, approved.length),
    },
    reuse,
    currentRecords: current,
    immutableRevisionCount: ledger.revisions.length,
    automaticLearning: false as const,
    silentUpdates: false as const,
  };
}
