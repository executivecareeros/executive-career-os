import type { Opportunity } from "@/types/opportunity";

export type KnowledgeState = "Observed" | "Inferred" | "Confirmed" | "Unknown";
export type ProfileFact<T> = { value: T; state: KnowledgeState; source: string; confidence: number; lastUpdated: string };
export type ExecutiveGeographicProfile = {
  homeCountry: ProfileFact<string | null>;
  currentCountry: ProfileFact<string | null>;
  citizenships: ProfileFact<string[]>;
  workAuthorizations: ProfileFact<string[]>;
  preferredCountries: ProfileFact<string[]>;
  excludedCountries: ProfileFact<string[]>;
  remotePreference: ProfileFact<"Worldwide" | "EMEA" | "EU" | "Country restricted" | "No preference" | null>;
  hybridPreference: ProfileFact<boolean | null>;
  onsitePreference: ProfileFact<boolean | null>;
  relocationPreference: ProfileFact<"Willing" | "Not willing" | "Ask first" | null>;
  timezonePreference: ProfileFact<string[]>;
  languagePreferences: ProfileFact<string[]>;
  travelPreference: ProfileFact<string | null>;
  profileConfidence: number;
};

export type EligibilityState = "Eligible" | "Probably Eligible" | "Eligibility Unknown" | "Relocation Required" | "Sponsorship Required" | "Not Currently Eligible";
export type OpportunityConfidenceResult = {
  eligibility: EligibilityState;
  professionalFit: number;
  skillsFit: number;
  preferenceFit: number;
  freshness: number;
  opportunityConfidence: number;
  recommendationConfidence: number;
  label: "Excellent Opportunity" | "Strong Opportunity" | "Worth Reviewing" | "Possible Fit" | "Stretch or Relocation Option" | "Eligibility Unclear" | "Not Currently Eligible";
  explanation: string;
  missingInformation: string[];
};

const now = "1970-01-01T00:00:00.000Z";
const unknown = <T>(value: T): ProfileFact<T> => ({ value, state: "Unknown", source: "No confirmed evidence", confidence: 0, lastUpdated: now });
export const unknownGeographicProfile = (): ExecutiveGeographicProfile => ({
  homeCountry: unknown(null), currentCountry: unknown(null), citizenships: unknown([]), workAuthorizations: unknown([]), preferredCountries: unknown([]), excludedCountries: unknown([]), remotePreference: unknown(null), hybridPreference: unknown(null), onsitePreference: unknown(null), relocationPreference: unknown(null), timezonePreference: unknown([]), languagePreferences: unknown([]), travelPreference: unknown(null), profileConfidence: 0,
});

export const founderGeographicProfileFixture = (lastUpdated = "2026-07-17T00:00:00.000Z"): ExecutiveGeographicProfile => ({
  ...unknownGeographicProfile(),
  homeCountry: { value: "Türkiye", state: "Confirmed", source: "Executive confirmation", confidence: 1, lastUpdated },
  currentCountry: { value: "Türkiye", state: "Confirmed", source: "Executive confirmation", confidence: 1, lastUpdated },
  citizenships: { value: ["Türkiye", "European Union"], state: "Confirmed", source: "Executive-confirmed CV evidence", confidence: 1, lastUpdated },
  workAuthorizations: { value: ["Türkiye", "European Union"], state: "Confirmed", source: "Executive confirmation", confidence: 1, lastUpdated },
  preferredCountries: { value: ["Türkiye", "European Union", "EMEA"], state: "Confirmed", source: "Founder acceptance fixture", confidence: 1, lastUpdated },
  remotePreference: { value: "Worldwide", state: "Confirmed", source: "Founder acceptance fixture", confidence: 1, lastUpdated },
  profileConfidence: 0.82,
});

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
const includesAny = (text: string, values: string[]) => values.some(value => text.includes(normalize(value)));
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const opportunityText = (opportunity: Opportunity) => normalize([opportunity.country, opportunity.location, opportunity.workArrangement, opportunity.summary, ...(opportunity.exclusions ?? []), ...(opportunity.riskFlags ?? [])].join(" "));
const has = (text: string, expression: RegExp) => expression.test(text);

export function classifyGeographicEligibility(opportunity: Opportunity, profile: ExecutiveGeographicProfile): { state: EligibilityState; explanation: string; missingInformation: string[] } {
  const text = opportunityText(opportunity);
  const excluded = profile.excludedCountries.value.map(normalize);
  const authorizations = profile.workAuthorizations.value.map(normalize);
  const home = normalize(profile.currentCountry.value ?? profile.homeCountry.value ?? "");
  const missing: string[] = [];
  const worldwide = has(text, /\b(worldwide|global remote|work from anywhere|anywhere)\b/);
  const emea = has(text, /\b(emea|europe middle east africa)\b/);
  const eu = has(text, /\b(eu|eea|european union|europe)\b/);
  const turkey = has(text, /\b(turkiye|turkey|istanbul|ankara)\b/);
  const us = has(text, /\b(us|usa|united states|u s)\b/);
  const usResidence = has(text, /\b(us residents?|must reside in (the )?us|authorized to work in (the )?us|us work authorization)\b/);
  const sponsorship = has(text, /\b(visa sponsorship|sponsorship available|will sponsor)\b/);
  const noSponsorship = has(text, /\b(no sponsorship|unable to sponsor|without sponsorship)\b/);
  const relocation = has(text, /\b(relocation support|relocation assistance|relocation required|must relocate)\b/);
  const remote = opportunity.workArrangement === "Remote" || has(text, /\bremote\b/);
  if (includesAny(text, excluded)) return { state: "Not Currently Eligible", explanation: "The role conflicts with an excluded country in your confirmed profile.", missingInformation: missing };
  if (worldwide && remote) return { state: "Eligible", explanation: "The posting explicitly supports worldwide remote work.", missingInformation: missing };
  if (turkey && home === normalize("Türkiye")) return { state: "Eligible", explanation: "The role is compatible with your confirmed Türkiye base.", missingInformation: missing };
  if (home && text.includes(home)) return { state: "Eligible", explanation: "The role is compatible with your confirmed current country.", missingInformation: missing };
  if ((eu || emea) && authorizations.some(item => /european union|eu|eea/.test(item))) return { state: emea && !eu ? "Probably Eligible" : "Eligible", explanation: eu ? "Your confirmed EU work authorization supports this location." : "Your EU authorization and EMEA base support probable eligibility.", missingInformation: missing };
  if (us && authorizations.some(item => /united states|usa|\bus\b/.test(item))) return { state: "Eligible", explanation: "Your confirmed US work authorization supports this location.", missingInformation: missing };
  if (us && sponsorship) return { state: "Sponsorship Required", explanation: "The role indicates sponsorship may be available, but authorization must be confirmed.", missingInformation: ["Sponsorship terms"] };
  if (us && (usResidence || noSponsorship)) return { state: "Not Currently Eligible", explanation: "The posting restricts eligibility to US-authorized or US-resident candidates.", missingInformation: missing };
  if (us) return { state: "Eligibility Unknown", explanation: "The posting does not confirm international remote eligibility or sponsorship.", missingInformation: ["International remote eligibility", "Sponsorship availability"] };
  if (remote && emea) return { state: "Probably Eligible", explanation: "The role appears EMEA-remote, but its residence rules need confirmation.", missingInformation: ["Remote residence requirement"] };
  if (remote) return { state: "Eligibility Unknown", explanation: "Remote does not necessarily mean worldwide; permitted countries are not confirmed.", missingInformation: ["Remote eligibility countries"] };
  if (relocation) return { state: "Relocation Required", explanation: "The posting indicates relocation is required or supported.", missingInformation: ["Relocation terms"] };
  if (profile.relocationPreference.value === "Willing") return { state: "Relocation Required", explanation: "The role may be attainable through your confirmed willingness to relocate.", missingInformation: ["Relocation support"] };
  missing.push("Work authorization or relocation requirement");
  return { state: "Eligibility Unknown", explanation: "Current evidence is insufficient to confirm geographic eligibility.", missingInformation: missing };
}

const hardCap: Record<EligibilityState, number> = { Eligible: 100, "Probably Eligible": 100, "Eligibility Unknown": 54, "Relocation Required": 59, "Sponsorship Required": 49, "Not Currently Eligible": 20 };
function geographicFitScore(opportunity: Opportunity, eligibility: EligibilityState) {
  const text = opportunityText(opportunity);
  if (has(text, /\b(worldwide|global remote|work from anywhere|anywhere)\b/) && opportunity.workArrangement === "Remote") return 100;
  if (has(text, /\b(emea|europe middle east africa)\b/)) return 98;
  if (has(text, /\b(eu|eea|european union|europe)\b/)) return 96;
  if (has(text, /\b(turkiye|turkey|istanbul|ankara)\b/)) return 94;
  return ({ Eligible: 90, "Probably Eligible": 85, "Relocation Required": 60, "Eligibility Unknown": 45, "Sponsorship Required": 30, "Not Currently Eligible": 0 } as Record<EligibilityState, number>)[eligibility];
}

export function assessOpportunityConfidence(opportunity: Opportunity, profile: ExecutiveGeographicProfile): OpportunityConfidenceResult {
  const eligibility = classifyGeographicEligibility(opportunity, profile);
  const professionalFit = clamp(opportunity.executiveFitScore || opportunity.overallScore || 0);
  const required = opportunity.requiredSkills ?? [];
  const strengths = opportunity.matchingStrengths ?? [];
  const skillsFit = required.length ? clamp(strengths.length / required.length * 100) : 50;
  const preferred = profile.preferredCountries.value.map(normalize);
  const text = opportunityText(opportunity);
  const worldwideRemotePreference = profile.remotePreference.value === "Worldwide" && opportunity.workArrangement === "Remote" && has(text, /\b(worldwide|global remote|work from anywhere|anywhere)\b/);
  const preferenceFit = worldwideRemotePreference || (preferred.length && includesAny(text, preferred)) ? 100 : preferred.length ? 45 : 50;
  const ageHours = opportunity.freshness?.ageHours;
  const freshness = ageHours === undefined ? ({ Fresh: 100, Recent: 75, Stale: 25, Unknown: 45 }[opportunity.freshness?.status ?? "Unknown"]) : ageHours <= 48 ? 100 : ageHours <= 168 ? 75 : ageHours <= 720 ? 45 : 20;
  const missingPenalty = eligibility.missingInformation.length * 3 + (opportunity.verificationStatus === "Unverified LinkedIn observation" ? 8 : 0);
  const weighted = geographicFitScore(opportunity, eligibility.state) * .35 + professionalFit * .25 + skillsFit * .20 + preferenceFit * .10 + freshness * .10 - missingPenalty;
  const opportunityConfidence = Math.min(hardCap[eligibility.state], clamp(weighted));
  const evidenceCompleteness = clamp(100 - eligibility.missingInformation.length * 15 - (opportunity.verificationStatus === "Unverified LinkedIn observation" ? 20 : 0));
  const label: OpportunityConfidenceResult["label"] = eligibility.state === "Not Currently Eligible" ? "Not Currently Eligible" : eligibility.state === "Relocation Required" || eligibility.state === "Sponsorship Required" ? "Stretch or Relocation Option" : eligibility.state === "Eligibility Unknown" ? "Eligibility Unclear" : opportunityConfidence >= 85 ? "Excellent Opportunity" : opportunityConfidence >= 70 ? "Strong Opportunity" : opportunityConfidence >= 50 ? "Worth Reviewing" : "Possible Fit";
  return { eligibility: eligibility.state, professionalFit, skillsFit, preferenceFit, freshness, opportunityConfidence, recommendationConfidence: clamp(evidenceCompleteness * .7 + profile.profileConfidence * 100 * .3), label, explanation: eligibility.explanation, missingInformation: eligibility.missingInformation };
}

export function sortOpportunitiesForExecutive(opportunities: readonly Opportunity[], profile: ExecutiveGeographicProfile) {
  return [...opportunities].sort((left, right) => {
    const a = assessOpportunityConfidence(left, profile), b = assessOpportunityConfidence(right, profile);
    return b.opportunityConfidence - a.opportunityConfidence || b.recommendationConfidence - a.recommendationConfidence || Date.parse(right.publishedAt) - Date.parse(left.publishedAt) || left.companyName.localeCompare(right.companyName);
  });
}
