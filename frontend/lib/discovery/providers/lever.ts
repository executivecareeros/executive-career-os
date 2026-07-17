import type { DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";
import { ProviderSdk } from "../provider-sdk.ts";
import { leverProviderManifest } from "./manifests.ts";

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
  readonly id = leverProviderManifest.identity.id;
  readonly sdk: ProviderSdk;
  readonly source;
  readonly reliability;
  readonly companyName: string;
  constructor(readonly site: string, readonly region: LeverRegion = "global", companyNameOrFetcher?: string | typeof fetch, fetcher: typeof fetch = fetch) {
    this.companyName = typeof companyNameOrFetcher === "string" ? companyNameOrFetcher.trim() || site : site;
    this.sdk = new ProviderSdk(leverProviderManifest, typeof companyNameOrFetcher === "function" ? companyNameOrFetcher : fetcher);
    this.source = this.sdk.source;
    this.reliability = this.sdk.reliability;
  }
  private get origin() { return this.region === "eu" ? "https://api.eu.lever.co" : "https://api.lever.co"; }
  private get careersUrl() { return `${this.region === "eu" ? "https://jobs.eu.lever.co" : "https://jobs.lever.co"}/${encodeURIComponent(this.site)}`; }
  private async postingsPage(skip: number, limit: number) {
    return this.sdk.json<LeverPosting[]>(`${this.origin}/v0/postings/${encodeURIComponent(this.site)}?mode=json&skip=${skip}&limit=${limit}`, "This Lever careers board was not found.");
  }
  private async postings(maximumResults = 100) {
    const { records, completeSnapshot } = await this.sdk.collectOffsetPages(maximumResults, (offset, limit) => this.postingsPage(offset, limit));
    return { postings: records, completeSnapshot };
  }
  async collect(request: ProviderCollectionRequest) {
    const collectedAt = new Date().toISOString();
    const { postings, completeSnapshot } = await this.postings(request.maximumResults);
    const jobs: DiscoveryJob[] = postings.map((posting) => ({ sourceId: `${this.site}-${posting.id}`, source: this.id, title: posting.text, company: { sourceId: `${this.region}:${this.site}`, canonicalKey: `lever:${this.region}:${this.site}`, name: this.companyName, country: posting.country ?? undefined, careersUrl: this.careersUrl }, location: posting.categories?.location, country: posting.country ?? undefined, description: posting.descriptionPlain, originalUrl: posting.hostedUrl, discoveredAt: collectedAt, employmentType: employment(posting.categories?.commitment), salary: posting.salaryRange ? { minimum: posting.salaryRange.min, maximum: posting.salaryRange.max, currency: posting.salaryRange.currency } : undefined, rawMetadata: { site: this.site, region: this.region, team: posting.categories?.team, department: posting.categories?.department, allLocations: posting.categories?.allLocations ?? [], workArrangement: arrangement(posting.workplaceType) } }));
    return this.sdk.batch({ collectedAt, jobs, sourceRevision: `${this.region}:${this.site}:${jobs.length}`, completeSnapshot, snapshotScopeKeys: [`lever:${this.region}:${this.site}`] });
  }
  health() { return this.sdk.health(() => this.postingsPage(0, 1), "Public Lever job board is available.", "Lever is unavailable."); }
}
