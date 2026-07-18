import { CompaniesWorkspace } from "@/components/companies/companies-workspace";
import { companies } from "@/data/companies";
import { LiveCompanies, type LiveCompanyRecord } from "@/components/companies/live-companies";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type CompanyRow = { id: string; name: string; country?: string; official_domain?: string; careers_url?: string; ats_provider?: string; identity_confidence: number; last_observed_at?: string; payload?: Record<string, unknown> };
type DirectoryMetrics = { canonicalEmployers?: number; verifiedEmployers?: number; hiringEmployers?: number; monitoredEmployerSources?: number };

function intelligenceNumber(payload: Record<string, unknown> | undefined, field: string) {
  const intelligence = payload?.intelligence;
  if (!intelligence || typeof intelligence !== "object") return 0;
  const value = (intelligence as Record<string, unknown>)[field];
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export default async function CompaniesPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") return <CompaniesWorkspace companies={companies}/>;
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/companies");
  const client = createServerSupabaseClient(resolved.accessToken);
  const workspaceId = resolved.context.workspace!.workspaceId;
  const [companyResponse, metricsResponse] = await Promise.all([
    client.request<CompanyRow[]>(`companies?select=id,name,country,official_domain,careers_url,ats_provider,identity_confidence,last_observed_at,payload&workspace_id=eq.${workspaceId}&archived_at=is.null&canonical_key=not.is.null&order=name.asc&limit=1000`),
    client.request<DirectoryMetrics>("rpc/get_company_directory_metrics", { method: "POST", body: JSON.stringify({ target_workspace: workspaceId }) }),
  ]);
  if (companyResponse.error) throw new Error("Canonical company evidence could not be loaded safely.");
  const live: LiveCompanyRecord[] = (companyResponse.data ?? []).map((company) => {
    const opportunityCount = intelligenceNumber(company.payload, "activeOpportunities");
    return {
      name: company.name,
      website: company.official_domain ? `https://${company.official_domain}` : undefined,
      careersUrl: company.careers_url,
      country: company.country,
      opportunityCount,
      executiveOpportunityCount: intelligenceNumber(company.payload, "executiveOpportunities"),
      sourceNames: company.ats_provider ? [company.ats_provider] : [],
      confidenceScores: company.identity_confidence > 0 ? [company.identity_confidence] : [],
      relevanceScores: [],
      lastObservedAt: company.last_observed_at,
    };
  }).filter((company) => company.opportunityCount > 0);
  return <LiveCompanies companies={live} canonicalEmployers={metricsResponse.data?.canonicalEmployers} verifiedEmployers={metricsResponse.data?.verifiedEmployers} monitoredSources={metricsResponse.data?.monitoredEmployerSources}/>;
}
