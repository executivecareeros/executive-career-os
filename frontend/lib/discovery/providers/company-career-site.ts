import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";
import { plainText } from "./provider-utils.ts";

const maximumDocumentBytes = 2_000_000;
const blockedHostSuffixes = [".local", ".localhost", ".internal", ".lan"];

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

function isObject(value: JsonValue | undefined): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function isSafePublicCareerUrl(url: URL) {
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:" || !host || host === "localhost" || blockedHostSuffixes.some((suffix) => host.endsWith(suffix))) return false;
  if (host.includes(":") || isIP(host) !== 0 || /^\d+$/.test(host) || /^0x[0-9a-f]+$/i.test(host)) return false;
  return true;
}

type AddressRecord = { address: string; family: number };
type HostResolver = (hostname: string) => Promise<readonly AddressRecord[]>;
const defaultResolver: HostResolver = (hostname) => lookup(hostname, { all: true, verbatim: true });
const publicAddress = ({ address, family }: AddressRecord) => {
  if (family === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)));
  }
  const value = address.toLowerCase();
  return value !== "::" && value !== "::1" && !value.startsWith("fc") && !value.startsWith("fd") && !/^fe[89ab]/.test(value) && !value.startsWith("::ffff:127.") && !value.startsWith("::ffff:10.") && !value.startsWith("::ffff:192.168.");
};

export function parseCompanyCareerUrl(locator: string) {
  let url: URL;
  try { url = new URL(locator.trim()); } catch { throw new Error("Enter a company career page URL."); }
  if (!isSafePublicCareerUrl(url)) throw new Error("Only public HTTPS company career pages are supported.");
  url.hash = "";
  return url;
}

function collectNodes(value: JsonValue, nodes: JsonObject[] = []): JsonObject[] {
  if (Array.isArray(value)) for (const item of value) collectNodes(item, nodes);
  else if (isObject(value)) {
    const type = value["@type"];
    if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) nodes.push(value);
    const graph = value["@graph"];
    if (graph) collectNodes(graph, nodes);
  }
  return nodes;
}

export function parseJobPostingJsonLd(html: string) {
  const records: JsonObject[] = [];
  const pattern = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi;
  for (const match of html.matchAll(pattern)) {
    try { records.push(...collectNodes(JSON.parse(match[1].trim()) as JsonValue)); } catch { /* Invalid publisher markup is ignored. */ }
  }
  return records;
}

const text = (value: JsonValue | undefined) => typeof value === "string" && value.trim() ? value.trim() : undefined;
const firstObject = (value: JsonValue | undefined) => isObject(value) ? value : Array.isArray(value) ? value.find(isObject) : undefined;
const organization = (job: JsonObject) => firstObject(job.hiringOrganization);
const identifier = (job: JsonObject) => {
  const value = job.identifier;
  if (typeof value === "string") return value;
  return text(firstObject(value)?.value) ?? text(firstObject(value)?.name);
};
const location = (job: JsonObject) => {
  if (/telecommute|remote/i.test(text(job.jobLocationType) ?? "")) return "Remote";
  const place = firstObject(job.jobLocation);
  const address = firstObject(place?.address);
  return [text(address?.addressLocality), text(address?.addressRegion), text(address?.addressCountry)].filter(Boolean).join(", ") || text(place?.name);
};
const salary = (job: JsonObject) => {
  const base = firstObject(job.baseSalary);
  const value = firstObject(base?.value);
  const minimum = typeof value?.minValue === "number" ? value.minValue : typeof value?.value === "number" ? value.value : undefined;
  const maximum = typeof value?.maxValue === "number" ? value.maxValue : typeof value?.value === "number" ? value.value : undefined;
  const currency = text(base?.currency) ?? text(value?.currency);
  return minimum !== undefined || maximum !== undefined || currency ? { minimum, maximum, currency } : undefined;
};

export class CompanyCareerSiteOpportunityProvider implements OpportunityProvider {
  readonly id = "corporate-career-site" as const;
  readonly source = { id: this.id, name: "Company Career Site", category: "Corporate Website" as const, description: "Employer-published opportunities expressed as JobPosting structured data on a public career page.", capabilities: ["jobs", "companies"] as const };
  readonly reliability = { type: "Corporate Website" as const, rating: "high" as const, score: 86, rationale: "Collected from explicit JobPosting evidence published on the employer's own public page.", assessedAt: new Date().toISOString() };

  constructor(readonly pageUrl: URL, private readonly fetcher: typeof fetch = fetch, private readonly resolver: HostResolver = defaultResolver) {}

  private async document() {
    const addresses = await this.resolver(this.pageUrl.hostname);
    if (!addresses.length || addresses.some((address) => !publicAddress(address))) throw Object.assign(new Error("The company career page does not resolve to a public network address."), { code: "PRIVATE_CAREER_PAGE_ADDRESS", retryable: false });
    const response = await this.fetcher(this.pageUrl, { headers: { Accept: "text/html,application/xhtml+xml" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw Object.assign(new Error(`The company career page returned ${response.status}.`), { code: "CAREER_PAGE_UNAVAILABLE", retryable: response.status >= 500 || response.status === 429 });
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) throw Object.assign(new Error("The URL is not an HTML company career page."), { code: "UNSUPPORTED_CAREER_PAGE", retryable: false });
    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > maximumDocumentBytes) throw Object.assign(new Error("The company career page is too large for safe collection."), { code: "CAREER_PAGE_TOO_LARGE", retryable: false });
    const body = await response.text();
    if (new TextEncoder().encode(body).byteLength > maximumDocumentBytes) throw Object.assign(new Error("The company career page is too large for safe collection."), { code: "CAREER_PAGE_TOO_LARGE", retryable: false });
    return body;
  }

  async collect(request: ProviderCollectionRequest) {
    const collectedAt = new Date().toISOString();
    const records = parseJobPostingJsonLd(await this.document());
    if (!records.length) throw Object.assign(new Error("No employer-published JobPosting structured data was found on this page."), { code: "NO_STRUCTURED_JOB_POSTING", retryable: false });
    const jobs: DiscoveryJob[] = records.slice(0, request.maximumResults).flatMap((job, index) => {
      const title = text(job.title);
      const company = organization(job);
      const companyName = text(company?.name);
      const originalUrl = text(job.url) ?? this.pageUrl.toString();
      if (!title || !companyName) return [];
      const jobLocation = location(job);
      return [{ sourceId: identifier(job) ?? originalUrl ?? `${this.pageUrl.hostname}:${title}:${index}`, source: this.id, title, company: { sourceId: text(company?.sameAs) ?? text(company?.url) ?? companyName, canonicalKey: text(company?.sameAs) ?? text(company?.url), name: companyName, website: text(company?.sameAs) ?? text(company?.url) }, location: jobLocation, description: plainText(text(job.description)), originalUrl, publishedAt: text(job.datePosted), discoveredAt: collectedAt, employmentType: text(job.employmentType), salary: salary(job), rawMetadata: { validThrough: text(job.validThrough), workArrangement: /telecommute|remote/i.test(text(job.jobLocationType) ?? "") ? "Remote" : undefined, structuredData: "schema.org/JobPosting", sourcePage: this.pageUrl.toString() } }];
    });
    return { providerId: this.id, collectedAt, jobs, sourceRevision: `${this.pageUrl.hostname}:${jobs.length}:${jobs.map((job) => job.sourceId).join("|")}` } as const;
  }

  async health(): Promise<DiscoveryHealth> {
    const started = Date.now();
    try { const records = parseJobPostingJsonLd(await this.document()); return { source: this.id, status: records.length ? "connected" : "degraded", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: records.length ? `${records.length} structured job posting${records.length === 1 ? "" : "s"} available.` : "The page is available but does not publish JobPosting structured data." }; }
    catch (error) { return { source: this.id, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: error instanceof Error ? error.message : "The company career page is unavailable." }; }
  }
}
