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

type OpportunityRow = { id: string; domain_id: string; version: number; payload: Record<string, unknown> };
type BlueprintRow = { id: string; payload: Record<string, unknown> };

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({ id: opportunity.id }));
}

export default async function OpportunityDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ decision?: string }> }) {
  const locale = await getLocale();
  const { id } = await params;
  const query = await searchParams;
  const opportunity = getOpportunityById(id);
  if (opportunity) return <><OpportunityDetail opportunity={opportunity} company={getCompanyByOpportunityId(id)} /><div className="mx-auto max-w-7xl px-5 pb-8 sm:px-6 lg:px-10"><KnowledgePanel entityId={opportunity.id} title="Opportunity Knowledge Context"/></div></>;
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") notFound();
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect(`/login?next=${encodeURIComponent(`/opportunities/${id}`)}`);
  const client = createServerSupabaseClient(resolved.accessToken);
  const workspaceId = resolved.context.workspace!.workspaceId;
  const [record, universe, blueprint, geographicProfile] = await Promise.all([
    client.request<OpportunityRow[]>(`opportunities?select=id,domain_id,version,payload&workspace_id=eq.${workspaceId}&domain_id=eq.${encodeURIComponent(id)}&archived_at=is.null&limit=1`),
    client.request<OpportunityRow[]>(`opportunities?select=id,domain_id,version,payload&workspace_id=eq.${workspaceId}&archived_at=is.null&order=updated_at.desc`),
    client.request<BlueprintRow[]>(`executive_blueprint_revisions?select=id,payload&workspace_id=eq.${workspaceId}&order=revision_number.desc&limit=1`),
    loadExecutiveGeographicProfile(client, resolved.context),
  ]);
  if (record.error || universe.error || blueprint.error) throw new Error("Private opportunity intelligence could not be loaded safely.");
  const row = record.data?.[0];
  if (!row || !row.domain_id.startsWith("discovered-")) notFound();
  const canonical = { ...row.payload, id: row.domain_id } as Opportunity;
  const all = (universe.data ?? []).filter((item) => item.domain_id.startsWith("discovered-")).map((item) => ({ ...item.payload, id: item.domain_id }) as Opportunity);
  const blueprintRow = blueprint.data?.[0];
  const intelligence = buildExecutiveOpportunityIntelligence(canonical, opportunityIntelligenceBlueprint(blueprintRow?.payload, blueprintRow?.id), all, undefined, geographicProfile);
  return <CollectedOpportunityIntelligence locale={locale} opportunity={canonical} intelligence={intelligence} decisionNotice={query.decision} idempotencyKey={randomUUID()} />;
}
