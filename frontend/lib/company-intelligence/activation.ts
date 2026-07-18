import type { SupabaseDataClient } from "../supabase/client.ts";
import { retrieveOfficialCompanyFacts, type OfficialCompanyRetrieval } from "./official-company-retriever.ts";

type CompanyRow = { id: string; official_domain: string; identity_confidence: number };
type PersistenceStatus = { changed?: boolean; observationCreated?: boolean };
type PersistenceResult = PersistenceStatus | { persist_company_intelligence_observation?: PersistenceStatus };

const persistenceStatus = (result: PersistenceResult | null | undefined): PersistenceStatus | undefined => {
  if (!result) return undefined;
  if ("persist_company_intelligence_observation" in result) return result.persist_company_intelligence_observation;
  if ("changed" in result || "observationCreated" in result) return result;
  return undefined;
};

export type CompanyIntelligenceActivationSummary = {
  version: "company-intelligence-activation-v2";
  approved: number;
  eligible: number;
  attempted: number;
  retrieved: number;
  useful: number;
  persisted: number;
  unchanged: number;
  failed: number;
  facts: number;
  bytes: number;
  durationMs: number;
  failures: Record<string, number>;
  aiTokens: 0;
};

const errorCode = (error: unknown) => typeof error === "object" && error && "code" in error && typeof error.code === "string" ? error.code : "COMPANY_INTELLIGENCE_RETRIEVAL_FAILED";
const validHostname = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function parseCompanyIntelligenceActivationDomains(value: string | undefined): string[] {
  return [...new Set((value ?? "").split(",").map((item) => item.trim().toLowerCase().replace(/\.$/, "")).filter((item) => validHostname.test(item)))].slice(0, 25);
}

/** Bounded sequential activation avoids bursts against official company websites. */
export async function activateCompanyIntelligence(client: SupabaseDataClient, workspaceId: string, options: { maximumCompanies: number; approvedDomains: string[]; retriever?: (input: { officialDomain: string; observedAt: string }) => Promise<OfficialCompanyRetrieval> }): Promise<CompanyIntelligenceActivationSummary> {
  const started = performance.now();
  const limit = Math.max(0, Math.min(25, Math.trunc(options.maximumCompanies)));
  const approvedDomains = parseCompanyIntelligenceActivationDomains(options.approvedDomains.join(","));
  const retriever = options.retriever ?? retrieveOfficialCompanyFacts;
  const summary: CompanyIntelligenceActivationSummary = { version: "company-intelligence-activation-v2", approved: approvedDomains.length, eligible: 0, attempted: 0, retrieved: 0, useful: 0, persisted: 0, unchanged: 0, failed: 0, facts: 0, bytes: 0, durationMs: 0, failures: {}, aiTokens: 0 };
  if (!limit || !approvedDomains.length) return summary;
  const approvedFilter = approvedDomains.join(",");
  const response = await client.request<CompanyRow[]>(`companies?select=id,official_domain,identity_confidence&workspace_id=eq.${workspaceId}&archived_at=is.null&official_domain=in.(${approvedFilter})&identity_confidence=gte.80&order=last_verified_at.asc.nullsfirst&limit=${Math.min(limit, approvedDomains.length)}`);
  if (response.error) throw new Error(`Company intelligence cohort could not be loaded: ${response.error.message}`);
  const companies = response.data ?? [];
  summary.eligible = companies.length;
  for (const company of companies) {
    summary.attempted += 1;
    try {
      const observedAt = new Date().toISOString();
      const result = await retriever({ officialDomain: company.official_domain, observedAt });
      summary.retrieved += 1;
      summary.bytes += result.bytes;
      summary.facts += result.facts.length;
      if (!result.facts.length) { summary.unchanged += 1; continue; }
      summary.useful += 1;
      const persisted = await client.request<PersistenceResult>("rpc/persist_company_intelligence_observation", { method: "POST", body: JSON.stringify({ target_workspace: workspaceId, target_company: company.id, source_url: result.sourceUrl, observed_at: observedAt, target_fingerprint: result.fingerprint, facts: result.facts }) });
      if (persisted.error) throw Object.assign(new Error(persisted.error.message), { code: persisted.error.code ?? "COMPANY_INTELLIGENCE_PERSISTENCE_FAILED" });
      const data = persistenceStatus(persisted.data);
      if (data?.changed) summary.persisted += 1; else summary.unchanged += 1;
    } catch (error) {
      summary.failed += 1;
      const code = errorCode(error);
      summary.failures[code] = (summary.failures[code] ?? 0) + 1;
    }
  }
  summary.durationMs = Math.round(performance.now() - started);
  return summary;
}
