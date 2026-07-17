import { OpportunitiesWorkspace } from "@/components/opportunities/opportunities-workspace";
import { OpportunityUniverseEmpty } from "@/components/opportunities/opportunity-universe-empty";
import { opportunities } from "@/data/opportunities";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toLiveOpportunity } from "@/lib/live-opportunity";
import { LiveOpportunityUniverse } from "@/components/opportunities/live-opportunity-universe";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";
import { redirect } from "next/navigation";
import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";
import type { Opportunity } from "@/types/opportunity";
import { confirmGeographicProfileAction, importLinkedInJobAlert, importLinkedInOpportunity, refreshOpportunityBoard } from "./actions";
import { getLocale } from "@/lib/locale";
import { loadExecutiveGeographicProfile } from "@/lib/geographic-profile-repository";
import { unknownGeographicProfile } from "@/lib/opportunity-geography";
import { currentSession } from "@/lib/auth/session";

type OpportunityRow = { domain_id: string; payload: Record<string, unknown> };

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getLocale();
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") {
    const resolved = await resolveAuthenticatedRepositoryContext();
    if (!resolved) redirect("/login?next=/opportunities");
    let opportunity: LiveOpportunityViewModel | undefined;
    let collected: Opportunity[] = [];
    let confirmedRoleCount = 0;
    let geographicProfile = unknownGeographicProfile();
    let unavailable = false;
    const session = await currentSession();
    const founderEmail = process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase();
    const canConfirmFounderFixture = Boolean(founderEmail && session?.user.email?.trim().toLowerCase() === founderEmail);
    try {
      const view = await new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken), resolved.context).load();
      geographicProfile = await loadExecutiveGeographicProfile(createServerSupabaseClient(resolved.accessToken), resolved.context);
      opportunity = toLiveOpportunity(view);
      if ((await searchParams).cv === "complete") {
        const history = await createServerSupabaseClient(resolved.accessToken).request<Array<{ id: string }>>(`professional_experiences?select=id&workspace_id=eq.${resolved.context.workspace!.workspaceId}&executive_identity_id=eq.${resolved.context.workspace!.executiveId}&archived_at=is.null`);
        if (history.error) throw new Error(history.error.message);
        confirmedRoleCount = history.data?.length ?? 0;
      }
      const rows = await createServerSupabaseClient(resolved.accessToken).request<OpportunityRow[]>(`opportunities?select=domain_id,payload&workspace_id=eq.${resolved.context.workspace!.workspaceId}&archived_at=is.null&order=updated_at.desc`);
      if (rows.error) throw new Error(rows.error.message);
      collected = (rows.data ?? []).filter((row) => row.domain_id.startsWith("discovered-")).map((row) => ({ ...row.payload, id: row.domain_id }) as Opportunity);
      // Once the live universe contains attributable collected opportunities,
      // keep the earlier acceptance-workflow record in its historical context
      // instead of presenting it as a current market opportunity.
      if (collected.length > 0) opportunity = undefined;
    } catch {
      unavailable = true;
    }
    if (unavailable) return <LiveWorkspaceEmptyState eyebrow="Executive Opportunity Universe" title="Your opportunities are temporarily unavailable" description="ORENDALIS could not safely load your private opportunity context." emptyTitle="Your records remain unchanged" emptyDescription="No empty state or recommendation is being inferred from this interruption. Return to Today and try again when the connection is available." actionHref="/" actionLabel="Return to Today" />;
    const query = await searchParams;
    if (opportunity || collected.length) return <LiveOpportunityUniverse locale={locale} opportunity={opportunity} collected={collected} geographicProfile={geographicProfile} canConfirmFounderFixture={canConfirmFounderFixture} profileConfirmationAction={confirmGeographicProfileAction} initialQuery={typeof query.q === "string" ? query.q : ""} collectionNotice={typeof query.collection === "string" ? query.collection : undefined} collectionMessage={typeof query.message === "string" ? query.message : undefined} imported={typeof query.imported === "string" ? query.imported : undefined} found={typeof query.found === "string" ? query.found : undefined} linkedInNotice={typeof query.linkedin === "string" ? query.linkedin : undefined} verification={typeof query.verification === "string" ? query.verification : undefined} linkedInResetKey={typeof query.completedAt === "string" ? query.completedAt : undefined} cvComplete={query.cv === "complete"} savedRoles={query.cv === "complete" ? String(confirmedRoleCount) : typeof query.roles === "string" ? query.roles : undefined} newRoles={typeof query.newRoles === "string" ? query.newRoles : undefined} collectionAction={refreshOpportunityBoard} linkedInAction={importLinkedInOpportunity} alertAction={importLinkedInJobAlert} />;
    return <OpportunityUniverseEmpty locale={locale} collectionAction={refreshOpportunityBoard} linkedInAction={importLinkedInOpportunity} alertAction={importLinkedInJobAlert} linkedInNotice={typeof query.linkedin === "string" ? query.linkedin : undefined} message={typeof query.message === "string" ? query.message : undefined} cvComplete={query.cv === "complete"} savedRoles={query.cv === "complete" ? String(confirmedRoleCount) : undefined} newRoles={typeof query.newRoles === "string" ? query.newRoles : undefined} />;
  }
  return <OpportunitiesWorkspace opportunities={opportunities} />;
}
