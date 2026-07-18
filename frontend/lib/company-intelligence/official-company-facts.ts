export type OfficialCompanyFact = {
  field: "overview" | "industry" | "headquarters" | "companySize" | "productOrService";
  value: string;
  sourceUrl: string;
  sourceType: "Schema.org" | "OpenGraph";
  observedAt: string;
  confidence: number;
};

export type OfficialCompanyFacts = {
  canonicalName?: string;
  facts: OfficialCompanyFact[];
  sourceUrl: string;
  fingerprint: string;
};

const clean = (value: unknown) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
const unique = <T>(values: T[]) => [...new Set(values)];
const hash = (value: string) => { let result = 0x811c9dc5; for (let index = 0; index < value.length; index += 1) { result ^= value.charCodeAt(index); result = Math.imul(result, 0x01000193) >>> 0; } return result.toString(16).padStart(8, "0"); };
const hostname = (value: string) => { try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; } };
const sameDomain = (source: string, expected: string) => { const actual = hostname(source); const allowed = hostname(expected.includes("://") ? expected : `https://${expected}`); return Boolean(actual && allowed && (actual === allowed || actual.endsWith(`.${allowed}`))); };

function jsonLd(html: string) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => {
    try { const value = JSON.parse(match[1]); return Array.isArray(value) ? value : value?.["@graph"] && Array.isArray(value["@graph"]) ? value["@graph"] : [value]; } catch { return []; }
  }).filter((value): value is Record<string, unknown> => Boolean(value && typeof value === "object"));
}

function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const forward = new RegExp(`<meta\\b[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i").exec(html)?.[1];
  const reverse = new RegExp(`<meta\\b[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${escaped}["'][^>]*>`, "i").exec(html)?.[1];
  return clean(forward ?? reverse);
}

function schemaTypes(value: Record<string, unknown>) { const type = value["@type"]; return (Array.isArray(type) ? type : [type]).map(clean); }
function address(value: unknown) { if (!value || typeof value !== "object") return ""; const record = value as Record<string, unknown>; return unique([clean(record.addressLocality), clean(record.addressRegion), clean(record.addressCountry)].filter(Boolean)).join(", "); }
function offerNames(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const offered = record.itemOffered && typeof record.itemOffered === "object" ? clean((record.itemOffered as Record<string, unknown>).name) : "";
  const nested = Array.isArray(record.itemListElement) ? record.itemListElement.flatMap(offerNames) : [];
  return [offered, ...nested].filter(Boolean);
}

/** Pure deterministic extraction. Network retrieval, persistence and scheduling remain separate controlled concerns. */
export function extractOfficialCompanyFacts(input: { html: string; sourceUrl: string; expectedDomain: string; observedAt: string }): OfficialCompanyFacts {
  if (!sameDomain(input.sourceUrl, input.expectedDomain)) throw new Error("Official company evidence must originate from the verified employer domain.");
  if (input.html.length > 2_000_000) throw new Error("Official company evidence exceeds the bounded extraction limit.");
  const organizations = jsonLd(input.html).filter((item) => schemaTypes(item).some((type) => /^(Organization|Corporation|Company|LocalBusiness)$/i.test(type)));
  const organization = organizations[0];
  const facts: OfficialCompanyFact[] = [];
  const add = (field: OfficialCompanyFact["field"], value: unknown, sourceType: OfficialCompanyFact["sourceType"], confidence: number) => { const normalized = clean(value); if (normalized && !facts.some((fact) => fact.field === field && fact.value === normalized)) facts.push({ field, value: normalized, sourceUrl: input.sourceUrl, sourceType, observedAt: input.observedAt, confidence }); };
  if (organization) {
    add("overview", organization.description, "Schema.org", 95);
    add("industry", organization.industry, "Schema.org", 95);
    add("headquarters", address(organization.address), "Schema.org", 90);
    const employees = organization.numberOfEmployees;
    add("companySize", typeof employees === "object" && employees ? (employees as Record<string, unknown>).value : employees, "Schema.org", 90);
    const products = unique([...(Array.isArray(organization.makesOffer) ? organization.makesOffer.flatMap(offerNames) : offerNames(organization.makesOffer)), ...offerNames(organization.hasOfferCatalog)]);
    products.forEach((value) => add("productOrService", value, "Schema.org", 90));
  }
  if (!facts.some((fact) => fact.field === "overview")) add("overview", meta(input.html, "og:description"), "OpenGraph", 85);
  const canonicalName = clean(organization?.name ?? meta(input.html, "og:site_name")) || undefined;
  const stable = JSON.stringify([canonicalName, facts.map(({ field, value, sourceUrl, sourceType, confidence }) => [field, value, sourceUrl, sourceType, confidence])]);
  return { canonicalName, facts, sourceUrl: input.sourceUrl, fingerprint: `official-company-facts-v1:${hash(stable)}` };
}

export function officialFactsFromPayload(payload: Record<string, unknown> | undefined, verifiedDomain: string | undefined) {
  if (!payload || !verifiedDomain) return [] as OfficialCompanyFact[];
  const intelligence = payload.companyIntelligence;
  if (!intelligence || typeof intelligence !== "object") return [] as OfficialCompanyFact[];
  const facts = (intelligence as Record<string, unknown>).facts;
  if (!Array.isArray(facts)) return [] as OfficialCompanyFact[];
  return facts.filter((item): item is OfficialCompanyFact => {
    if (!item || typeof item !== "object") return false;
    const fact = item as Partial<OfficialCompanyFact>;
    return ["overview", "industry", "headquarters", "companySize", "productOrService"].includes(String(fact.field)) && Boolean(clean(fact.value)) && typeof fact.sourceUrl === "string" && sameDomain(fact.sourceUrl, verifiedDomain) && typeof fact.observedAt === "string" && typeof fact.confidence === "number" && fact.confidence >= 0 && fact.confidence <= 100;
  });
}
