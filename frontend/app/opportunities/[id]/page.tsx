import { notFound, redirect } from "next/navigation";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { CollectedOpportunityIntelligence } from "@/components/opportunities/collected-opportunity-intelligence";
import { getOpportunityById, opportunities } from "@/data/opportunities";
import { getCompanyByOpportunityId } from "@/data/companies";
import { KnowledgePanel } from "@/components/knowledge/knowledge-panel";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { buildExecutiveOpportunityIntelligence, opportunityIntelligenceBlueprint } from "@/lib/opportunity-intelligence";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/types/opportunity";
import { randomUUID } from "node:crypto";
import { getLocale } from "@/lib/locale";
import { loadExecutiveGeographicProfile } from "@/lib/geographic-profile-repository";
import { AtlasDecisionWorkspacePanel } from "@/components/opportunities/atlas-decision-workspace-panel";
import { loadAtlasDecisionWorkspace } from "@/lib/atlas-decision-workspace-repository";
import { buildProductOpportunityAssessment } from "@/lib/discovery/atlas-product-integration";
import { buildAtlasOpportunityReview } from "@/lib/discovery/atlas-opportunity-review";
import { createAtlasDecisionWorkspace } from "@/lib/discovery/atlas-decision-workspace";
import { executiveCareerContextFromRows } from "@/lib/opportunity-geography";
import { loadNetworkOpportunity, loadNetworkOpportunities } from "@/lib/opportunity-network";

type OpportunityRow = { id: string; domain_id: string; version: number; payload: Record<string, unknown> };
type BlueprintRow = { id: string; payload: Record<string, unknown> };
type ExperienceRow = { role_title?: string; notes?: string };

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({ id: opportunity.id }));
}

export default async function OpportunityDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ decision?: string }> }) {
  const locale = await getLocale();
  const { id } = await params;
  const query = await searchParams;
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") {
    const opportunity = getOpportunityById(id);
    if (!opportunity) notFound();
    return <><OpportunityDetail opportunity={opportunity} company={getCompanyByOpportunityId(id)} /><div className="mx-auto max-w-7xl px-5 pb-8 sm:px-6 lg:px-10"><KnowledgePanel entityId={opportunity.id} title="Opportunity Knowledge Context"/></div></>;
  }
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect(`/login?next=${encodeURIComponent(`/opportunities/${id}`)}`);
  const client = createServerSupabaseClient(resolved.accessToken);
  const workspaceId = resolved.context.workspace!.workspaceId;
  const [networkRecord, universe, privateRecord, blueprint, geographicProfile, experiences] = await Promise.all([
    loadNetworkOpportunity(id),
    loadNetworkOpportunities(300),
    client.request<OpportunityRow[]>(`opportunities?select=id,domain_id,version,payload&workspace_id=eq.${workspaceId}&domain_id=eq.${encodeURIComponent(id)}&archived_at=is.null&limit=1`),
    client.request<BlueprintRow[]>(`executive_blueprint_revisions?select=id,payload&workspace_id=eq.${workspaceId}&order=revision_number.desc&limit=1`),
    loadExecutiveGeographicProfile(client, resolved.context),
    client.request<ExperienceRow[]>(`professional_experiences?select=role_title,notes&workspace_id=eq.${workspaceId}&executive_identity_id=eq.${resolved.context.workspace!.executiveId}&archived_at=is.null`),
  ]);
  if (privateRecord.error || blueprint.error || experiences.error) throw new Error("Private opportunity intelligence could not be loaded safely.");
  const row = privateRecord.data?.[0] ?? networkRecord;
  if (!row || !row.domain_id.startsWith("discovered-")) notFound();
  const canonical = { ...row.payload, id: row.domain_id } as Opportunity;
  const all = universe.map((item) => ({ ...item.payload, id: item.domain_id }) as Opportunity);
  const blueprintRow = blueprint.data?.[0];
  const intelligence = buildExecutiveOpportunityIntelligence(canonical, opportunityIntelligenceBlueprint(blueprintRow?.payload, blueprintRow?.id), all, undefined, geographicProfile, executiveCareerContextFromRows(experiences.data ?? []));
  const privateRow = privateRecord.data?.[0];
  const persistedWorkspace = privateRow ? await loadAtlasDecisionWorkspace(client, workspaceId, privateRow.id) : undefined;
  const stableCreatedAt = canonical.discoveredAt || canonical.lastObservedAt || "2026-01-01T00:00:00.000Z";
  const atlasWorkspace = persistedWorkspace?.workspace ?? createAtlasDecisionWorkspace(buildAtlasOpportunityReview(buildProductOpportunityAssessment(intelligence, stableCreatedAt), stableCreatedAt), stableCreatedAt);
  return <><CollectedOpportunityIntelligence locale={locale} opportunity={canonical} intelligence={intelligence} decisionNotice={query.decision} idempotencyKey={randomUUID()} /><AtlasDecisionWorkspacePanel opportunityId={canonical.id} workspace={atlasWorkspace} persisted={Boolean(persistedWorkspace)}/></>;
}
