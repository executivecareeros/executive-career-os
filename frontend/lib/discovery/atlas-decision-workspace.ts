import type { DecisionAssessment } from "./executive-decision-intelligence.ts";
import type { AtlasOpportunityReview } from "./atlas-opportunity-review.ts";
import { buildAtlasOpportunityReview, validateAtlasOpportunityReview } from "./atlas-opportunity-review.ts";

export const atlasDecisionWorkspaceVersion = "atlas-decision-workspace-v1" as const;

export const decisionJourneyStages = [
  "Opportunity Identified", "Initial Review", "Evidence Collection", "Employer Research", "Recruiter Contact",
  "Interview Preparation", "Interview Completed", "Compensation Review", "Negotiation", "Offer Evaluation",
  "Decision Pending", "Accepted", "Declined", "Withdrawn", "Archived",
] as const;
export type DecisionJourneyStage = (typeof decisionJourneyStages)[number];

export const workspaceObjectKinds = [
  "Decision Timeline", "Decision Stage", "Executive Tasks", "Evidence Collection", "Investigation Status",
  "Reassessment Request", "Decision Notes", "Open Questions", "Completed Questions", "Decision History",
] as const;
export type WorkspaceObjectKind = (typeof workspaceObjectKinds)[number];
export type WorkspaceObjectDefinition = {
  kind: WorkspaceObjectKind;
  purpose: string;
  requiredFields: readonly string[];
  optionalFields: readonly string[];
  evidenceLinkage: string;
  lifecycle: string;
};

export const workspaceObjectRegistry: readonly WorkspaceObjectDefinition[] = [
  { kind: "Decision Timeline", purpose: "Preserve the ordered opportunity journey.", requiredFields: ["event", "timestamp", "actor"], optionalFields: ["evidenceIds", "stageChange"], evidenceLinkage: "Events cite reviewed evidence when evidence changed the journey.", lifecycle: "Append-only; events are never edited or deleted." },
  { kind: "Decision Stage", purpose: "State the executive-controlled current decision position.", requiredFields: ["stage", "reason", "executiveActor"], optionalFields: ["evidenceIds"], evidenceLinkage: "Transitions cite workspace evidence and executive reasoning.", lifecycle: "Moves only through registered transitions; terminal stages may archive." },
  { kind: "Executive Tasks", purpose: "Make the next justified work explicit without automatic execution.", requiredFields: ["title", "status", "source"], optionalFields: ["evidenceIds", "completionTime"], evidenceLinkage: "Suggested tasks cite the review or evidence that justifies them.", lifecycle: "Suggested → Open → Completed or Cancelled; executive controls changes." },
  { kind: "Evidence Collection", purpose: "Accumulate decision-relevant evidence with review status.", requiredFields: ["statement", "reference", "reviewStatus"], optionalFields: ["reviewedBy", "reviewedAt"], evidenceLinkage: "Reference is immutable and unique inside the workspace.", lifecycle: "Pending Review → Reviewed; never silently replaced." },
  { kind: "Investigation Status", purpose: "Track whether an evidence investigation is pending or resolved.", requiredFields: ["questionId", "status"], optionalFields: ["evidenceIds"], evidenceLinkage: "Resolution cites reviewed evidence.", lifecycle: "Open → Completed; unresolved remains visible." },
  { kind: "Reassessment Request", purpose: "Request a new Atlas review after material reviewed evidence arrives.", requiredFields: ["reason", "newEvidenceIds", "previousReviewId"], optionalFields: ["newReviewId"], evidenceLinkage: "Every trigger must be new, reviewed, and present in the new M6 assessment.", lifecycle: "Requested → Completed; prior review remains immutable." },
  { kind: "Decision Notes", purpose: "Preserve executive context without turning notes into evidence.", requiredFields: ["text", "author", "timestamp"], optionalFields: ["evidenceIds"], evidenceLinkage: "Notes may cite evidence but are not evidence themselves.", lifecycle: "Append-only." },
  { kind: "Open Questions", purpose: "Keep unresolved executive questions visible.", requiredFields: ["question", "status"], optionalFields: ["evidenceIds"], evidenceLinkage: "Question may identify evidence needed to resolve it.", lifecycle: "Open until explicitly completed by the executive." },
  { kind: "Completed Questions", purpose: "Preserve resolved questions and their basis.", requiredFields: ["question", "answer", "evidenceIds"], optionalFields: ["completedAt"], evidenceLinkage: "Completion requires reviewed evidence.", lifecycle: "Immutable after completion." },
  { kind: "Decision History", purpose: "Preserve recommendations, confidence, Unknowns, stages, and final decisions over time.", requiredFields: ["reviews", "events", "stage"], optionalFields: ["terminalDecision"], evidenceLinkage: "History retains source review and evidence identifiers.", lifecycle: "Append-only; no historical recommendation is overwritten." },
] as const;

export type WorkspaceEvidence = { id: string; statement: string; reference: string; reviewStatus: "Pending Review" | "Reviewed"; addedAt: string; addedBy: "Executive"; reviewedAt: string | null; reviewedBy: string | null };
export type WorkspaceTask = { id: string; title: string; source: "Atlas" | "Executive"; status: "Suggested" | "Open" | "Completed" | "Cancelled"; evidenceIds: readonly string[]; createdAt: string; completedAt: string | null };
export type WorkspaceQuestion = { id: string; question: string; status: "Open" | "Completed"; evidenceIds: readonly string[]; answer: string | null; createdAt: string; completedAt: string | null };
export type WorkspaceNote = { id: string; text: string; author: "Executive"; evidenceIds: readonly string[]; createdAt: string };
export type WorkspaceTimelineEvent = { id: string; type: "Workspace Created" | "Stage Changed" | "Evidence Added" | "Evidence Reviewed" | "Task Changed" | "Question Changed" | "Note Added" | "Reassessment Completed" | "Decision Recorded"; at: string; actor: "Executive" | "Atlas"; description: string; evidenceIds: readonly string[]; fromStage: DecisionJourneyStage | null; toStage: DecisionJourneyStage | null };
export type ReassessmentRecord = { id: string; requestedAt: string; requestedBy: "Executive"; reason: string; triggerEvidenceIds: readonly string[]; previousReviewId: string; previousState: AtlasOpportunityReview["state"]; previousConfidence: string; previousUnknowns: number; completedAt: string; newReviewId: string; newState: AtlasOpportunityReview["state"]; newConfidence: string; newUnknowns: number };
export type WorkspaceDecision = { id: string; action: "Pursue" | "Watch" | "Skip"; recordedAt: string; recordedBy: "Executive"; reviewId: string; confidence: string; unknowns: number };

export type AtlasDecisionWorkspace = {
  version: typeof atlasDecisionWorkspaceVersion;
  id: string;
  opportunityId: string;
  createdAt: string;
  currentStage: DecisionJourneyStage;
  reviews: readonly AtlasOpportunityReview[];
  evidence: readonly WorkspaceEvidence[];
  tasks: readonly WorkspaceTask[];
  questions: readonly WorkspaceQuestion[];
  notes: readonly WorkspaceNote[];
  reassessments: readonly ReassessmentRecord[];
  decisions: readonly WorkspaceDecision[];
  timeline: readonly WorkspaceTimelineEvent[];
};

const transitions: Readonly<Record<DecisionJourneyStage, readonly DecisionJourneyStage[]>> = {
  "Opportunity Identified": ["Initial Review", "Withdrawn", "Archived"],
  "Initial Review": ["Evidence Collection", "Employer Research", "Declined", "Withdrawn", "Archived"],
  "Evidence Collection": ["Employer Research", "Recruiter Contact", "Declined", "Withdrawn"],
  "Employer Research": ["Evidence Collection", "Recruiter Contact", "Declined", "Withdrawn"],
  "Recruiter Contact": ["Evidence Collection", "Interview Preparation", "Declined", "Withdrawn"],
  "Interview Preparation": ["Interview Completed", "Withdrawn"],
  "Interview Completed": ["Compensation Review", "Decision Pending", "Declined", "Withdrawn"],
  "Compensation Review": ["Negotiation", "Offer Evaluation", "Decision Pending", "Declined"],
  "Negotiation": ["Offer Evaluation", "Decision Pending", "Withdrawn"],
  "Offer Evaluation": ["Negotiation", "Decision Pending", "Accepted", "Declined"],
  "Decision Pending": ["Negotiation", "Accepted", "Declined", "Withdrawn"],
  "Accepted": ["Archived"], "Declined": ["Archived"], "Withdrawn": ["Archived"], "Archived": [],
};
export const nextDecisionStages = (stage: DecisionJourneyStage) => transitions[stage];
const hash = (value: string) => { let result = 2166136261; for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619); return (result >>> 0).toString(36); };
const assertDate = (value: string, field: string) => { if (Number.isNaN(Date.parse(value))) throw new Error(`${field} must be a valid timestamp`); };
const assertText = (value: string, field: string) => { if (!value.trim()) throw new Error(`${field} is required`); };
const event = (workspaceId: string, type: WorkspaceTimelineEvent["type"], at: string, actor: WorkspaceTimelineEvent["actor"], description: string, evidenceIds: readonly string[] = [], fromStage: DecisionJourneyStage | null = null, toStage: DecisionJourneyStage | null = null): WorkspaceTimelineEvent => ({ id: `event:${hash(`${workspaceId}|${type}|${at}|${description}`)}`, type, at, actor, description, evidenceIds, fromStage, toStage });
const evidenceByIds = (workspace: AtlasDecisionWorkspace, evidenceIds: readonly string[], requireReviewed = false) => evidenceIds.every((id) => workspace.evidence.some((item) => item.id === id && (!requireReviewed || item.reviewStatus === "Reviewed")));
const currentReview = (workspace: AtlasDecisionWorkspace) => workspace.reviews[workspace.reviews.length - 1];
const confidenceLabel = (review: AtlasOpportunityReview) => review.objects.find((object) => object.kind === "Confidence Statement")?.confidence?.level ?? "Unknown";

export function createAtlasDecisionWorkspace(review: AtlasOpportunityReview, createdAt: string): AtlasDecisionWorkspace {
  assertDate(createdAt, "createdAt");
  if (!validateAtlasOpportunityReview(review).valid) throw new Error("A valid Atlas Opportunity Review is required");
  const id = `workspace:${hash(`${review.opportunityId}|${createdAt}`)}`;
  return { version: atlasDecisionWorkspaceVersion, id, opportunityId: review.opportunityId, createdAt, currentStage: "Opportunity Identified", reviews: [review], evidence: [], tasks: [], questions: [], notes: [], reassessments: [], decisions: [], timeline: [event(id, "Workspace Created", createdAt, "Executive", "Executive opened the opportunity decision workspace.")] };
}

export function changeDecisionStage(workspace: AtlasDecisionWorkspace, input: { toStage: DecisionJourneyStage; reason: string; evidenceIds?: readonly string[]; at: string; actor: "Executive" }): AtlasDecisionWorkspace {
  assertDate(input.at, "at"); assertText(input.reason, "stage reason");
  if (input.actor !== "Executive") throw new Error("Only the executive may change the decision stage");
  if (!transitions[workspace.currentStage].includes(input.toStage)) throw new Error(`Invalid decision stage transition: ${workspace.currentStage} to ${input.toStage}`);
  const evidenceIds = input.evidenceIds ?? [];
  if (!evidenceByIds(workspace, evidenceIds, true)) throw new Error("Stage evidence must be reviewed workspace evidence");
  return { ...workspace, currentStage: input.toStage, timeline: [...workspace.timeline, event(workspace.id, "Stage Changed", input.at, "Executive", input.reason, evidenceIds, workspace.currentStage, input.toStage)] };
}

export function addWorkspaceEvidence(workspace: AtlasDecisionWorkspace, input: { statement: string; reference: string; at: string }): AtlasDecisionWorkspace {
  assertDate(input.at, "at"); assertText(input.statement, "evidence statement"); assertText(input.reference, "evidence reference");
  if (workspace.evidence.some((item) => item.reference === input.reference)) throw new Error("Evidence reference already exists in this workspace");
  const evidence: WorkspaceEvidence = { id: `workspace-evidence:${hash(`${workspace.id}|${input.reference}`)}`, statement: input.statement, reference: input.reference, reviewStatus: "Pending Review", addedAt: input.at, addedBy: "Executive", reviewedAt: null, reviewedBy: null };
  return { ...workspace, evidence: [...workspace.evidence, evidence], timeline: [...workspace.timeline, event(workspace.id, "Evidence Added", input.at, "Executive", input.statement, [evidence.id])] };
}

export function reviewWorkspaceEvidence(workspace: AtlasDecisionWorkspace, input: { evidenceId: string; reviewedBy: string; at: string }): AtlasDecisionWorkspace {
  assertDate(input.at, "at"); assertText(input.reviewedBy, "reviewedBy");
  const target = workspace.evidence.find((item) => item.id === input.evidenceId);
  if (!target) throw new Error("Workspace evidence was not found");
  if (target.reviewStatus === "Reviewed") throw new Error("Workspace evidence is already reviewed");
  return { ...workspace, evidence: workspace.evidence.map((item) => item.id === input.evidenceId ? { ...item, reviewStatus: "Reviewed", reviewedAt: input.at, reviewedBy: input.reviewedBy } : item), timeline: [...workspace.timeline, event(workspace.id, "Evidence Reviewed", input.at, "Executive", "Workspace evidence was reviewed.", [input.evidenceId])] };
}

export function addWorkspaceTask(workspace: AtlasDecisionWorkspace, input: { title: string; source: "Atlas" | "Executive"; evidenceIds?: readonly string[]; at: string }): AtlasDecisionWorkspace {
  assertDate(input.at, "at"); assertText(input.title, "task title");
  const evidenceIds = input.evidenceIds ?? [];
  if (!evidenceByIds(workspace, evidenceIds)) throw new Error("Task evidence must exist in the workspace");
  const task: WorkspaceTask = { id: `task:${hash(`${workspace.id}|${input.title}|${input.at}`)}`, title: input.title, source: input.source, status: input.source === "Atlas" ? "Suggested" : "Open", evidenceIds, createdAt: input.at, completedAt: null };
  return { ...workspace, tasks: [...workspace.tasks, task], timeline: [...workspace.timeline, event(workspace.id, "Task Changed", input.at, input.source, `${input.source} created a ${task.status.toLowerCase()} task.`, evidenceIds)] };
}

export function changeWorkspaceTask(workspace: AtlasDecisionWorkspace, input: { taskId: string; status: "Open" | "Completed" | "Cancelled"; at: string; actor: "Executive" }): AtlasDecisionWorkspace {
  assertDate(input.at, "at");
  if (input.actor !== "Executive") throw new Error("Only the executive may change a task");
  const task = workspace.tasks.find((item) => item.id === input.taskId);
  if (!task) throw new Error("Workspace task was not found");
  const allowed = task.status === "Suggested" ? ["Open", "Cancelled"] : task.status === "Open" ? ["Completed", "Cancelled"] : [];
  if (!allowed.includes(input.status)) throw new Error(`Invalid task transition: ${task.status} to ${input.status}`);
  return { ...workspace, tasks: workspace.tasks.map((item) => item.id === input.taskId ? { ...item, status: input.status, completedAt: input.status === "Completed" ? input.at : null } : item), timeline: [...workspace.timeline, event(workspace.id, "Task Changed", input.at, "Executive", `Executive changed task to ${input.status}.`, task.evidenceIds)] };
}

export function addWorkspaceQuestion(workspace: AtlasDecisionWorkspace, input: { question: string; evidenceIds?: readonly string[]; at: string }): AtlasDecisionWorkspace {
  assertDate(input.at, "at"); assertText(input.question, "question");
  const evidenceIds = input.evidenceIds ?? [];
  if (!evidenceByIds(workspace, evidenceIds)) throw new Error("Question evidence must exist in the workspace");
  const question: WorkspaceQuestion = { id: `question:${hash(`${workspace.id}|${input.question}|${input.at}`)}`, question: input.question, status: "Open", evidenceIds, answer: null, createdAt: input.at, completedAt: null };
  return { ...workspace, questions: [...workspace.questions, question], timeline: [...workspace.timeline, event(workspace.id, "Question Changed", input.at, "Executive", "Executive added an open question.", evidenceIds)] };
}

export function completeWorkspaceQuestion(workspace: AtlasDecisionWorkspace, input: { questionId: string; answer: string; evidenceIds: readonly string[]; at: string; actor: "Executive" }): AtlasDecisionWorkspace {
  assertDate(input.at, "at"); assertText(input.answer, "answer");
  if (input.actor !== "Executive") throw new Error("Only the executive may complete a question");
  const question = workspace.questions.find((item) => item.id === input.questionId);
  if (!question || question.status !== "Open") throw new Error("An open workspace question is required");
  if (!input.evidenceIds.length || !evidenceByIds(workspace, input.evidenceIds, true)) throw new Error("Completing a question requires reviewed evidence");
  return { ...workspace, questions: workspace.questions.map((item) => item.id === input.questionId ? { ...item, status: "Completed", answer: input.answer, evidenceIds: input.evidenceIds, completedAt: input.at } : item), timeline: [...workspace.timeline, event(workspace.id, "Question Changed", input.at, "Executive", "Executive completed a question using reviewed evidence.", input.evidenceIds)] };
}

export function addDecisionNote(workspace: AtlasDecisionWorkspace, input: { text: string; evidenceIds?: readonly string[]; at: string; actor: "Executive" }): AtlasDecisionWorkspace {
  assertDate(input.at, "at"); assertText(input.text, "note text");
  if (input.actor !== "Executive") throw new Error("Only the executive may add a decision note");
  const evidenceIds = input.evidenceIds ?? [];
  if (!evidenceByIds(workspace, evidenceIds)) throw new Error("Note evidence must exist in the workspace");
  const note: WorkspaceNote = { id: `note:${hash(`${workspace.id}|${input.text}|${input.at}`)}`, text: input.text, author: "Executive", evidenceIds, createdAt: input.at };
  return { ...workspace, notes: [...workspace.notes, note], timeline: [...workspace.timeline, event(workspace.id, "Note Added", input.at, "Executive", "Executive added a decision note.", evidenceIds)] };
}

export function recordWorkspaceDecision(workspace: AtlasDecisionWorkspace, input: { action: "Pursue" | "Watch" | "Skip"; at: string; actor: "Executive" }): AtlasDecisionWorkspace {
  assertDate(input.at, "at");
  if (input.actor !== "Executive") throw new Error("Only the executive may record a decision");
  if (workspace.decisions.some((item) => item.action === input.action && item.reviewId === `${currentReview(workspace).version}:${currentReview(workspace).generatedAt}`)) return workspace;
  const review = currentReview(workspace);
  const decision: WorkspaceDecision = { id: `decision:${hash(`${workspace.id}|${input.action}|${input.at}`)}`, action: input.action, recordedAt: input.at, recordedBy: "Executive", reviewId: `${review.version}:${review.generatedAt}`, confidence: confidenceLabel(review), unknowns: review.actualUnknownCount };
  return { ...workspace, decisions: [...workspace.decisions, decision], timeline: [...workspace.timeline, event(workspace.id, "Decision Recorded", input.at, "Executive", `Executive recorded ${input.action}.`, review.sourceEvidenceIds)] };
}

export function reassessAtlasOpportunity(workspace: AtlasDecisionWorkspace, input: { assessment: DecisionAssessment; reason: string; triggerEvidenceIds: readonly string[]; requestedAt: string; completedAt: string; requestedBy: "Executive" }): AtlasDecisionWorkspace {
  assertDate(input.requestedAt, "requestedAt"); assertDate(input.completedAt, "completedAt"); assertText(input.reason, "reassessment reason");
  if (input.requestedBy !== "Executive") throw new Error("Only the executive may request reassessment");
  if (!input.triggerEvidenceIds.length || !evidenceByIds(workspace, input.triggerEvidenceIds, true)) throw new Error("Reassessment requires new reviewed workspace evidence");
  const previous = currentReview(workspace);
  if (input.assessment.focusEntityId !== workspace.opportunityId) throw new Error("Reassessment must address the same canonical opportunity");
  if (!input.triggerEvidenceIds.every((evidenceId) => input.assessment.supportingEvidence.some((evidence) => evidence.evidenceId === evidenceId))) throw new Error("Reassessment assessment must cite every trigger evidence item");
  if (input.triggerEvidenceIds.some((evidenceId) => previous.sourceEvidenceIds.includes(evidenceId))) throw new Error("Reassessment trigger evidence must be new to the previous recommendation");
  const next = buildAtlasOpportunityReview(input.assessment, input.completedAt);
  const record: ReassessmentRecord = { id: `reassessment:${hash(`${workspace.id}|${input.requestedAt}|${input.reason}`)}`, requestedAt: input.requestedAt, requestedBy: input.requestedBy, reason: input.reason, triggerEvidenceIds: input.triggerEvidenceIds, previousReviewId: `${previous.version}:${previous.generatedAt}`, previousState: previous.state, previousConfidence: confidenceLabel(previous), previousUnknowns: previous.actualUnknownCount, completedAt: input.completedAt, newReviewId: `${next.version}:${next.generatedAt}`, newState: next.state, newConfidence: confidenceLabel(next), newUnknowns: next.actualUnknownCount };
  return { ...workspace, reviews: [...workspace.reviews, next], reassessments: [...workspace.reassessments, record], timeline: [...workspace.timeline, event(workspace.id, "Reassessment Completed", input.completedAt, "Atlas", input.reason, input.triggerEvidenceIds)] };
}

export function validateAtlasDecisionWorkspace(workspace: AtlasDecisionWorkspace) {
  const chronological = workspace.timeline.every((item, index) => index === 0 || Date.parse(workspace.timeline[index - 1].at) <= Date.parse(item.at));
  const reviewHistoryValid = workspace.reviews.every((review) => review.opportunityId === workspace.opportunityId && validateAtlasOpportunityReview(review).valid);
  const taskTraceability = workspace.tasks.every((task) => evidenceByIds(workspace, task.evidenceIds));
  const completedQuestionsValid = workspace.questions.filter((question) => question.status === "Completed").every((question) => question.answer && question.evidenceIds.length && evidenceByIds(workspace, question.evidenceIds, true));
  const reassessmentsValid = workspace.reassessments.every((record) => record.triggerEvidenceIds.length && evidenceByIds(workspace, record.triggerEvidenceIds, true));
  const decisionsValid = workspace.decisions.every((decision) => workspace.reviews.some((review) => decision.reviewId === `${review.version}:${review.generatedAt}`));
  const noAutomaticActions = workspace.tasks.filter((task) => task.source === "Atlas").every((task) => task.status === "Suggested" || workspace.timeline.some((item) => item.type === "Task Changed" && item.actor === "Executive" && item.at >= task.createdAt));
  return { valid: chronological && reviewHistoryValid && taskTraceability && completedQuestionsValid && reassessmentsValid && decisionsValid && noAutomaticActions, chronological, reviewHistoryValid, taskTraceability, completedQuestionsValid, reassessmentsValid, decisionsValid, noAutomaticActions };
}

export function measureAtlasDecisionWorkspaces(workspaces: readonly AtlasDecisionWorkspace[]) {
  const percentage = (part: number, total: number) => total ? Math.round(part / total * 1000) / 10 : 0;
  const results = workspaces.map(validateAtlasDecisionWorkspace);
  const tasks = workspaces.flatMap((workspace) => workspace.tasks);
  const evidence = workspaces.flatMap((workspace) => workspace.evidence);
  const reassessments = workspaces.flatMap((workspace) => workspace.reassessments);
  const representedObjects = new Set<WorkspaceObjectKind>(["Decision Timeline", "Decision Stage", "Decision History"]);
  if (tasks.length) representedObjects.add("Executive Tasks");
  if (evidence.length) representedObjects.add("Evidence Collection");
  if (workspaces.some((workspace) => workspace.questions.length)) representedObjects.add("Open Questions");
  if (workspaces.some((workspace) => workspace.questions.some((question) => question.status === "Completed"))) { representedObjects.add("Completed Questions"); representedObjects.add("Investigation Status"); }
  if (workspaces.some((workspace) => workspace.notes.length)) representedObjects.add("Decision Notes");
  if (reassessments.length) representedObjects.add("Reassessment Request");
  return {
    decisionJourneyCoverage: percentage(Object.keys(transitions).length, decisionJourneyStages.length),
    workspaceCompletion: percentage(representedObjects.size, workspaceObjectKinds.length),
    taskTraceability: percentage(tasks.filter((task) => task.evidenceIds.every((id) => workspaces.some((workspace) => workspace.evidence.some((item) => item.id === id)))).length, tasks.length),
    evidenceProgression: percentage(evidence.filter((item) => item.reviewStatus === "Reviewed").length, evidence.length),
    reassessmentReadiness: percentage(reassessments.filter((record) => record.triggerEvidenceIds.length).length, reassessments.length),
    decisionContinuity: percentage(results.filter((result) => result.chronological && result.reviewHistoryValid).length, results.length),
    executiveWorkflowReadiness: results.length > 0 && results.every((result) => result.valid) && representedObjects.size === workspaceObjectKinds.length ? "Ready" : "Not Ready",
  };
}
