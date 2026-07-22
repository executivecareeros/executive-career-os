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
import { confirmGeographicProfileAction, refreshOpportunityBoard } from "./actions";
import { loadExecutiveGeographicProfile } from "@/lib/geographic-profile-repository";
import { executiveCareerContextFromRows, unknownGeographicProfile, type ExecutiveCareerContext } from "@/lib/opportunity-geography";
import { currentSession } from "@/lib/auth/session";
import { EXECUTIVE_OPPORTUNITY_CANDIDATE_LIMIT, loadNetworkOpportunities } from "@/lib/opportunity-network";

type OpportunityListRow = Record<string, unknown> & { domain_id: string };
type ExperienceRow = { id: string; role_title?: string; notes?: string };

function listOpportunity(row: OpportunityListRow): Opportunity {
  const number = (value: unknown) => value === null || value === undefined || value === "" ? undefined : Number(value);
  const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  return {
    ...row, id: row.domain_id, companyName: String(row.companyName ?? "Unknown employer"), companyInitials: String(row.companyInitials ?? "—"),
    jobTitle: String(row.jobTitle ?? "Untitled opportunity"), location: String(row.location ?? "Location not specified"), country: String(row.country ?? "Unknown"),
    workArrangement: (row.workArrangement ?? "Unknown") as Opportunity["workArrangement"], employmentType: (row.employmentType ?? "Unknown") as Opportunity["employmentType"],
    industry: String(row.industry ?? "Unknown"), companySize: String(row.companySize ?? "Unknown"), source: String(row.source ?? "Employer"),
    publishedAt: String(row.publishedAt ?? row.discoveredAt ?? "1970-01-01T00:00:00.000Z"), discoveredAt: String(row.discoveredAt ?? row.publishedAt ?? "1970-01-01T00:00:00.000Z"),
    salaryMin: number(row.salaryMin), salaryMax: number(row.salaryMax), executiveFitScore: number(row.executiveFitScore) ?? 0,
    strategicOpportunityScore: number(row.strategicOpportunityScore) ?? 0, overallScore: number(row.overallScore) ?? 0, confidenceScore: number(row.confidenceScore) ?? 0,
    completenessScore: number(row.completenessScore), status: (row.status ?? "Discovered") as Opportunity["status"], priority: (row.priority ?? "Low") as Opportunity["priority"],
    travelRequirement: String(row.travelRequirement ?? "Unknown"), summary: String(row.summary ?? ""), keyResponsibilities: strings(row.keyResponsibilities), requiredSkills: strings(row.requiredSkills), preferredSkills: strings(row.preferredSkills),
    matchingStrengths: strings(row.matchingStrengths), missingRequirements: [], riskFlags: strings(row.riskFlags), exclusions: strings(row.exclusions), decisionRationale: "",
    recommendedCVProfile: "", coverLetterRecommended: false, notes: "",
  } as Opportunity;
}

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") {
    const resolved = await resolveAuthenticatedRepositoryContext();
    if (!resolved) redirect("/login?next=/opportunities");
    let opportunity: LiveOpportunityViewModel | undefined;
    let collected: Opportunity[] = [];
    let confirmedRoleCount = 0;
    let geographicProfile = unknownGeographicProfile();
    let executiveCareerContext: ExecutiveCareerContext = { roleTitles: [], industries: [], capabilities: [], languages: [] };
    let unavailable = false;
    const session = await currentSession();
    const founderEmail = process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase();
    const canConfirmFounderFixture = Boolean(founderEmail && session?.user.email?.trim().toLowerCase() === founderEmail);
    try {
      let view;
      try {
        view = await new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken), resolved.context).load();
      } catch (error) {
        // Public accounts receive a personal workspace, not the retired beta
        // acceptance fixture. Its absence must never block the live network.
        if (!(error instanceof Error) || error.message !== "Beta workflow was not provisioned for this invitation.") throw error;
      }
      geographicProfile = await loadExecutiveGeographicProfile(createServerSupabaseClient(resolved.accessToken), resolved.context);
      opportunity = view ? toLiveOpportunity(view) : undefined;
      const history = await createServerSupabaseClient(resolved.accessToken).request<ExperienceRow[]>(`professional_experiences?select=id,role_title,notes&workspace_id=eq.${resolved.context.workspace!.workspaceId}&executive_identity_id=eq.${resolved.context.workspace!.executiveId}&archived_at=is.null`);
      if (history.error) throw new Error(history.error.message);
      executiveCareerContext = executiveCareerContextFromRows(history.data ?? []);
      confirmedRoleCount = history.data?.length ?? 0;
      const rows = await loadNetworkOpportunities(EXECUTIVE_OPPORTUNITY_CANDIDATE_LIMIT);
      collected = rows.map((row) => listOpportunity({ ...row.payload, domain_id: row.domain_id }));
      // Once the live universe contains attributable collected opportunities,
      // keep the earlier acceptance-workflow record in its historical context
      // instead of presenting it as a current market opportunity.
      if (collected.length > 0) opportunity = undefined;
    } catch {
      unavailable = true;
    }
    if (unavailable) return <LiveWorkspaceEmptyState eyebrow="Executive Opportunity Universe" title="Your opportunities are temporarily unavailable" description="ORENDALIS could not safely load your private opportunity context." emptyTitle="Your records remain unchanged" emptyDescription="No empty state or recommendation is being inferred from this interruption. Return to Today and try again when the connection is available." actionHref="/" actionLabel="Return to Today" />;
    const query = await searchParams;
    if (opportunity || collected.length) return <LiveOpportunityUniverse opportunity={opportunity} collected={collected} geographicProfile={geographicProfile} careerContext={executiveCareerContext} canConfirmFounderFixture={canConfirmFounderFixture} profileConfirmationAction={confirmGeographicProfileAction} initialQuery={typeof query.q === "string" ? query.q : ""} collectionNotice={typeof query.collection === "string" ? query.collection : undefined} collectionMessage={typeof query.message === "string" ? query.message : undefined} imported={typeof query.imported === "string" ? query.imported : undefined} found={typeof query.found === "string" ? query.found : undefined} cvComplete={query.cv === "complete"} savedRoles={query.cv === "complete" ? String(confirmedRoleCount) : typeof query.roles === "string" ? query.roles : undefined} newRoles={typeof query.newRoles === "string" ? query.newRoles : undefined} collectionAction={refreshOpportunityBoard} />;
    return <OpportunityUniverseEmpty collectionAction={refreshOpportunityBoard} cvComplete={query.cv === "complete"} profileComplete={confirmedRoleCount > 0} savedRoles={String(confirmedRoleCount)} newRoles={typeof query.newRoles === "string" ? query.newRoles : undefined} />;
  }
  return <OpportunitiesWorkspace opportunities={opportunities} />;
}
