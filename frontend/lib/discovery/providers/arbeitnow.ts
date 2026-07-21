import type { DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types.ts";
import { ProviderSdk } from "../provider-sdk.ts";
import type { ProviderManifest } from "../provider-manifest.ts";
import { plainText } from "./provider-utils.ts";

type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  description?: string;
  remote?: boolean;
  url: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
};
type ArbeitnowResponse = { data?: ArbeitnowJob[]; links?: { next?: string | null }; meta?: { current_page?: number } };

export const arbeitnowProviderManifest = {
  version: "1.0",
  identity: { id: "arbeitnow", name: "Arbeitnow", category: "Job Board", description: "Attributed European opportunities from Arbeitnow's free public API." },
  access: { model: "public-feed", endpointOrigins: ["https://www.arbeitnow.com"], timeoutMs: 15_000 },
  pagination: { strategy: "offset", maximumPageSize: 100, offsetParameter: "page", limitParameter: "page-size-fixed" },
  fields: { sourceId: "data[].slug", title: "data[].title", employerId: "data[].company_name", employerName: "data[].company_name", location: "data[].location", compensation: "unavailable", publishedAt: "data[].created_at" },
  timestamps: { publishedAt: "provider", discoveredAt: "collection-time" },
  lifecycle: { snapshot: "incremental", scope: "provider" },
  retry: { retryableStatuses: [429, 500, 502, 503, 504], unavailableCode: "ARBEITNOW_UNAVAILABLE", notFoundCode: "ARBEITNOW_NOT_FOUND" },
  reliability: { rating: "moderate", score: 70, rationale: "Public attributed job-board observation aggregated from ATS sources; employer-direct evidence remains authoritative." },
  capabilities: ["jobs", "companies"],
  scheduler: { supported: true, defaultCadenceMinutes: 60 },
} as const satisfies ProviderManifest;

const employmentType = (values?: string[]) => {
  const value = values?.join(" ").toLowerCase() ?? "";
  if (value.includes("contract") || value.includes("freelance")) return "Contract";
  return value.includes("full") || value.includes("vollzeit") ? "Full-time" : undefined;
};

export class ArbeitnowOpportunityProvider implements OpportunityProvider {
  readonly id = arbeitnowProviderManifest.identity.id;
  readonly sdk: ProviderSdk;
  readonly source;
  readonly reliability;

  constructor(fetcher: typeof fetch = fetch) {
    this.sdk = new ProviderSdk(arbeitnowProviderManifest, fetcher);
    this.source = this.sdk.source;
    this.reliability = this.sdk.reliability;
  }

  private page(page: number) {
    return this.sdk.json<ArbeitnowResponse>(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, "Arbeitnow's public feed was not found.");
  }

  async collect(request: ProviderCollectionRequest) {
    const records: ArbeitnowJob[] = [];
    let page = Math.max(1, Number(request.cursor) || 1);
    while (records.length < request.maximumResults) {
      const response = await this.page(page);
      const available = response.data ?? [];
      records.push(...available.slice(0, request.maximumResults - records.length));
      if (!response.links?.next || available.length < 100 || records.length >= request.maximumResults) {
        break;
      }
      page += 1;
    }
    const collectedAt = new Date().toISOString();
    const jobs: DiscoveryJob[] = records.filter(job => job.slug && job.title && job.company_name && job.url).map(job => ({
      sourceId: job.slug, source: this.id, title: job.title,
      company: { sourceId: job.company_name, name: job.company_name },
      location: job.location, description: plainText(job.description), originalUrl: job.url,
      publishedAt: job.created_at ? new Date(job.created_at * 1_000).toISOString() : undefined,
      discoveredAt: collectedAt, employmentType: employmentType(job.job_types),
      rawMetadata: { attribution: "Arbeitnow", tags: job.tags ?? [], workArrangement: job.remote ? "Remote" : "Unknown" },
    }));
    return this.sdk.batch({ collectedAt, jobs, sourceRevision: `page:${page}` });
  }

  health() {
    return this.sdk.health(() => this.page(1), "Arbeitnow's attributed public feed is available.", "Arbeitnow is unavailable.");
  }
}
