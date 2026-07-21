import type { DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types.ts";
import { ProviderSdk } from "../provider-sdk.ts";
import type { ProviderManifest } from "../provider-manifest.ts";
import { plainText } from "./provider-utils.ts";

type JobicyJob = {
  id: number | string;
  url: string;
  jobTitle: string;
  companyName: string;
  jobIndustry?: string[];
  jobType?: string[];
  jobGeo?: string;
  jobLevel?: string;
  jobDescription?: string;
  pubDate?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
};

type JobicyResponse = { apiVersion?: string; lastUpdate?: string; jobs?: JobicyJob[] };

export const jobicyProviderManifest = {
  version: "1.0",
  identity: { id: "jobicy", name: "Jobicy", category: "Job Board", description: "Attributed remote opportunities from Jobicy's free public API." },
  access: { model: "public-feed", endpointOrigins: ["https://jobicy.com"], timeoutMs: 12_000 },
  pagination: { strategy: "none" },
  fields: { sourceId: "jobs[].id", title: "jobs[].jobTitle", employerId: "jobs[].companyName", employerName: "jobs[].companyName", location: "jobs[].jobGeo", compensation: "jobs[].salaryMin|salaryMax|salaryCurrency", publishedAt: "jobs[].pubDate" },
  timestamps: { publishedAt: "provider", discoveredAt: "collection-time" },
  lifecycle: { snapshot: "incremental", scope: "provider" },
  retry: { retryableStatuses: [429, 500, 502, 503, 504], unavailableCode: "JOBICY_UNAVAILABLE", notFoundCode: "JOBICY_NOT_FOUND" },
  reliability: { rating: "moderate", score: 70, rationale: "Public attributed job-board observation; employer-direct evidence remains authoritative when available." },
  capabilities: ["jobs", "companies"],
  scheduler: { supported: true, defaultCadenceMinutes: 60 },
} as const satisfies ProviderManifest;

const employmentType = (values?: string[]) => {
  const value = values?.join(" ").toLowerCase() ?? "";
  if (value.includes("contract") || value.includes("freelance")) return "Contract";
  return value.includes("full") ? "Full-time" : undefined;
};

export class JobicyOpportunityProvider implements OpportunityProvider {
  readonly id = jobicyProviderManifest.identity.id;
  readonly sdk: ProviderSdk;
  readonly source;
  readonly reliability;

  constructor(fetcher: typeof fetch = fetch) {
    this.sdk = new ProviderSdk(jobicyProviderManifest, fetcher);
    this.source = this.sdk.source;
    this.reliability = this.sdk.reliability;
  }

  private jobs(count: number) {
    return this.sdk.json<JobicyResponse>(`https://jobicy.com/api/v2/remote-jobs?count=${Math.min(100, Math.max(1, count))}`, "Jobicy's public feed was not found.");
  }

  async collect(request: ProviderCollectionRequest) {
    const response = await this.jobs(request.maximumResults);
    const collectedAt = new Date().toISOString();
    const jobs: DiscoveryJob[] = (response.jobs ?? []).filter(job => job.id && job.jobTitle && job.companyName && job.url).map(job => ({
      sourceId: String(job.id), source: this.id, title: job.jobTitle,
      company: { sourceId: job.companyName, name: job.companyName },
      location: job.jobGeo, country: job.jobGeo, description: plainText(job.jobDescription), originalUrl: job.url,
      publishedAt: job.pubDate, discoveredAt: collectedAt, employmentType: employmentType(job.jobType),
      salary: job.salaryMin != null || job.salaryMax != null ? { minimum: job.salaryMin ?? undefined, maximum: job.salaryMax ?? undefined, currency: job.salaryCurrency ?? undefined } : undefined,
      rawMetadata: { attribution: "Jobicy", industries: job.jobIndustry ?? [], level: job.jobLevel, workArrangement: "Remote" },
    }));
    return this.sdk.batch({ collectedAt, jobs: jobs.slice(0, request.maximumResults), sourceRevision: response.lastUpdate ?? response.apiVersion });
  }

  health() {
    return this.sdk.health(() => this.jobs(1), "Jobicy's attributed public feed is available.", "Jobicy is unavailable.");
  }
}
