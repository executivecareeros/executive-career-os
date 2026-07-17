import { CompaniesWorkspace } from "@/components/companies/companies-workspace";
import { companies } from "@/data/companies";
import { LiveCompanies, type LiveCompanyRecord } from "@/components/companies/live-companies";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type CompanyRow = { id: string; name: string; country?: string; official_domain?: string; careers_url?: string; ats_provider?: string; identity_confidence: number; last_observed_at?: string };
type OpportunityRow = { domain_id: string; company_id?: string; payload: Record<string, unknown> };

export default async function CompaniesPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") return <CompaniesWorkspace companies={companies}/>;
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/companies");
  const client = createServerSupabaseClient(resolved.accessToken);
  const workspaceId = resolved.context.workspace!.workspaceId;
  const [companyResponse, opportunityResponse] = await Promise.all([
    client.request<CompanyRow[]>(`companies?select=id,name,country,official_domain,careers_url,ats_provider,identity_confidence,last_observed_at&workspace_id=eq.${workspaceId}&archived_at=is.null&order=name.asc`),
    client.request<OpportunityRow[]>(`opportunities?select=domain_id,company_id,payload&workspace_id=eq.${workspaceId}&archived_at=is.null&order=updated_at.desc`),
  ]);
  if (companyResponse.error || opportunityResponse.error) throw new Error("Canonical company evidence could not be loaded safely.");
  const opportunities = opportunityResponse.data ?? [];
  const live: LiveCompanyRecord[] = (companyResponse.data ?? []).map((company) => {
    const linked = opportunities.filter((opportunity) => opportunity.company_id === company.id);
    return {
      name: company.name,
      website: company.official_domain ? `https://${company.official_domain}` : undefined,
      careersUrl: company.careers_url,
      country: company.country,
      opportunityCount: linked.length,
      executiveOpportunityCount: linked.filter(({ payload }) => /\b(chief|president|vice president|vp|director|head of|general manager|managing director|executive)\b/i.test(String(payload.jobTitle ?? ""))).length,
      opportunityIds: linked.map((opportunity) => opportunity.domain_id),
      sourceNames: company.ats_provider ? [company.ats_provider] : [],
      confidenceScores: company.identity_confidence > 0 ? [company.identity_confidence] : [],
      relevanceScores: linked.flatMap(({ payload }) => typeof payload.overallScore === "number" ? [payload.overallScore] : []),
      lastObservedAt: company.last_observed_at,
    };
  }).filter((company) => company.opportunityCount > 0);
  return <LiveCompanies companies={live}/>;
}
