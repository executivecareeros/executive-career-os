import { createProviderScaffold, type ProviderScaffoldDefinition } from "../provider-scaffold.ts";
import type { OpportunityProvider, ProviderCollectionRequest } from "../types";
import { workableProviderManifest } from "./manifests.ts";
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
  readonly id = workableProviderManifest.identity.id;
  readonly source;
  readonly reliability;
  private readonly provider: OpportunityProvider;

  constructor(readonly account: string, fetcher: typeof fetch = fetch) {
    this.provider = createProviderScaffold(workableScaffold, account, fetcher);
    this.source = this.provider.source;
    this.reliability = this.provider.reliability;
  }

  async collect(request: ProviderCollectionRequest) {
    const batch = await this.provider.collect(request);
    return { ...batch, sourceRevision: `${this.account}:${batch.jobs.length}` };
  }
  health() { return this.provider.health(); }
}

const workableScaffold: ProviderScaffoldDefinition<WorkableResponse, WorkableJob> = {
  manifest: workableProviderManifest,
  endpoint: (account) => `https://www.workable.com/api/accounts/${encodeURIComponent(account)}?details=true`,
  notFoundMessage: "This Workable careers site was not found.",
  records: (payload) => (payload.jobs ?? []).filter((job) => Boolean(job.title && (job.url || job.shortlink))),
  map: (job, { locator: account, collectedAt, payload }) => ({
    sourceId: `${account}-${job.shortcode ?? job.code ?? job.url}`,
    source: workableProviderManifest.identity.id,
    title: job.title,
    company: { sourceId: account, canonicalKey: `workable:${account}`, name: payload.name ?? account, country: job.country, careersUrl: `https://apply.workable.com/${encodeURIComponent(account)}` },
    location: location(job),
    country: job.country,
    description: plainText(job.full_description ?? job.description),
    originalUrl: job.url ?? job.shortlink,
    publishedAt: job.published_on ?? job.created_at,
    discoveredAt: collectedAt,
    employmentType: employment(job.employment_type),
    salary: job.salary ? { minimum: job.salary.salary_from, maximum: job.salary.salary_to, currency: job.salary.salary_currency } : undefined,
    rawMetadata: { account, department: job.department, workArrangement: arrangement(job) },
  }),
  revision: (_payload, jobs) => `workable:${jobs.length}`,
  scopeKey: (account) => `workable:${account}`,
};
