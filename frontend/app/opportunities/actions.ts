"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { providerFromCareersUrl } from "@/lib/discovery/providers/factory";
import { OpportunityCoverageEngine } from "@/lib/discovery/coverage-engine";
import { recordDiscoveryRun, SupabaseCoverageQueueStore, SupabaseCoverageRunStore, SupabaseOpportunityIngestionSink } from "@/lib/discovery/supabase-ingestion";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildExecutiveOpportunityIntelligence, opportunityIntelligenceBlueprint } from "@/lib/opportunity-intelligence";
import type { Opportunity } from "@/types/opportunity";
import type { OpportunityProvider } from "@/lib/discovery/types";
import { confirmFounderGeographicProfile, loadExecutiveGeographicProfile } from "@/lib/geographic-profile-repository";
import { currentSession } from "@/lib/auth/session";
import { appendAtlasDecisionWorkspace, loadAtlasDecisionWorkspace } from "@/lib/atlas-decision-workspace-repository";
import { buildProductOpportunityAssessment } from "@/lib/discovery/atlas-product-integration";
import { buildAtlasOpportunityReview } from "@/lib/discovery/atlas-opportunity-review";
import { addDecisionNote, addWorkspaceEvidence, addWorkspaceQuestion, addWorkspaceTask, changeDecisionStage, changeWorkspaceTask, completeWorkspaceQuestion, createAtlasDecisionWorkspace, decisionJourneyStages, reassessAtlasOpportunity, recordWorkspaceDecision, reviewWorkspaceEvidence, type AtlasDecisionWorkspace } from "@/lib/discovery/atlas-decision-workspace";
import { loadNetworkOpportunities, materializeNetworkOpportunity } from "@/lib/opportunity-network";

type DecisionAction = "Pursue" | "Watch" | "Skip";
type BlueprintDecisionRow = { id: string; payload: Record<string, unknown> };

const decisionActions = new Set<DecisionAction>(["Pursue", "Watch", "Skip"]);
function requestedDecision(formData: FormData) {
  const value = String(formData.get("decision") ?? "") as DecisionAction;
  if (!decisionActions.has(value)) throw new Error("Choose Pursue, Watch, or Skip.");
  return value;
}

async function decisionContext(canonicalId: string) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect(`/login?next=${encodeURIComponent(`/opportunities/${canonicalId}`)}`);
  if (!canonicalId.startsWith("discovered-")) throw new Error("Only collected canonical opportunities use this decision flow.");
  const client = createServerSupabaseClient(resolved.accessToken), workspaceId = resolved.context.workspace!.workspaceId;
  const [row, universe, blueprint] = await Promise.all([
    materializeNetworkOpportunity(client, workspaceId, resolved.context.workspace!.executiveId, canonicalId),
    loadNetworkOpportunities(300),
    client.request<BlueprintDecisionRow[]>(`executive_blueprint_revisions?select=id,payload&workspace_id=eq.${workspaceId}&order=revision_number.desc&limit=1`),
  ]);
  if (blueprint.error) throw new Error("The private decision context could not be loaded safely.");
  const blueprintRow = blueprint.data?.[0];
  if (!row) throw new Error("The canonical opportunity is no longer available.");
  if (!blueprintRow) throw new Error("Complete the Executive Blueprint before finalizing this decision.");
  return { resolved, client, workspaceId, row, blueprintRow, universe: universe.map(item => ({ ...item.payload, id: item.domain_id }) as Opportunity) };
}

async function atlasWorkspaceContext(canonicalId: string) {
  const context = await decisionContext(canonicalId);
  const canonical = { ...context.row.payload, id: context.row.domain_id } as Opportunity;
  const profile = await loadExecutiveGeographicProfile(context.client, context.resolved.context);
  const intelligence = buildExecutiveOpportunityIntelligence(canonical, opportunityIntelligenceBlueprint(context.blueprintRow.payload, context.blueprintRow.id), context.universe, undefined, profile);
  const persisted = await loadAtlasDecisionWorkspace(context.client, context.workspaceId, context.row.id);
  const stableCreatedAt = canonical.discoveredAt || canonical.lastObservedAt || "2026-01-01T00:00:00.000Z";
  const initial = persisted?.workspace ?? createAtlasDecisionWorkspace(buildAtlasOpportunityReview(buildProductOpportunityAssessment(intelligence, stableCreatedAt), stableCreatedAt), stableCreatedAt);
  return { ...context, intelligence, atlasWorkspace: initial, atlasSequence: persisted?.sequence ?? 0 };
}

async function saveAtlasWorkspace(context: Awaited<ReturnType<typeof atlasWorkspaceContext>>, workspace: AtlasDecisionWorkspace, eventType: string, occurredAt: string) {
  await appendAtlasDecisionWorkspace(context.client, { workspaceId: context.workspaceId, opportunityRowId: context.row.id, canonicalOpportunityId: context.row.domain_id, expectedSequence: context.atlasSequence, eventType, workspace, occurredAt });
  revalidatePath(`/opportunities/${context.row.domain_id}`);
}

function requiredText(formData: FormData, name: string, label: string) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value || value.length > 1000) throw new Error(`${label} is required and must be concise.`);
  return value;
}

export async function selectCollectedOpportunityDecision(formData: FormData) {
  const canonicalId = String(formData.get("opportunityId") ?? ""), decision = requestedDecision(formData);
  const { client, workspaceId, row } = await decisionContext(canonicalId);
  const finalized = row.payload.executiveDecision as { status?: string } | undefined;
  if (finalized?.status === "Finalized") redirect(`/opportunities/${encodeURIComponent(canonicalId)}?decision=finalized`);
  const updated = await client.request(`opportunities?id=eq.${row.id}&workspace_id=eq.${workspaceId}&version=eq.${row.version}`, { method: "PATCH", body: JSON.stringify({ payload: { ...row.payload, executiveDecisionDraft: { action: decision, selectedAt: new Date().toISOString() } }, version: row.version + 1, updated_at: new Date().toISOString() }) });
  if (updated.error) throw new Error(updated.error.message);
  revalidatePath(`/opportunities/${canonicalId}`); revalidatePath("/opportunities");
  redirect(`/opportunities/${encodeURIComponent(canonicalId)}?decision=selected`);
}

export async function finalizeCollectedOpportunityDecision(formData: FormData) {
  const canonicalId = String(formData.get("opportunityId") ?? ""), decision = requestedDecision(formData);
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) throw new Error("Decision confirmation expired. Refresh and try again.");
  const { resolved, client, workspaceId, row, blueprintRow, universe } = await decisionContext(canonicalId);
  const draft = row.payload.executiveDecisionDraft as { action?: string } | undefined;
  if (draft?.action !== decision) throw new Error("The confirmed action does not match the current selection.");
  const canonical = { ...row.payload, id: row.domain_id } as Opportunity;
  const profile = await loadExecutiveGeographicProfile(client, resolved.context);
  const intelligence = buildExecutiveOpportunityIntelligence(canonical, opportunityIntelligenceBlueprint(blueprintRow.payload, blueprintRow.id), universe, undefined, profile);
  const snapshot = { ...intelligence, blueprintRevisionId: blueprintRow.id, opportunityRevision: row.version, opportunityRevisionId: row.domain_id, intelligenceVersion: "deterministic-opportunity-intelligence-1", rulesVersion: "opportunity-intelligence-1", capturedAt: new Date().toISOString(), contributingFactors: { blueprintComparisons: intelligence.blueprintComparisons, sourceCount: intelligence.provenance.length }, classifiedEvidence: intelligence.evidence, executiveQuestions: intelligence.missingInformation.map(item => `What evidence would resolve: ${item}?`) };
  const result = await client.request<Record<string, string>>("rpc/finalize_collected_opportunity_decision", { method: "POST", body: JSON.stringify({ request: { workspaceId, opportunityId: row.id, opportunityVersion: row.version, blueprintRevisionId: blueprintRow.id, idempotencyKey, selectedAction: decision, intelligence: snapshot } }) });
  if (result.error) throw new Error(result.error.message);
  const workspaceContext = await atlasWorkspaceContext(canonicalId);
  const decisionAt = new Date().toISOString();
  await saveAtlasWorkspace(workspaceContext, recordWorkspaceDecision(workspaceContext.atlasWorkspace, { action: decision, at: decisionAt, actor: "Executive" }), "Decision Recorded", decisionAt);
  ["/", "/opportunities", `/opportunities/${canonicalId}`, "/archive", "/tasks", "/productivity"].forEach(path => revalidatePath(path));
  redirect(`/opportunities/${encodeURIComponent(canonicalId)}?decision=complete`);
}

export async function addAtlasWorkspaceEvidenceAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity");
  const context = await atlasWorkspaceContext(canonicalId), at = new Date().toISOString();
  const next = addWorkspaceEvidence(context.atlasWorkspace, { statement: requiredText(formData, "statement", "Evidence summary"), reference: requiredText(formData, "reference", "Evidence reference"), at });
  await saveAtlasWorkspace(context, next, "Evidence Added", at);
}

export async function reviewAtlasWorkspaceEvidenceAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity"), evidenceId = requiredText(formData, "evidenceId", "Evidence");
  const context = await atlasWorkspaceContext(canonicalId), at = new Date().toISOString();
  await saveAtlasWorkspace(context, reviewWorkspaceEvidence(context.atlasWorkspace, { evidenceId, reviewedBy: "Executive", at }), "Evidence Reviewed", at);
}

export async function addAtlasWorkspaceTaskAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity"), context = await atlasWorkspaceContext(canonicalId), at = new Date().toISOString();
  await saveAtlasWorkspace(context, addWorkspaceTask(context.atlasWorkspace, { title: requiredText(formData, "title", "Task"), source: "Executive", at }), "Task Added", at);
}

export async function changeAtlasWorkspaceTaskAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity"), taskId = requiredText(formData, "taskId", "Task"), status = String(formData.get("status") ?? "");
  if (!(["Open", "Completed", "Cancelled"] as const).includes(status as "Open" | "Completed" | "Cancelled")) throw new Error("Unsupported task status.");
  const context = await atlasWorkspaceContext(canonicalId), at = new Date().toISOString();
  await saveAtlasWorkspace(context, changeWorkspaceTask(context.atlasWorkspace, { taskId, status: status as "Open" | "Completed" | "Cancelled", at, actor: "Executive" }), "Task Changed", at);
}

export async function addAtlasWorkspaceQuestionAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity"), context = await atlasWorkspaceContext(canonicalId), at = new Date().toISOString();
  await saveAtlasWorkspace(context, addWorkspaceQuestion(context.atlasWorkspace, { question: requiredText(formData, "question", "Question"), at }), "Question Added", at);
}

export async function completeAtlasWorkspaceQuestionAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity"), questionId = requiredText(formData, "questionId", "Question"), evidenceId = requiredText(formData, "evidenceId", "Reviewed evidence"), answer = requiredText(formData, "answer", "Answer");
  const context = await atlasWorkspaceContext(canonicalId), at = new Date().toISOString();
  await saveAtlasWorkspace(context, completeWorkspaceQuestion(context.atlasWorkspace, { questionId, answer, evidenceIds: [evidenceId], at, actor: "Executive" }), "Question Completed", at);
}

export async function addAtlasDecisionNoteAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity"), context = await atlasWorkspaceContext(canonicalId), at = new Date().toISOString();
  await saveAtlasWorkspace(context, addDecisionNote(context.atlasWorkspace, { text: requiredText(formData, "text", "Note"), at, actor: "Executive" }), "Note Added", at);
}

export async function changeAtlasDecisionStageAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity"), toStage = String(formData.get("toStage") ?? "");
  if (!decisionJourneyStages.includes(toStage as (typeof decisionJourneyStages)[number])) throw new Error("Unsupported decision stage.");
  const context = await atlasWorkspaceContext(canonicalId), at = new Date().toISOString();
  await saveAtlasWorkspace(context, changeDecisionStage(context.atlasWorkspace, { toStage: toStage as (typeof decisionJourneyStages)[number], reason: requiredText(formData, "reason", "Stage reason"), at, actor: "Executive" }), "Stage Changed", at);
}

export async function requestAtlasReassessmentAction(formData: FormData) {
  const canonicalId = requiredText(formData, "opportunityId", "Opportunity"), context = await atlasWorkspaceContext(canonicalId);
  const reviewed = context.atlasWorkspace.evidence.filter((item) => item.reviewStatus === "Reviewed" && !context.atlasWorkspace.reviews.at(-1)?.sourceEvidenceIds.includes(item.id));
  if (!reviewed.length) throw new Error("Review new evidence before requesting reassessment.");
  const requestedAt = new Date().toISOString(), completedAt = new Date(Date.now() + 1).toISOString();
  const assessment = buildProductOpportunityAssessment(context.intelligence, completedAt, reviewed);
  const next = reassessAtlasOpportunity(context.atlasWorkspace, { assessment, reason: requiredText(formData, "reason", "Reassessment reason"), triggerEvidenceIds: reviewed.map((item) => item.id), requestedAt, completedAt, requestedBy: "Executive" });
  await saveAtlasWorkspace(context, next, "Reassessment Completed", completedAt);
}

export async function confirmGeographicProfileAction() {
  const session = await currentSession();
  const founderEmail = process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase();
  if (!founderEmail || session?.user.email?.trim().toLowerCase() !== founderEmail) {
    throw new Error("This confirmation is available only to the authorized founder fixture.");
  }
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/opportunities");
  await confirmFounderGeographicProfile(createServerSupabaseClient(resolved.accessToken), resolved.context);
  revalidatePath("/opportunities");
  redirect("/opportunities?profile=confirmed");
}

export async function refreshOpportunityBoard(formData: FormData) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/opportunities");
  let provider: OpportunityProvider;
  try { provider = providerFromCareersUrl(String(formData.get("board") ?? "")); }
  catch (error) { redirect(`/opportunities?collection=error&message=${encodeURIComponent(error instanceof Error ? error.message : "The careers board could not be read.")}`); }
  const client = createServerSupabaseClient(resolved.accessToken);
  const requestedAt = new Date().toISOString();
  const engine = new OpportunityCoverageEngine(new SupabaseOpportunityIngestionSink(client, resolved.context), new SupabaseCoverageQueueStore(client, resolved.context), undefined, undefined, new SupabaseCoverageRunStore(client, resolved.context)).register(provider, { priority: 1, enabled: true, maximumResults: 100 });
  await engine.enqueue(provider.id, { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] }, requestedAt);
  const outcome = await engine.runNext(requestedAt);
  if (!outcome) redirect("/opportunities?collection=error&message=No%20collection%20run%20was%20available.");
  try { await recordDiscoveryRun(client, resolved.context, outcome); } catch { /* Collection remains visible if the secondary monitoring record fails. */ }
  revalidatePath("/opportunities");
  if (outcome.run.status === "failed") redirect(`/opportunities?collection=error&message=${encodeURIComponent(outcome.run.errors[0]?.message ?? "Opportunity collection failed.")}`);
  redirect(`/opportunities?collection=complete&imported=${outcome.run.jobsImported}&found=${outcome.run.jobsFound}`);
}
