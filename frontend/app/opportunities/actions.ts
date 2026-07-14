"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { providerFromCareersUrl } from "@/lib/discovery/providers/factory";
import { OpportunityCoverageEngine } from "@/lib/discovery/coverage-engine";
import { recordDiscoveryRun, SupabaseOpportunityIngestionSink } from "@/lib/discovery/supabase-ingestion";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildExecutiveOpportunityIntelligence, opportunityIntelligenceBlueprint } from "@/lib/opportunity-intelligence";
import type { Opportunity } from "@/types/opportunity";
import type { OpportunityProvider } from "@/lib/discovery/types";

type DecisionAction = "Pursue" | "Watch" | "Skip";
type OpportunityDecisionRow = { id: string; domain_id: string; version: number; payload: Record<string, unknown> };
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
  const [record, universe, blueprint] = await Promise.all([
    client.request<OpportunityDecisionRow[]>(`opportunities?select=id,domain_id,version,payload&workspace_id=eq.${workspaceId}&domain_id=eq.${encodeURIComponent(canonicalId)}&archived_at=is.null&limit=1`),
    client.request<OpportunityDecisionRow[]>(`opportunities?select=id,domain_id,version,payload&workspace_id=eq.${workspaceId}&archived_at=is.null`),
    client.request<BlueprintDecisionRow[]>(`executive_blueprint_revisions?select=id,payload&workspace_id=eq.${workspaceId}&order=revision_number.desc&limit=1`),
  ]);
  if (record.error || universe.error || blueprint.error) throw new Error("The private decision context could not be loaded safely.");
  const row = record.data?.[0], blueprintRow = blueprint.data?.[0];
  if (!row) throw new Error("The canonical opportunity is no longer available.");
  if (!blueprintRow) throw new Error("Complete the Executive Blueprint before finalizing this decision.");
  return { resolved, client, workspaceId, row, blueprintRow, universe: (universe.data ?? []).filter(item => item.domain_id.startsWith("discovered-")).map(item => ({ ...item.payload, id: item.domain_id }) as Opportunity) };
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
  const { client, workspaceId, row, blueprintRow, universe } = await decisionContext(canonicalId);
  const draft = row.payload.executiveDecisionDraft as { action?: string } | undefined;
  if (draft?.action !== decision) throw new Error("The confirmed action does not match the current selection.");
  const canonical = { ...row.payload, id: row.domain_id } as Opportunity;
  const intelligence = buildExecutiveOpportunityIntelligence(canonical, opportunityIntelligenceBlueprint(blueprintRow.payload, blueprintRow.id), universe);
  const snapshot = { ...intelligence, blueprintRevisionId: blueprintRow.id, opportunityRevision: row.version, opportunityRevisionId: row.domain_id, intelligenceVersion: "deterministic-opportunity-intelligence-1", rulesVersion: "opportunity-intelligence-1", capturedAt: new Date().toISOString(), contributingFactors: { blueprintComparisons: intelligence.blueprintComparisons, sourceCount: intelligence.provenance.length }, classifiedEvidence: intelligence.evidence, executiveQuestions: intelligence.missingInformation.map(item => `What evidence would resolve: ${item}?`) };
  const result = await client.request<Record<string, string>>("rpc/finalize_collected_opportunity_decision", { method: "POST", body: JSON.stringify({ request: { workspaceId, opportunityId: row.id, opportunityVersion: row.version, blueprintRevisionId: blueprintRow.id, idempotencyKey, selectedAction: decision, intelligence: snapshot } }) });
  if (result.error) throw new Error(result.error.message);
  ["/", "/opportunities", `/opportunities/${canonicalId}`, "/archive", "/tasks", "/productivity"].forEach(path => revalidatePath(path));
  redirect(`/opportunities/${encodeURIComponent(canonicalId)}?decision=complete`);
}

export async function refreshOpportunityBoard(formData: FormData) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/opportunities");
  let provider: OpportunityProvider;
  try { provider = providerFromCareersUrl(String(formData.get("board") ?? "")); }
  catch (error) { redirect(`/opportunities?collection=error&message=${encodeURIComponent(error instanceof Error ? error.message : "The careers board could not be read.")}`); }
  const client = createServerSupabaseClient(resolved.accessToken);
  const requestedAt = new Date().toISOString();
  const engine = new OpportunityCoverageEngine(new SupabaseOpportunityIngestionSink(client, resolved.context)).register(provider, { priority: 1, enabled: true, maximumResults: 100 });
  await engine.enqueue(provider.id, { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] }, requestedAt);
  const outcome = await engine.runNext(requestedAt);
  if (!outcome) redirect("/opportunities?collection=error&message=No%20collection%20run%20was%20available.");
  try { await recordDiscoveryRun(client, resolved.context, outcome); } catch { /* Collection remains visible if the secondary monitoring record fails. */ }
  revalidatePath("/opportunities");
  if (outcome.run.status === "failed") redirect(`/opportunities?collection=error&message=${encodeURIComponent(outcome.run.errors[0]?.message ?? "Opportunity collection failed.")}`);
  redirect(`/opportunities?collection=complete&imported=${outcome.run.jobsImported}&found=${outcome.run.jobsFound}`);
}
