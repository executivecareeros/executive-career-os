import "server-only";

import { randomUUID } from "node:crypto";
import type { SupabaseDataClient } from "@/lib/supabase/client";
import { createSchedulerSupabaseClient } from "@/lib/supabase/scheduler";

export type NetworkOpportunityRow = {
  id: string;
  domain_id: string;
  company_id?: string;
  version: number;
  payload: Record<string, unknown>;
  updated_at?: string;
};

export type NetworkCompanyRow = {
  id: string;
  domain_id: string;
  name: string;
  country?: string;
  industry?: string;
  ownership_type?: string;
  canonical_key?: string;
  aliases?: unknown[];
  official_domain?: string;
  careers_url?: string;
  ats_provider?: string;
  identity_confidence: number;
  first_discovered_at?: string;
  last_observed_at?: string;
  last_verified_at?: string;
  payload?: Record<string, unknown>;
};

export type NetworkCoverageMetrics = {
  measuredAt?: string;
  canonicalOpportunities?: number;
  employers?: number;
  freshOpportunities?: number;
};

/**
 * A bounded live decision window. Large enough to give Search and Atlas broad
 * employer/geography coverage, while keeping authenticated page payloads fast
 * on mobile. All opportunity decision surfaces must use the same window.
 */
export const EXECUTIVE_OPPORTUNITY_CANDIDATE_LIMIT = 1_000;

let networkWorkspaceCache: { id: string; expiresAt: number } | undefined;

export async function resolveOpportunityNetworkWorkspace() {
  if (networkWorkspaceCache && networkWorkspaceCache.expiresAt > Date.now()) return networkWorkspaceCache.id;
  const client = createSchedulerSupabaseClient();
  const schedules = await client.request<Array<{ workspace_id: string }>>("opportunity_provider_schedules?select=workspace_id&enabled=eq.true&order=created_at.asc&limit=1");
  const id = schedules.data?.[0]?.workspace_id;
  if (schedules.error || !id) throw new Error("The Opportunity Network is not configured.");
  networkWorkspaceCache = { id, expiresAt: Date.now() + 60_000 };
  return id;
}

export async function loadNetworkOpportunities(limit = EXECUTIVE_OPPORTUNITY_CANDIDATE_LIMIT) {
  const client = createSchedulerSupabaseClient(), workspaceId = await resolveOpportunityNetworkWorkspace();
  const projection = [
    "id", "domain_id", "company_id", "version", "updated_at",
    "companyName:payload->>companyName", "companyInitials:payload->>companyInitials", "jobTitle:payload->>jobTitle",
    "location:payload->>location", "country:payload->>country", "workArrangement:payload->>workArrangement",
    "employmentType:payload->>employmentType", "industry:payload->>industry", "companySize:payload->>companySize",
    "source:payload->>source", "sourceUrl:payload->>sourceUrl", "canonicalUrl:payload->>canonicalUrl",
    "verificationStatus:payload->>verificationStatus", "publishedAt:payload->>publishedAt", "discoveredAt:payload->>discoveredAt",
    "salaryMin:payload->>salaryMin", "salaryMax:payload->>salaryMax", "salaryCurrency:payload->>salaryCurrency",
    "salaryDisclosure:payload->>salaryDisclosure", "executiveFitScore:payload->>executiveFitScore",
    "strategicOpportunityScore:payload->>strategicOpportunityScore", "overallScore:payload->>overallScore",
    "confidenceScore:payload->>confidenceScore", "completenessScore:payload->>completenessScore",
    "status:payload->>status", "priority:payload->>priority", "travelRequirement:payload->>travelRequirement",
    "requiredSkills:payload->requiredSkills", "matchingStrengths:payload->matchingStrengths", "riskFlags:payload->riskFlags",
    "exclusions:payload->exclusions", "freshness:payload->freshness", "industryClassification:payload->industryClassification",
  ].join(",");
  const response = await client.request<Array<Omit<NetworkOpportunityRow, "payload"> & Record<string, unknown>>>(`opportunities?select=${projection}&workspace_id=eq.${workspaceId}&archived_at=is.null&domain_id=like.discovered-*&status=in.(Discovered,Evaluating,Qualified,Ready%20to%20Apply,Applied,Interview)&order=updated_at.desc&limit=${Math.max(1, Math.min(EXECUTIVE_OPPORTUNITY_CANDIDATE_LIMIT, limit))}`);
  if (response.error) throw new Error("The Opportunity Network could not be loaded safely.");
  return (response.data ?? []).map((row) => {
    const { id, domain_id, company_id, version, updated_at, ...payload } = row;
    return { id, domain_id, company_id, version, updated_at, payload } satisfies NetworkOpportunityRow;
  });
}

export async function loadNetworkOpportunity(domainId: string) {
  if (!domainId.startsWith("discovered-") || domainId.length > 300) return undefined;
  const client = createSchedulerSupabaseClient(), workspaceId = await resolveOpportunityNetworkWorkspace();
  const response = await client.request<NetworkOpportunityRow[]>(`opportunities?select=id,domain_id,company_id,version,payload,updated_at&workspace_id=eq.${workspaceId}&domain_id=eq.${encodeURIComponent(domainId)}&archived_at=is.null&limit=1`);
  if (response.error) throw new Error("The opportunity could not be loaded safely.");
  return response.data?.[0];
}

export async function loadNetworkOpportunitiesForCompany(companyId: string, limit = 500) {
  const client = createSchedulerSupabaseClient(), workspaceId = await resolveOpportunityNetworkWorkspace();
  const response = await client.request<NetworkOpportunityRow[]>(`opportunities?select=id,domain_id,company_id,version,payload,updated_at&workspace_id=eq.${workspaceId}&company_id=eq.${companyId}&archived_at=is.null&order=updated_at.desc&limit=${Math.max(1, Math.min(500, limit))}`);
  if (response.error) throw new Error("Company opportunities could not be loaded safely.");
  return response.data ?? [];
}

export async function loadNetworkCompanies() {
  const client = createSchedulerSupabaseClient(), workspaceId = await resolveOpportunityNetworkWorkspace();
  const rows: NetworkCompanyRow[] = [], pageSize = 1_000;
  for (let offset = 0; ; offset += pageSize) {
    const response = await client.request<NetworkCompanyRow[]>(`companies?select=id,domain_id,name,country,industry,ownership_type,canonical_key,aliases,official_domain,careers_url,ats_provider,identity_confidence,first_discovered_at,last_observed_at,last_verified_at,payload&workspace_id=eq.${workspaceId}&archived_at=is.null&canonical_key=not.is.null&order=name.asc`, { headers: { Range: `${offset}-${offset + pageSize - 1}` } });
    if (response.error) throw new Error("The company network could not be loaded safely.");
    const page = response.data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

export async function loadNetworkCoverageMetrics() {
  const client = createSchedulerSupabaseClient(), workspaceId = await resolveOpportunityNetworkWorkspace();
  const response = await client.request<NetworkCoverageMetrics>("rpc/get_operational_coverage_summary", {
    method: "POST",
    body: JSON.stringify({ target_workspace: workspaceId }),
  });
  if (response.error) throw new Error("The live Opportunity Network metrics could not be measured safely.");
  return response.data;
}

export async function loadNetworkCompanyByName(name: string) {
  const client = createSchedulerSupabaseClient(), workspaceId = await resolveOpportunityNetworkWorkspace();
  const response = await client.request<NetworkCompanyRow[]>(`companies?select=id,domain_id,name,country,industry,ownership_type,canonical_key,aliases,official_domain,careers_url,ats_provider,identity_confidence,first_discovered_at,last_observed_at,last_verified_at,payload&workspace_id=eq.${workspaceId}&name=eq.${encodeURIComponent(name)}&archived_at=is.null&limit=1`);
  if (response.error) throw new Error("The company could not be loaded safely.");
  return response.data?.[0];
}

export async function materializeNetworkOpportunity(client: SupabaseDataClient, workspaceId: string, executiveId: string, domainId: string): Promise<NetworkOpportunityRow> {
  const existing = await client.request<NetworkOpportunityRow[]>(`opportunities?select=id,domain_id,company_id,version,payload,updated_at&workspace_id=eq.${workspaceId}&domain_id=eq.${encodeURIComponent(domainId)}&archived_at=is.null&limit=1`);
  if (existing.error) throw new Error("The private opportunity context could not be checked safely.");
  if (existing.data?.[0]) return existing.data[0];
  const source = await loadNetworkOpportunity(domainId);
  if (!source) throw new Error("The canonical opportunity is no longer available.");
  const networkClient = createSchedulerSupabaseClient();
  const networkWorkspace = await resolveOpportunityNetworkWorkspace();
  const companyResponse = source.company_id ? await networkClient.request<NetworkCompanyRow[]>(`companies?select=id,domain_id,name,country,industry,ownership_type,canonical_key,aliases,official_domain,careers_url,ats_provider,identity_confidence,first_discovered_at,last_observed_at,last_verified_at,payload&workspace_id=eq.${networkWorkspace}&id=eq.${source.company_id}&limit=1`) : undefined;
  const sourceCompany = companyResponse?.data?.[0];
  let privateCompanyId: string | undefined;
  if (sourceCompany) {
    const companyKey = sourceCompany.canonical_key ?? sourceCompany.domain_id;
    const matched = await client.request<Array<{ id: string }>>(`companies?select=id&workspace_id=eq.${workspaceId}&canonical_key=eq.${encodeURIComponent(companyKey)}&archived_at=is.null&limit=1`);
    if (matched.error) throw new Error("The private company context could not be checked safely.");
    privateCompanyId = matched.data?.[0]?.id;
    if (!privateCompanyId) {
      privateCompanyId = randomUUID();
      const createdCompany = await client.request("companies", { method: "POST", body: JSON.stringify({ ...sourceCompany, id: privateCompanyId, workspace_id: workspaceId, domain_id: `network-company-${privateCompanyId}`, canonical_key: companyKey, payload: { ...(sourceCompany.payload ?? {}), networkSourceCompanyId: sourceCompany.id }, created_by: executiveId }) });
      if (createdCompany.error) throw new Error("The company could not be added to the private decision context.");
    }
  }
  const id = randomUUID();
  const payload: Record<string, unknown> = { ...source.payload, networkSourceOpportunityId: source.id, networkObservedAt: source.updated_at };
  const created = await client.request<NetworkOpportunityRow[]>("opportunities", { method: "POST", body: JSON.stringify({ id, domain_id: source.domain_id, workspace_id: workspaceId, company_id: privateCompanyId ?? null, title: String(payload.jobTitle ?? "Untitled opportunity"), country: String(payload.country ?? "Unknown"), industry: String(payload.industry ?? "Unknown"), status: String(payload.status ?? "Discovered"), source_url: typeof payload.sourceUrl === "string" ? payload.sourceUrl : null, payload, created_by: executiveId }) });
  if (created.error) throw new Error("The opportunity could not be added to the private decision context.");
  return created.data?.[0] ?? { id, domain_id: source.domain_id, company_id: privateCompanyId, version: 1, payload };
}
