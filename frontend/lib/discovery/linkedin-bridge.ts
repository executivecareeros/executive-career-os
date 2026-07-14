import { OpportunityCoverageEngine } from "./coverage-engine.ts";
import type { DiscoveryJob, OpportunityIngestionOutcome, OpportunityIngestionSink, OpportunityProvider, ProviderCollectionBatch, ProviderCollectionRequest } from "./types.ts";
import { providerFromCareersUrl } from "./providers/factory.ts";
import { extractVisibleLinkedInDetails, LinkedInUserImportProvider, parseLinkedInJobUrl, resolveEmployerApplicationUrl } from "./providers/linkedin-user-import.ts";

const emptyFilters = { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } as const;
const normalizeUrl = (value?: string) => {
  if (!value) return undefined;
  try { const url = new URL(value); url.hash = ""; url.searchParams.sort(); return url.toString().replace(/\/$/, ""); } catch { return undefined; }
};

export class SingleEmployerRecordProvider implements OpportunityProvider {
  readonly id; readonly source; readonly reliability;
  constructor(private readonly provider: OpportunityProvider, private readonly targetUrl: string) {
    this.id = provider.id; this.source = provider.source; this.reliability = provider.reliability;
  }
  async collect(request: ProviderCollectionRequest): Promise<ProviderCollectionBatch> {
    const batch = await this.provider.collect({ ...request, maximumResults: Math.max(request.maximumResults, 100) });
    const target = normalizeUrl(this.targetUrl);
    const targetPath = new URL(this.targetUrl).pathname.split("/").filter(Boolean).at(-1)?.toLowerCase();
    const exact = batch.jobs.filter((job) => normalizeUrl(job.originalUrl) === target);
    const byIdentifier = exact.length ? exact : batch.jobs.filter((job) => targetPath && (job.sourceId.toLowerCase().includes(targetPath) || new URL(job.originalUrl ?? "https://invalid.example").pathname.toLowerCase().includes(targetPath)));
    const jobs = byIdentifier.length ? byIdentifier : batch.jobs.length === 1 ? batch.jobs : [];
    if (!jobs.length) throw Object.assign(new Error("The employer source was reachable, but the exact role could not be identified safely."), { code: "EMPLOYER_ROLE_NOT_FOUND", retryable: false });
    return { ...batch, jobs: jobs.slice(0, 1) };
  }
  health() { return this.provider.health(); }
}

export type LinkedInBridgeInput = { linkedInUrl: string; visibleDetails?: string; employerApplicationUrl?: string };
export type LinkedInBridgeResult = { opportunityId?: string; employerUrl?: string; employerOutcome?: OpportunityIngestionOutcome; linkedInOutcome: OpportunityIngestionOutcome; verificationStatus: "Employer source matched" | "Unverified LinkedIn observation" };

async function run(provider: OpportunityProvider, sink: OpportunityIngestionSink, requestedAt = new Date().toISOString()) {
  const engine = new OpportunityCoverageEngine(sink).register(provider, { priority: 1, enabled: true, maximumResults: 1 });
  await engine.enqueue(provider.id, emptyFilters, requestedAt);
  const outcome = await engine.runNext(requestedAt);
  if (!outcome) throw new Error("The import could not be started.");
  return outcome;
}

export async function importLinkedInOpportunity(input: LinkedInBridgeInput, sink: OpportunityIngestionSink): Promise<LinkedInBridgeResult> {
  const parsed = parseLinkedInJobUrl(input.linkedInUrl);
  const visible = extractVisibleLinkedInDetails(input.visibleDetails ?? "");
  const employerUrl = resolveEmployerApplicationUrl(input.employerApplicationUrl ?? "", visible);
  let employerOutcome: OpportunityIngestionOutcome | undefined;
  let authoritative: DiscoveryJob | undefined;
  if (employerUrl) {
    const provider = new SingleEmployerRecordProvider(providerFromCareersUrl(employerUrl), employerUrl);
    employerOutcome = await run(provider, sink);
    if (employerOutcome.run.status === "failed") throw new Error(employerOutcome.run.errors[0]?.message ?? "The employer record could not be refreshed.");
    const canonicalId = employerOutcome.items.find((item) => item.opportunityId)?.opportunityId;
    const canonical = canonicalId ? (await sink.list()).find((item) => item.id === canonicalId) : undefined;
    if (canonical) authoritative = { sourceId: canonical.sources?.find((source) => source.kind === "Employer")?.originalId ?? canonical.id, source: provider.id, title: canonical.jobTitle, company: { sourceId: canonical.companyProfile?.canonicalKey ?? canonical.companyName, canonicalKey: canonical.companyProfile?.canonicalKey, name: canonical.companyName, website: canonical.companyProfile?.website, country: canonical.country }, location: canonical.location, country: canonical.country, description: canonical.summary, originalUrl: canonical.sourceUrl, publishedAt: canonical.publishedAt, discoveredAt: canonical.discoveredAt, employmentType: canonical.employmentType, salary: { minimum: canonical.salaryMin, maximum: canonical.salaryMax, currency: canonical.salaryCurrency }, rawMetadata: { workArrangement: canonical.workArrangement } };
  }
  const linkedInProvider = new LinkedInUserImportProvider(parsed.url, parsed.jobId, visible, authoritative);
  const linkedInOutcome = await run(linkedInProvider, sink);
  if (linkedInOutcome.run.status === "failed") throw new Error(linkedInOutcome.run.errors[0]?.message ?? "The LinkedIn observation could not be imported.");
  return { opportunityId: linkedInOutcome.items[0]?.opportunityId, employerUrl, employerOutcome, linkedInOutcome, verificationStatus: authoritative ? "Employer source matched" : "Unverified LinkedIn observation" };
}

export function extractLinkedInJobUrlsFromAlert(text: string) {
  const unique = new Map<string, string>();
  for (const match of text.matchAll(/https:\/\/(?:www\.)?linkedin\.com\/jobs\/view\/[^\s<>"']+/gi)) {
    try { const parsed = parseLinkedInJobUrl(match[0].replace(/[),.;]+$/, "")); unique.set(parsed.jobId, parsed.url); } catch { /* Non-job LinkedIn links are ignored. */ }
  }
  return [...unique.values()].slice(0, 10);
}
