import type { SupabaseDataClient } from "@/lib/supabase/client";
import { providerFromCareersUrl } from "./providers/factory.ts";
import type { DiscoveryFilter, DiscoverySourceKind, OpportunityProvider } from "./types.ts";

export const EMPLOYER_SOURCE_BATCH_VERSION = "1.0";
export const MAX_EMPLOYER_SOURCE_BATCH = 1_000;

export type EmployerSourceInput = { employerName: string; employerDomain?: string; careersUrl: string; country?: string; operatingRegions?: readonly string[]; industry?: string; refreshMinutes?: number; maximumResults?: number; priority?: number };
export type PreparedEmployerSource = { inputIndex: number; employerName: string; employerDomain?: string; careersUrl: string; providerId: DiscoverySourceKind; sourceKey: string; country?: string; operatingRegions: readonly string[]; industry?: string; cadenceMinutes: number; maximumResults: number; priority: number; provider: OpportunityProvider };
export type EmployerSourceFailure = { inputIndex: number; employerName?: string; careersUrl?: string; code: "INVALID_INPUT" | "UNSUPPORTED_SOURCE" | "SOURCE_DEGRADED" | "SOURCE_UNAVAILABLE"; message: string };
export type EmployerSourceHealth = PreparedEmployerSource & { healthStatus: "connected" | "degraded" | "unavailable"; healthMessage: string };
export type EmployerSourceBatch = { version: typeof EMPLOYER_SOURCE_BATCH_VERSION; prepared: readonly PreparedEmployerSource[]; failures: readonly EmployerSourceFailure[]; duplicateInputs: number };
export type EmployerSourceScheduleRow = { workspace_id: string; provider_id: DiscoverySourceKind; source_key: string; enabled: boolean; priority: number; maximum_results: number; cadence_minutes: number; timezone: string; next_run_at: string; locator: { url: string; companyName: string; employerDomain?: string; country?: string; operatingRegions: readonly string[]; industry?: string; batchVersion: string }; filters: DiscoveryFilter; compliance_basis: string; rate_limit: { mode: "provider-policy"; concurrency: number }; created_by: string };

const text = (value?: string) => value?.trim() || undefined;
const integer = (value: number | undefined, fallback: number, minimum: number, maximum: number) => Number.isInteger(value) && value! >= minimum && value! <= maximum ? value! : fallback;
const normalizedUrl = (value: string) => { const url = new URL(value.trim()); if (url.protocol !== "https:") throw new Error("Only HTTPS careers sources are supported."); url.hash = ""; url.search = ""; url.pathname = url.pathname.replace(/\/+$/, "") || "/"; return url.toString(); };
const normalizedDomain = (value?: string) => { if (!text(value)) return undefined; const candidate = value!.includes("://") ? new URL(value!) : new URL(`https://${value}`); return candidate.hostname.toLowerCase().replace(/^www\./, ""); };

export function prepareEmployerSourceBatch(inputs: readonly EmployerSourceInput[]): EmployerSourceBatch {
  if (inputs.length > MAX_EMPLOYER_SOURCE_BATCH) throw new Error(`One batch may contain at most ${MAX_EMPLOYER_SOURCE_BATCH} employer sources.`);
  const prepared: PreparedEmployerSource[] = [], failures: EmployerSourceFailure[] = [], seen = new Set<string>(); let duplicateInputs = 0;
  for (const [inputIndex, input] of inputs.entries()) {
    const employerName = text(input.employerName);
    try {
      if (!employerName || !text(input.careersUrl)) throw new Error("Employer name and careers URL are required.");
      const careersUrl = normalizedUrl(input.careersUrl), url = new URL(careersUrl);
      const provider = providerFromCareersUrl(careersUrl, undefined, { companyName: employerName });
      const sourceKey = `${provider.id}:${url.hostname.toLowerCase()}${url.pathname}`;
      if (seen.has(sourceKey)) { duplicateInputs += 1; continue; }
      seen.add(sourceKey);
      prepared.push({ inputIndex, employerName, employerDomain: normalizedDomain(input.employerDomain), careersUrl, providerId: provider.id, sourceKey, country: text(input.country), operatingRegions: [...new Set((input.operatingRegions ?? []).map((region) => region.trim()).filter(Boolean))], industry: text(input.industry), cadenceMinutes: integer(input.refreshMinutes, 720, 15, 43_200), maximumResults: integer(input.maximumResults, 1_000, 1, 10_000), priority: integer(input.priority, 100, 1, 10_000), provider });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Source could not be prepared.";
      failures.push({ inputIndex, employerName, careersUrl: text(input.careersUrl), code: /not available|not supported/i.test(message) ? "UNSUPPORTED_SOURCE" : "INVALID_INPUT", message });
    }
  }
  return { version: EMPLOYER_SOURCE_BATCH_VERSION, prepared, failures, duplicateInputs };
}

export async function validateEmployerSourceBatch(batch: EmployerSourceBatch, concurrency = 6) {
  const validated: EmployerSourceHealth[] = [], failures = [...batch.failures];
  for (let index = 0; index < batch.prepared.length; index += Math.max(1, concurrency)) {
    const results = await Promise.all(batch.prepared.slice(index, index + Math.max(1, concurrency)).map(async (source) => ({ source, health: await source.provider.health() })));
    for (const result of results) {
      if (result.health.status === "connected") validated.push({ ...result.source, healthStatus: result.health.status, healthMessage: result.health.message });
      else failures.push({ inputIndex: result.source.inputIndex, employerName: result.source.employerName, careersUrl: result.source.careersUrl, code: result.health.status === "degraded" ? "SOURCE_DEGRADED" : "SOURCE_UNAVAILABLE", message: result.health.message });
    }
  }
  return { validated, failures, duplicateInputs: batch.duplicateInputs } as const;
}

export function scheduleRowsForEmployerSources(input: { workspaceId: string; actorId: string; now: string; sources: readonly EmployerSourceHealth[] }): EmployerSourceScheduleRow[] {
  const filters: DiscoveryFilter = { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] };
  return input.sources.filter((source) => source.healthStatus === "connected").map((source) => ({ workspace_id: input.workspaceId, provider_id: source.providerId, source_key: source.sourceKey, enabled: true, priority: source.priority, maximum_results: source.maximumResults, cadence_minutes: source.cadenceMinutes, timezone: "UTC", next_run_at: input.now, locator: { url: source.careersUrl, companyName: source.employerName, employerDomain: source.employerDomain, country: source.country, operatingRegions: source.operatingRegions, industry: source.industry, batchVersion: EMPLOYER_SOURCE_BATCH_VERSION }, filters, compliance_basis: "Employer-published public opportunity source; approved provider catalog", rate_limit: { mode: "provider-policy", concurrency: 6 }, created_by: input.actorId }));
}

export async function registerEmployerSourceBatch(client: SupabaseDataClient, input: { workspaceId: string; actorId: string; now?: string; sources: readonly EmployerSourceHealth[] }) {
  const existing = await client.request<{ source_key: string }[]>(`opportunity_provider_schedules?select=source_key&workspace_id=eq.${input.workspaceId}`);
  if (existing.error) throw new Error(existing.error.message);
  const known = new Set((existing.data ?? []).map((row) => row.source_key));
  const eligible = input.sources.filter((source) => source.healthStatus === "connected");
  const rows = scheduleRowsForEmployerSources({ ...input, sources: eligible, now: input.now ?? new Date().toISOString() }).filter((row) => !known.has(row.source_key));
  if (rows.length) { const inserted = await client.request("opportunity_provider_schedules", { method: "POST", body: JSON.stringify(rows) }); if (inserted.error) throw new Error(inserted.error.message); }
  return { requested: eligible.length, inserted: rows.length, unchanged: eligible.length - rows.length } as const;
}
