import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";

type AshbyJob = { title: string; location?: string; department?: string; team?: string; isListed?: boolean; isRemote?: boolean; workplaceType?: "OnSite" | "Remote" | "Hybrid"; descriptionPlain?: string; publishedAt?: string; employmentType?: "FullTime" | "PartTime" | "Intern" | "Contract" | "Temporary"; address?: { postalAddress?: { addressCountry?: string } }; jobUrl: string; compensation?: { summaryComponents?: Array<{ compensationType?: string; currencyCode?: string; minValue?: number | null; maxValue?: number | null }> } };
type AshbyResponse = { apiVersion: string; jobs: AshbyJob[] };

export function parseAshbyBoard(locator: string) {
  let url: URL;
  try { url = new URL(locator.trim()); } catch { throw new Error("Enter an Ashby careers URL."); }
  const board = url.pathname.split("/").filter(Boolean)[0];
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "jobs.ashbyhq.com" || !board || !/^[a-z0-9_-]+$/i.test(board)) throw new Error("Only public Ashby careers URLs are supported.");
  return board;
}
const arrangement = (value?: AshbyJob["workplaceType"]) => value === "Remote" ? "Remote" : value === "Hybrid" ? "Hybrid" : value === "OnSite" ? "On-site" : undefined;
const employment = (value?: AshbyJob["employmentType"]) => value === "FullTime" ? "Full-time" : value === "Contract" ? "Contract" : value === "Temporary" ? "Interim" : undefined;

export class AshbyOpportunityProvider implements OpportunityProvider {
  readonly id = "ashby" as const;
  readonly source = { id: this.id, name: "Ashby", category: "Corporate Website" as const, description: "Listed employer opportunities from the Ashby public Job Postings API.", capabilities: ["jobs", "companies"] as const };
  readonly reliability = { type: "Corporate Website" as const, rating: "high" as const, score: 90, rationale: "Published directly through the employer's public Ashby job board.", assessedAt: new Date().toISOString() };
  readonly companyName: string;
  private readonly fetcher: typeof fetch;
  constructor(readonly board: string, companyNameOrFetcher?: string | typeof fetch, fetcher: typeof fetch = fetch) {
    this.companyName = typeof companyNameOrFetcher === "string" ? companyNameOrFetcher.trim() || board : board;
    this.fetcher = typeof companyNameOrFetcher === "function" ? companyNameOrFetcher : fetcher;
  }
  private async listing() { const response = await this.fetcher(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(this.board)}?includeCompensation=true`, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(12_000) }); if (!response.ok) throw Object.assign(new Error(response.status === 404 ? "This Ashby careers board was not found." : `Ashby returned ${response.status}.`), { code: response.status === 404 ? "BOARD_NOT_FOUND" : "ASHBY_UNAVAILABLE", retryable: response.status >= 500 || response.status === 429 }); return response.json() as Promise<AshbyResponse>; }
  async collect(request: ProviderCollectionRequest) {
    const collectedAt = new Date().toISOString(); const response = await this.listing();
    const listed = response.jobs.filter((job) => job.isListed !== false);
    const jobs: DiscoveryJob[] = listed.slice(0, request.maximumResults).map((job) => { const salary = job.compensation?.summaryComponents?.find((component) => component.compensationType === "Salary"); return { sourceId: `${this.board}-${job.jobUrl.split("/").filter(Boolean).at(-1)}`, source: this.id, title: job.title, company: { sourceId: this.board, canonicalKey: `ashby:${this.board}`, name: this.companyName, country: job.address?.postalAddress?.addressCountry, careersUrl: `https://jobs.ashbyhq.com/${encodeURIComponent(this.board)}` }, location: job.location, country: job.address?.postalAddress?.addressCountry, description: job.descriptionPlain, originalUrl: job.jobUrl, publishedAt: job.publishedAt, discoveredAt: collectedAt, employmentType: employment(job.employmentType), salary: salary ? { minimum: salary.minValue ?? undefined, maximum: salary.maxValue ?? undefined, currency: salary.currencyCode } : undefined, rawMetadata: { board: this.board, apiVersion: response.apiVersion, department: job.department, team: job.team, isRemote: job.isRemote, workArrangement: arrangement(job.workplaceType) } }; });
    return { providerId: this.id, collectedAt, jobs, sourceRevision: `${response.apiVersion}:${listed.length}`, completeSnapshot: listed.length <= request.maximumResults } as const;
  }
  async health(): Promise<DiscoveryHealth> { const started = Date.now(); try { await this.listing(); return { source: this.id, status: "connected", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: "Public Ashby job board is available." }; } catch (error) { return { source: this.id, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: error instanceof Error ? error.message : "Ashby is unavailable." }; } }
}
