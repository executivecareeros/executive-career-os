import type { DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types.ts";
import { ProviderHttpError, ProviderSdk } from "../provider-sdk.ts";
import type { ProviderManifest } from "../provider-manifest.ts";
import { plainText } from "./provider-utils.ts";

type UsaJobsLocation = { LocationName?: string; CountryCode?: string };
type UsaJobsDescriptor = {
  PositionID?: string; PositionTitle?: string; PositionURI?: string; ApplyURI?: string[];
  PositionLocationDisplay?: string; PositionLocation?: UsaJobsLocation[];
  OrganizationName?: string; DepartmentName?: string; QualificationSummary?: string;
  PositionRemuneration?: Array<{ MinimumRange?: string; MaximumRange?: string; RateIntervalCode?: string }>;
  PositionSchedule?: Array<{ Name?: string }>;
  PublicationStartDate?: string; PositionStartDate?: string;
  UserArea?: { Details?: { JobSummary?: string; MajorDuties?: string; WhoMayApply?: { Name?: string }; RemoteIndicator?: boolean } };
};
type UsaJobsResponse = { SearchResult?: { SearchResultCountAll?: number; SearchResultItems?: Array<{ MatchedObjectId?: string; MatchedObjectDescriptor?: UsaJobsDescriptor }> } };

export const usaJobsProviderManifest = {
  version: "1.0",
  identity: { id: "usajobs", name: "USAJOBS", category: "Official API", description: "Attributed public federal opportunities from the official USAJOBS Search API." },
  access: { model: "official-api", endpointOrigins: ["https://data.usajobs.gov"], timeoutMs: 15_000 },
  pagination: { strategy: "offset", maximumPageSize: 500, offsetParameter: "Page", limitParameter: "ResultsPerPage" },
  fields: { sourceId: "MatchedObjectId", title: "MatchedObjectDescriptor.PositionTitle", employerId: "MatchedObjectDescriptor.OrganizationName", employerName: "MatchedObjectDescriptor.OrganizationName", location: "MatchedObjectDescriptor.PositionLocationDisplay", compensation: "MatchedObjectDescriptor.PositionRemuneration", publishedAt: "MatchedObjectDescriptor.PublicationStartDate" },
  timestamps: { publishedAt: "provider", discoveredAt: "collection-time" },
  lifecycle: { snapshot: "complete-when-untruncated", scope: "provider" },
  retry: { retryableStatuses: [429, 500, 502, 503, 504], unavailableCode: "USAJOBS_UNAVAILABLE", notFoundCode: "USAJOBS_NOT_FOUND" },
  reliability: { rating: "high", score: 95, rationale: "Official U.S. Government API containing currently open public job announcements." },
  capabilities: ["jobs", "companies"], scheduler: { supported: true, defaultCadenceMinutes: 60 },
} as const satisfies ProviderManifest;

const amount = (value?: string) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; };

export class UsaJobsOpportunityProvider implements OpportunityProvider {
  readonly id = usaJobsProviderManifest.identity.id;
  readonly sdk: ProviderSdk;
  readonly source;
  readonly reliability;

  constructor(private readonly apiKey: string, private readonly userAgentEmail: string, private readonly fetcher: typeof fetch = fetch) {
    if (!apiKey.trim() || !userAgentEmail.trim()) throw new Error("USAJOBS credentials are required");
    this.sdk = new ProviderSdk(usaJobsProviderManifest, fetcher);
    this.source = this.sdk.source; this.reliability = this.sdk.reliability;
  }

  private async page(page: number, pageSize: number) {
    const url = new URL("https://data.usajobs.gov/api/Search");
    url.searchParams.set("Page", String(page)); url.searchParams.set("ResultsPerPage", String(Math.min(500, pageSize)));
    url.searchParams.set("WhoMayApply", "Public"); url.searchParams.set("Fields", "Full");
    const response = await this.fetcher(url, { headers: { Accept: "application/json", "User-Agent": this.userAgentEmail, "Authorization-Key": this.apiKey }, cache: "no-store", signal: AbortSignal.timeout(usaJobsProviderManifest.access.timeoutMs) });
    if (!response.ok) throw new ProviderHttpError(`USAJOBS returned ${response.status}.`, "USAJOBS_UNAVAILABLE", [429, 500, 502, 503, 504].includes(response.status), response.status);
    return response.json() as Promise<UsaJobsResponse>;
  }

  async collect(request: ProviderCollectionRequest) {
    const jobs: DiscoveryJob[] = []; let page = 1; let total = 0;
    while (jobs.length < request.maximumResults) {
      const response = await this.page(page, Math.min(500, request.maximumResults - jobs.length));
      const result = response.SearchResult; total = result?.SearchResultCountAll ?? total;
      const items = result?.SearchResultItems ?? []; const collectedAt = new Date().toISOString();
      for (const item of items) {
        const job = item.MatchedObjectDescriptor; const sourceId = item.MatchedObjectId ?? job?.PositionID;
        if (!job?.PositionTitle || !job.OrganizationName || !sourceId || !job.PositionURI) continue;
        const location = job.PositionLocation?.[0]; const pay = job.PositionRemuneration?.[0]; const details = job.UserArea?.Details;
        jobs.push({ sourceId, source: this.id, title: job.PositionTitle, company: { sourceId: job.OrganizationName, name: job.OrganizationName }, location: job.PositionLocationDisplay ?? location?.LocationName, country: location?.CountryCode, description: plainText([details?.JobSummary, details?.MajorDuties, job.QualificationSummary].filter(Boolean).join(" ")), originalUrl: job.ApplyURI?.[0] ?? job.PositionURI, publishedAt: job.PublicationStartDate ?? job.PositionStartDate, discoveredAt: collectedAt, employmentType: job.PositionSchedule?.[0]?.Name, salary: pay ? { minimum: amount(pay.MinimumRange), maximum: amount(pay.MaximumRange), currency: "USD" } : undefined, rawMetadata: { attribution: "USAJOBS", listingUrl: job.PositionURI, department: job.DepartmentName, whoMayApply: details?.WhoMayApply?.Name, remote: details?.RemoteIndicator ?? false } });
      }
      if (!items.length || jobs.length >= total || items.length < Math.min(500, request.maximumResults - Math.max(0, jobs.length - items.length))) break;
      page += 1;
    }
    return this.sdk.batch({ collectedAt: new Date().toISOString(), jobs: jobs.slice(0, request.maximumResults), sourceRevision: `total:${total}`, completeSnapshot: jobs.length >= total });
  }

  health() { return this.sdk.health(() => this.page(1, 1), "USAJOBS Search API is available.", "USAJOBS is unavailable."); }
}
