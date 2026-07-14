import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";
import { plainText } from "./provider-utils.ts";

type RecruiteeOffer = { id: number; slug: string; title: string; company_name?: string; location?: string; city?: string; country?: string; country_code?: string; remote?: boolean; hybrid?: boolean; department?: string; description?: string; requirements?: string; careers_url: string; published_at?: string; updated_at?: string; employment_type_code?: string; salary?: { min?: number | null; max?: number | null; currency?: string | null } };
type RecruiteeResponse = { offers?: RecruiteeOffer[] };

export function parseRecruiteeCompany(locator: string) {
  let url: URL;
  try { url = new URL(locator.trim()); } catch { throw new Error("Enter a Recruitee careers URL."); }
  const labels = url.hostname.toLowerCase().split(".");
  const company = labels.length === 3 && labels.slice(1).join(".") === "recruitee.com" ? labels[0] : undefined;
  if (url.protocol !== "https:" || !company || !/^[a-z0-9-]+$/.test(company)) throw new Error("Only public Recruitee careers URLs are supported.");
  return company;
}

const employment = (value?: string) => /contract|freelance/i.test(value ?? "") ? "Contract" : /temporary|interim/i.test(value ?? "") ? "Interim" : /full/i.test(value ?? "") ? "Full-time" : undefined;

export class RecruiteeOpportunityProvider implements OpportunityProvider {
  readonly id = "recruitee" as const;
  readonly source = { id: this.id, name: "Recruitee", category: "Corporate Website" as const, description: "Published employer opportunities from the Recruitee Careers Site API.", capabilities: ["jobs", "companies"] as const };
  readonly reliability = { type: "Corporate Website" as const, rating: "high" as const, score: 90, rationale: "Published directly through the employer's public Recruitee careers site.", assessedAt: new Date().toISOString() };
  constructor(readonly company: string, private readonly fetcher: typeof fetch = fetch) {}
  private async offers() { const response = await this.fetcher(`https://${this.company}.recruitee.com/api/offers/`, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(12_000) }); if (!response.ok) throw Object.assign(new Error(response.status === 404 ? "This Recruitee careers site was not found." : `Recruitee returned ${response.status}.`), { code: response.status === 404 ? "BOARD_NOT_FOUND" : "RECRUITEE_UNAVAILABLE", retryable: response.status >= 500 || response.status === 429 }); return response.json() as Promise<RecruiteeResponse>; }
  async collect(request: ProviderCollectionRequest) { const collectedAt = new Date().toISOString(); const response = await this.offers(); const offers = (response.offers ?? []).filter((offer) => offer.title && offer.careers_url).slice(0, request.maximumResults); const jobs: DiscoveryJob[] = offers.map((offer) => ({ sourceId: `${this.company}-${offer.id}`, source: this.id, title: offer.title, company: { sourceId: this.company, name: offer.company_name ?? this.company, country: offer.country ?? offer.country_code, website: `https://${this.company}.recruitee.com` }, location: offer.location ?? offer.city, country: offer.country ?? offer.country_code, description: plainText(`${offer.description ?? ""} ${offer.requirements ?? ""}`), originalUrl: offer.careers_url, publishedAt: offer.updated_at ?? offer.published_at, discoveredAt: collectedAt, employmentType: employment(offer.employment_type_code), salary: offer.salary ? { minimum: offer.salary.min ?? undefined, maximum: offer.salary.max ?? undefined, currency: offer.salary.currency ?? undefined } : undefined, rawMetadata: { company: this.company, department: offer.department, workArrangement: offer.remote ? "Remote" : offer.hybrid ? "Hybrid" : undefined } })); return { providerId: this.id, collectedAt, jobs, sourceRevision: `${this.company}:${jobs.length}` } as const; }
  async health(): Promise<DiscoveryHealth> { const started = Date.now(); try { await this.offers(); return { source: this.id, status: "connected", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: "Public Recruitee careers site is available." }; } catch (error) { return { source: this.id, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: error instanceof Error ? error.message : "Recruitee is unavailable." }; } }
}
