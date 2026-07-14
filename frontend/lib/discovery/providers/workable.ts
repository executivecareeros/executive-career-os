import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";
import { plainText } from "./provider-utils.ts";

type WorkableJob = { title: string; code?: string; shortcode?: string; country?: string; state?: string; city?: string; department?: string; telecommuting?: boolean; workplace_type?: string; published_on?: string; created_at?: string; description?: string; full_description?: string; url?: string; shortlink?: string; employment_type?: string; salary?: { salary_from?: number; salary_to?: number; salary_currency?: string } };
type WorkableResponse = { name?: string; description?: string; jobs?: WorkableJob[] };

export function parseWorkableAccount(locator: string) {
  let url: URL;
  try { url = new URL(locator.trim()); } catch { throw new Error("Enter a Workable careers URL."); }
  const path = url.pathname.split("/").filter(Boolean);
  const account = url.hostname.toLowerCase() === "apply.workable.com" ? path[0] : url.hostname.toLowerCase() === "www.workable.com" && path[0] === "api" && path[1] === "accounts" ? path[2] : undefined;
  if (url.protocol !== "https:" || !account || !/^[a-z0-9-]+$/i.test(account)) throw new Error("Only public Workable careers URLs are supported.");
  return account;
}

const location = (job: WorkableJob) => [job.city, job.state, job.country].filter(Boolean).join(", ") || undefined;
const arrangement = (job: WorkableJob) => job.telecommuting || /remote/i.test(job.workplace_type ?? "") ? "Remote" : /hybrid/i.test(job.workplace_type ?? "") ? "Hybrid" : /on.?site/i.test(job.workplace_type ?? "") ? "On-site" : undefined;
const employment = (value?: string) => /contract/i.test(value ?? "") ? "Contract" : /temporary|interim/i.test(value ?? "") ? "Interim" : /full/i.test(value ?? "") ? "Full-time" : undefined;

export class WorkableOpportunityProvider implements OpportunityProvider {
  readonly id = "workable" as const;
  readonly source = { id: this.id, name: "Workable", category: "Corporate Website" as const, description: "Published employer opportunities from Workable's public jobs endpoint.", capabilities: ["jobs", "companies"] as const };
  readonly reliability = { type: "Corporate Website" as const, rating: "high" as const, score: 90, rationale: "Published directly through the employer's public Workable account feed.", assessedAt: new Date().toISOString() };
  constructor(readonly account: string, private readonly fetcher: typeof fetch = fetch) {}
  private async listing() { const response = await this.fetcher(`https://www.workable.com/api/accounts/${encodeURIComponent(this.account)}?details=true`, { headers: { Accept: "application/json" }, cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(12_000) }); if (!response.ok) throw Object.assign(new Error(response.status === 404 ? "This Workable careers site was not found." : `Workable returned ${response.status}.`), { code: response.status === 404 ? "BOARD_NOT_FOUND" : "WORKABLE_UNAVAILABLE", retryable: response.status >= 500 || response.status === 429 }); return response.json() as Promise<WorkableResponse>; }
  async collect(request: ProviderCollectionRequest) { const collectedAt = new Date().toISOString(); const response = await this.listing(); const jobs: DiscoveryJob[] = (response.jobs ?? []).filter((job) => job.title && (job.url || job.shortlink)).slice(0, request.maximumResults).map((job) => ({ sourceId: `${this.account}-${job.shortcode ?? job.code ?? job.url}`, source: this.id, title: job.title, company: { sourceId: this.account, name: response.name ?? this.account, country: job.country, website: `https://apply.workable.com/${this.account}` }, location: location(job), country: job.country, description: plainText(job.full_description ?? job.description), originalUrl: job.url ?? job.shortlink, publishedAt: job.published_on ?? job.created_at, discoveredAt: collectedAt, employmentType: employment(job.employment_type), salary: job.salary ? { minimum: job.salary.salary_from, maximum: job.salary.salary_to, currency: job.salary.salary_currency } : undefined, rawMetadata: { account: this.account, department: job.department, workArrangement: arrangement(job) } })); return { providerId: this.id, collectedAt, jobs, sourceRevision: `${this.account}:${jobs.length}` } as const; }
  async health(): Promise<DiscoveryHealth> { const started = Date.now(); try { await this.listing(); return { source: this.id, status: "connected", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: "Public Workable careers site is available." }; } catch (error) { return { source: this.id, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: error instanceof Error ? error.message : "Workable is unavailable." }; } }
}
