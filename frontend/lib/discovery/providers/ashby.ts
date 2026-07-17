import type { DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";
import { ProviderSdk } from "../provider-sdk.ts";
import { ashbyProviderManifest } from "./manifests.ts";

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
  readonly id = ashbyProviderManifest.identity.id;
  readonly sdk: ProviderSdk;
  readonly source;
  readonly reliability;
  readonly companyName: string;
  constructor(readonly board: string, companyNameOrFetcher?: string | typeof fetch, fetcher: typeof fetch = fetch) {
    this.companyName = typeof companyNameOrFetcher === "string" ? companyNameOrFetcher.trim() || board : board;
    this.sdk = new ProviderSdk(ashbyProviderManifest, typeof companyNameOrFetcher === "function" ? companyNameOrFetcher : fetcher);
    this.source = this.sdk.source;
    this.reliability = this.sdk.reliability;
  }
  private listing() { return this.sdk.json<AshbyResponse>(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(this.board)}?includeCompensation=true`, "This Ashby careers board was not found."); }
  async collect(request: ProviderCollectionRequest) {
    const collectedAt = new Date().toISOString(); const response = await this.listing();
    const listed = response.jobs.filter((job) => job.isListed !== false);
    const jobs: DiscoveryJob[] = listed.slice(0, request.maximumResults).map((job) => { const salary = job.compensation?.summaryComponents?.find((component) => component.compensationType === "Salary"); return { sourceId: `${this.board}-${job.jobUrl.split("/").filter(Boolean).at(-1)}`, source: this.id, title: job.title, company: { sourceId: this.board, canonicalKey: `ashby:${this.board}`, name: this.companyName, country: job.address?.postalAddress?.addressCountry, careersUrl: `https://jobs.ashbyhq.com/${encodeURIComponent(this.board)}` }, location: job.location, country: job.address?.postalAddress?.addressCountry, description: job.descriptionPlain, originalUrl: job.jobUrl, publishedAt: job.publishedAt, discoveredAt: collectedAt, employmentType: employment(job.employmentType), salary: salary ? { minimum: salary.minValue ?? undefined, maximum: salary.maxValue ?? undefined, currency: salary.currencyCode } : undefined, rawMetadata: { board: this.board, apiVersion: response.apiVersion, department: job.department, team: job.team, isRemote: job.isRemote, workArrangement: arrangement(job.workplaceType) } }; });
    return this.sdk.batch({ collectedAt, jobs, sourceRevision: `${response.apiVersion}:${listed.length}`, completeSnapshot: listed.length <= request.maximumResults, snapshotScopeKeys: [`ashby:${this.board}`] });
  }
  health() { return this.sdk.health(() => this.listing(), "Public Ashby job board is available.", "Ashby is unavailable."); }
}
