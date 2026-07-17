import type { DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";
import { ProviderSdk } from "../provider-sdk.ts";
import { smartRecruitersProviderManifest } from "./manifests.ts";
import { plainText } from "./provider-utils.ts";

type Label = { id?: string; label?: string };
type Location = { city?: string; region?: string; country?: string; remote?: boolean; hybrid?: boolean; fullLocation?: string };
type Posting = { id: string; name: string; uuid?: string; company?: { identifier?: string; name?: string }; releasedDate?: string; location?: Location; industry?: Label; department?: Label; function?: Label; typeOfEmployment?: Label; experienceLevel?: Label; ref?: string };
type PostingList = { offset: number; limit: number; totalFound: number; content: Posting[] };
type PostingDetail = Posting & { postingUrl?: string; applyUrl?: string; active?: boolean; jobAd?: { sections?: Record<string, { title?: string; text?: string }> } };

export function parseSmartRecruitersCompany(locator: string) {
  let url: URL;
  try { url = new URL(locator.trim()); } catch { throw new Error("Enter a SmartRecruiters careers URL."); }
  const hosts = new Set(["careers.smartrecruiters.com", "jobs.smartrecruiters.com"]);
  const company = url.pathname.split("/").filter(Boolean)[0];
  if (url.protocol !== "https:" || !hosts.has(url.hostname.toLowerCase()) || !company || !/^[a-z0-9_-]+$/i.test(company)) throw new Error("Only public SmartRecruiters career pages are supported.");
  return company;
}

const employment = (label?: string) => /contract|freelance/i.test(label ?? "") ? "Contract" : /temporary|interim/i.test(label ?? "") ? "Interim" : /full.?time|permanent/i.test(label ?? "") ? "Full-time" : undefined;
const arrangement = (location?: Location) => location?.remote ? "Remote" : location?.hybrid ? "Hybrid" : location ? "On-site" : undefined;
const locationText = (location?: Location) => location?.fullLocation ?? ([location?.city, location?.region, location?.country].filter(Boolean).join(", ") || undefined);

export class SmartRecruitersOpportunityProvider implements OpportunityProvider {
  readonly id = smartRecruitersProviderManifest.identity.id;
  readonly sdk: ProviderSdk;
  readonly source;
  readonly reliability;
  constructor(readonly company: string, fetcher: typeof fetch = fetch) { this.sdk = new ProviderSdk(smartRecruitersProviderManifest, fetcher); this.source = this.sdk.source; this.reliability = this.sdk.reliability; }
  private get careersUrl() { return `https://careers.smartrecruiters.com/${encodeURIComponent(this.company)}`; }
  private page(offset: number, limit: number) { return this.sdk.json<PostingList>(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(this.company)}/postings?destination=PUBLIC&offset=${offset}&limit=${limit}`, "This SmartRecruiters careers page was not found."); }
  private detail(id: string) { return this.sdk.json<PostingDetail>(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(this.company)}/postings/${encodeURIComponent(id)}`, "This SmartRecruiters posting was not found."); }
  private async details(postings: Posting[]) { const records: PostingDetail[] = []; for (let index = 0; index < postings.length; index += 6) records.push(...await Promise.all(postings.slice(index, index + 6).map((posting) => this.detail(posting.id)))); return records; }
  async collect(request: ProviderCollectionRequest) {
    const collectedAt = new Date().toISOString();
    const first = await this.page(0, Math.min(100, request.maximumResults));
    const postings = [...first.content];
    for (let offset = postings.length; offset < Math.min(first.totalFound, request.maximumResults); offset += 100) postings.push(...(await this.page(offset, Math.min(100, request.maximumResults - offset))).content);
    const completeSnapshot = postings.length >= first.totalFound;
    const details = await this.details(postings.slice(0, request.maximumResults));
    const jobs: DiscoveryJob[] = details.filter((posting) => posting.active !== false && posting.name && posting.id).map((posting) => {
      const sections = posting.jobAd?.sections ?? {};
      const description = plainText(Object.values(sections).map((section) => section.text ?? "").join(" "));
      const companyName = posting.company?.name?.trim() || this.company;
      return { sourceId: `${this.company}-${posting.id}`, source: this.id, title: posting.name, company: { sourceId: this.company, canonicalKey: `smartrecruiters:${this.company}`, name: companyName, careersUrl: this.careersUrl, industry: posting.industry?.label, country: posting.location?.country }, location: locationText(posting.location), country: posting.location?.country, description, originalUrl: posting.postingUrl ?? posting.applyUrl ?? posting.ref, publishedAt: posting.releasedDate, discoveredAt: collectedAt, employmentType: employment(posting.typeOfEmployment?.label), rawMetadata: { company: this.company, department: posting.department?.label, function: posting.function?.label, seniority: posting.experienceLevel?.label, workArrangement: arrangement(posting.location), applyUrl: posting.applyUrl } };
    });
    return this.sdk.batch({ collectedAt, jobs, sourceRevision: `${this.company}:${first.totalFound}:${jobs.length}`, completeSnapshot, snapshotScopeKeys: [`smartrecruiters:${this.company}`] });
  }
  health() { return this.sdk.health(() => this.page(0, 1), "Public SmartRecruiters career page is available.", "SmartRecruiters is unavailable."); }
}
