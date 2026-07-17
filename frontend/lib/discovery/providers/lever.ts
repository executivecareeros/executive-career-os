import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";

type LeverPosting = { id: string; text: string; categories?: { location?: string; commitment?: string; team?: string; department?: string; allLocations?: string[] }; country?: string | null; descriptionPlain?: string; hostedUrl: string; workplaceType?: "unspecified" | "on-site" | "remote" | "hybrid"; salaryRange?: { currency?: string; min?: number; max?: number } };
type LeverRegion = "global" | "eu";
const hosts: Record<string, LeverRegion> = { "jobs.lever.co": "global", "jobs.eu.lever.co": "eu" };

export function parseLeverBoard(locator: string) {
  let url: URL;
  try { url = new URL(locator.trim()); } catch { throw new Error("Enter a Lever careers URL."); }
  const region = hosts[url.hostname.toLowerCase()];
  const site = url.pathname.split("/").filter(Boolean)[0];
  if (url.protocol !== "https:" || !region || !site || !/^[a-z0-9_-]+$/i.test(site)) throw new Error("Only public Lever careers URLs are supported.");
  return { site, region };
}

const arrangement = (value?: LeverPosting["workplaceType"]) => value === "remote" ? "Remote" : value === "hybrid" ? "Hybrid" : value === "on-site" ? "On-site" : undefined;
const employment = (value?: string) => /contract/i.test(value ?? "") ? "Contract" : /interim|temporary/i.test(value ?? "") ? "Interim" : /full.?time/i.test(value ?? "") ? "Full-time" : undefined;

export class LeverOpportunityProvider implements OpportunityProvider {
  readonly id = "lever" as const;
  readonly source = { id: this.id, name: "Lever", category: "Corporate Website" as const, description: "Published employer opportunities from the Lever Postings API.", capabilities: ["jobs", "companies"] as const };
  readonly reliability = { type: "Corporate Website" as const, rating: "high" as const, score: 90, rationale: "Published directly through the employer's public Lever job board.", assessedAt: new Date().toISOString() };
  readonly companyName: string;
  private readonly fetcher: typeof fetch;
  constructor(readonly site: string, readonly region: LeverRegion = "global", companyNameOrFetcher?: string | typeof fetch, fetcher: typeof fetch = fetch) {
    this.companyName = typeof companyNameOrFetcher === "string" ? companyNameOrFetcher.trim() || site : site;
    this.fetcher = typeof companyNameOrFetcher === "function" ? companyNameOrFetcher : fetcher;
  }
  private get origin() { return this.region === "eu" ? "https://api.eu.lever.co" : "https://api.lever.co"; }
  private get careersUrl() { return `${this.region === "eu" ? "https://jobs.eu.lever.co" : "https://jobs.lever.co"}/${encodeURIComponent(this.site)}`; }
  private async postingsPage(skip: number, limit: number) {
    const response = await this.fetcher(`${this.origin}/v0/postings/${encodeURIComponent(this.site)}?mode=json&skip=${skip}&limit=${limit}`, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw Object.assign(new Error(response.status === 404 ? "This Lever careers board was not found." : `Lever returned ${response.status}.`), { code: response.status === 404 ? "BOARD_NOT_FOUND" : "LEVER_UNAVAILABLE", retryable: response.status >= 500 || response.status === 429 });
    return response.json() as Promise<LeverPosting[]>;
  }
  private async postings(maximumResults = 100) {
    const postings: LeverPosting[] = [];
    let completeSnapshot = false;
    while (postings.length < maximumResults) {
      const limit = Math.min(100, maximumResults - postings.length);
      const page = await this.postingsPage(postings.length, limit);
      postings.push(...page.slice(0, limit));
      if (page.length < limit) { completeSnapshot = true; break; }
    }
    return { postings, completeSnapshot };
  }
  async collect(request: ProviderCollectionRequest) {
    const collectedAt = new Date().toISOString();
    const { postings, completeSnapshot } = await this.postings(request.maximumResults);
    const jobs: DiscoveryJob[] = postings.map((posting) => ({ sourceId: `${this.site}-${posting.id}`, source: this.id, title: posting.text, company: { sourceId: `${this.region}:${this.site}`, canonicalKey: `lever:${this.region}:${this.site}`, name: this.companyName, country: posting.country ?? undefined, careersUrl: this.careersUrl }, location: posting.categories?.location, country: posting.country ?? undefined, description: posting.descriptionPlain, originalUrl: posting.hostedUrl, discoveredAt: collectedAt, employmentType: employment(posting.categories?.commitment), salary: posting.salaryRange ? { minimum: posting.salaryRange.min, maximum: posting.salaryRange.max, currency: posting.salaryRange.currency } : undefined, rawMetadata: { site: this.site, region: this.region, team: posting.categories?.team, department: posting.categories?.department, allLocations: posting.categories?.allLocations ?? [], workArrangement: arrangement(posting.workplaceType) } }));
    return { providerId: this.id, collectedAt, jobs, sourceRevision: `${this.region}:${this.site}:${jobs.length}`, completeSnapshot } as const;
  }
  async health(): Promise<DiscoveryHealth> { const started = Date.now(); try { await this.postingsPage(0,1); return { source: this.id, status: "connected", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: "Public Lever job board is available." }; } catch (error) { return { source: this.id, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: error instanceof Error ? error.message : "Lever is unavailable." }; } }
}
