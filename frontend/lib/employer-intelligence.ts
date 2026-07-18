import type { Opportunity } from "@/types/opportunity";
import { officialFactsFromPayload, type OfficialCompanyFact } from "./company-intelligence/official-company-facts.ts";

export type EmployerEvidence = { label: string; value: string; source: string; confidence: number; observedAt?: string };
export type CanonicalEmployerIntelligence = {
  overview: string; industry: string; headquarters: string; operatingCountries: string[]; website?: string; careersUrl?: string;
  companySize: string; productsAndServices: string[]; markets: string[]; activeOpportunities: number; executiveOpportunities: number;
  commercialOpportunities: number; hiringLocations: string[]; hiringActivity: "High" | "Active" | "Limited" | "Unknown";
  freshness: "Current" | "Recent" | "Stale" | "Unknown"; confidence: number; evidence: EmployerEvidence[]; fingerprint: string;
};

export type EmployerRecord = { name: string; country?: string; industry?: string; official_domain?: string; careers_url?: string; ats_provider?: string; identity_confidence: number; last_observed_at?: string; last_verified_at?: string; payload?: Record<string, unknown> };

const executive = /\b(chief|president|vice president|vp|director|head of|general manager|managing director|executive)\b/i;
const commercial = /\b(sales|commercial|revenue|business development|partnership|go.to.market|growth|account)\b/i;
const clean = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter((value) => value && !/^(unknown|not specified)$/i.test(value)))].sort();
function hash(value: string) { let result = 0x811c9dc5; for (let index = 0; index < value.length; index += 1) { result ^= value.charCodeAt(index); result = Math.imul(result, 0x01000193) >>> 0; } return result.toString(16).padStart(8, "0"); }
function officialWebsite(domain: string | undefined) { if (!domain) return undefined; try { return new URL(domain.includes("://") ? domain : `https://${domain}`).toString(); } catch { return undefined; } }

/** Deterministic, cacheable intelligence derived only from canonical employer and opportunity evidence. */
export function buildCanonicalEmployerIntelligence(company: EmployerRecord, opportunities: readonly Opportunity[], now = new Date()): CanonicalEmployerIntelligence {
  const officialFacts = officialFactsFromPayload(company.payload, company.official_domain);
  const official = (field: OfficialCompanyFact["field"]) => officialFacts.find((fact) => fact.field === field);
  const countries = clean([company.country ?? "", ...opportunities.map((item) => item.country)]);
  const locations = clean(opportunities.map((item) => item.location));
  const industries = clean([official("industry")?.value ?? "", company.industry ?? "", ...opportunities.map((item) => item.industry)]);
  const sizes = clean([official("companySize")?.value ?? "", ...opportunities.map((item) => item.companySize)]);
  const last = company.last_verified_at ?? company.last_observed_at ?? opportunities.map((item) => item.lastObservedAt ?? item.discoveredAt).filter(Boolean).sort().at(-1);
  const ageHours = last ? Math.max(0, (now.getTime() - Date.parse(last)) / 3_600_000) : undefined;
  const freshness = ageHours === undefined ? "Unknown" : ageHours <= 48 ? "Current" : ageHours <= 168 ? "Recent" : "Stale";
  const executiveCount = opportunities.filter((item) => executive.test(item.jobTitle)).length;
  const commercialCount = opportunities.filter((item) => commercial.test(`${item.jobTitle} ${item.summary}`)).length;
  const hiringActivity = opportunities.length >= 20 ? "High" : opportunities.length >= 3 ? "Active" : opportunities.length ? "Limited" : "Unknown";
  const evidence: EmployerEvidence[] = [
    { label: "Identity", value: company.name, source: company.ats_provider ?? "Canonical employer registry", confidence: company.identity_confidence, observedAt: last },
    ...(industries[0] ? [{ label: "Industry", value: industries[0], source: company.industry ? "Canonical employer record" : "Published opportunity metadata", confidence: company.industry ? 95 : 75, observedAt: last }] : []),
    ...(countries.length ? [{ label: "Hiring markets", value: countries.join(", "), source: "Published opportunity locations", confidence: 90, observedAt: last }] : []),
    ...(company.official_domain ? [{ label: "Official website", value: company.official_domain, source: "Verified employer identity", confidence: company.identity_confidence, observedAt: company.last_verified_at }] : []),
    ...officialFacts.map((fact) => ({ label: fact.field === "productOrService" ? "Product or service" : fact.field[0].toUpperCase() + fact.field.slice(1), value: fact.value, source: `${fact.sourceType} · ${fact.sourceUrl}`, confidence: fact.confidence, observedAt: fact.observedAt })),
  ];
  const overview = official("overview")?.value ?? (opportunities.length ? `${company.name} has ${opportunities.length} active, source-attributed ${opportunities.length === 1 ? "opportunity" : "opportunities"} across ${locations.length || "unconfirmed"} hiring ${locations.length === 1 ? "location" : "locations"}.` : `No active opportunity evidence is currently available for ${company.name}.`);
  const sourceValue = JSON.stringify([company.name, company.country, company.industry, company.official_domain, company.careers_url, company.last_observed_at, officialFacts, opportunities.map((item) => [item.id, item.contentFingerprint, item.lastObservedAt])]);
  return { overview, industry: industries.join(", ") || "Unknown", headquarters: official("headquarters")?.value ?? "Unknown", operatingCountries: countries, website: officialWebsite(company.official_domain), careersUrl: company.careers_url, companySize: sizes.join(", ") || "Unknown", productsAndServices: clean(officialFacts.filter((fact) => fact.field === "productOrService").map((fact) => fact.value)), markets: countries, activeOpportunities: opportunities.length, executiveOpportunities: executiveCount, commercialOpportunities: commercialCount, hiringLocations: locations, hiringActivity, freshness, confidence: Math.round(evidence.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, evidence.length)), evidence, fingerprint: `employer-intelligence-v2:${hash(sourceValue)}` };
}

/** Bounded, evidence-preserving context for Atlas. It contains no inferred employer claims. */
export function toAtlasEmployerContext(intelligence: CanonicalEmployerIntelligence) {
  return {
    summary: intelligence.overview,
    confirmedFacts: intelligence.evidence.map(({ label, value, source, confidence, observedAt }) => ({ label, value, source, confidence, observedAt })),
    unknowns: [
      ...(intelligence.headquarters === "Unknown" ? ["Headquarters"] : []),
      ...(intelligence.industry === "Unknown" ? ["Industry"] : []),
      ...(intelligence.companySize === "Unknown" ? ["Company size"] : []),
      ...(!intelligence.productsAndServices.length ? ["Products and services"] : []),
    ],
    freshness: intelligence.freshness,
    confidence: intelligence.confidence,
    fingerprint: intelligence.fingerprint,
  };
}
