import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";
import { plainText, xmlElements, xmlValue } from "./provider-utils.ts";

type PersonioRegion = "com" | "de";

export function parsePersonioAccount(locator: string) {
  let url: URL;
  try { url = new URL(locator.trim()); } catch { throw new Error("Enter a Personio careers URL."); }
  const match = url.hostname.toLowerCase().match(/^([a-z0-9-]+)\.jobs\.personio\.(com|de)$/);
  if (url.protocol !== "https:" || !match) throw new Error("Only public Personio careers URLs are supported.");
  return { account: match[1], region: match[2] as PersonioRegion };
}

const employment = (value?: string) => /contract|freelance/i.test(value ?? "") ? "Contract" : /temporary|interim|fixed/i.test(value ?? "") ? "Interim" : /permanent|full.?time/i.test(value ?? "") ? "Full-time" : undefined;

export class PersonioOpportunityProvider implements OpportunityProvider {
  readonly id = "personio" as const;
  readonly source = { id: this.id, name: "Personio", category: "Corporate Website" as const, description: "Published employer opportunities from the Personio public XML feed.", capabilities: ["jobs", "companies"] as const };
  readonly reliability = { type: "Verified Feed" as const, rating: "high" as const, score: 88, rationale: "Published through the employer-enabled Personio XML career feed.", assessedAt: new Date().toISOString() };
  constructor(readonly account: string, readonly region: PersonioRegion = "com", private readonly fetcher: typeof fetch = fetch) {}
  private get origin() { return `https://${this.account}.jobs.personio.${this.region}`; }
  private async feed() { const response = await this.fetcher(`${this.origin}/xml?language=en`, { headers: { Accept: "application/xml,text/xml" }, cache: "no-store", signal: AbortSignal.timeout(12_000) }); if (!response.ok) throw Object.assign(new Error(response.status === 404 ? "This Personio job feed was not found or is not enabled." : `Personio returned ${response.status}.`), { code: response.status === 404 ? "FEED_NOT_FOUND" : "PERSONIO_UNAVAILABLE", retryable: response.status >= 500 || response.status === 429 }); const xml = await response.text(); if (!/<(?:workzag-jobs|positions)[^>]*>/i.test(xml)) throw Object.assign(new Error("Personio returned an invalid job feed."), { code: "INVALID_PROVIDER_BATCH", retryable: false }); return xml; }
  async collect(request: ProviderCollectionRequest) { const collectedAt = new Date().toISOString(); const xml = await this.feed(); const feedUrl = `${this.origin}/xml?language=en`; const positions = xmlElements(xml, "position").slice(0, request.maximumResults); const jobs: DiscoveryJob[] = positions.flatMap((position) => { const id = xmlValue(position, "id"); const title = xmlValue(position, "name"); if (!id || !title) return []; const company = xmlValue(position, "subcompany") ?? this.account; const offices = [xmlValue(position, "office"), ...xmlElements(xmlElements(position, "additionalOffices")[0] ?? "", "office").map((item) => plainText(item))].filter((item): item is string => Boolean(item)); const descriptions = xmlElements(position, "jobDescription").map((item) => xmlValue(item, "value")).filter((item): item is string => Boolean(item)); const schedule = xmlValue(position, "schedule"); const employmentType = xmlValue(position, "employmentType"); return [{ sourceId: `${this.account}-${id}`, source: this.id, title, company: { sourceId: this.account, canonicalKey: `personio:${this.region}:${this.account}:${company}`, name: company }, location: offices.join(", ") || undefined, description: descriptions.join(" ") || undefined, originalUrl: feedUrl, publishedAt: xmlValue(position, "createdAt"), discoveredAt: collectedAt, employmentType: employment(`${employmentType ?? ""} ${schedule ?? ""}`), rawMetadata: { account: this.account, providerRecordId: id, department: xmlValue(position, "department"), recruitingCategory: xmlValue(position, "recruitingCategory"), seniority: xmlValue(position, "seniority"), workArrangement: /remote/i.test(offices.join(" ")) ? "Remote" : undefined } } satisfies DiscoveryJob]; }); return { providerId: this.id, collectedAt, jobs, sourceRevision: `${this.account}:${jobs.length}` } as const; }
  async health(): Promise<DiscoveryHealth> { const started = Date.now(); try { await this.feed(); return { source: this.id, status: "connected", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: "Public Personio XML feed is available." }; } catch (error) { return { source: this.id, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: error instanceof Error ? error.message : "Personio is unavailable." }; } }
}
