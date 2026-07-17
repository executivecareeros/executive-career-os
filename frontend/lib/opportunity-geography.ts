import type { Opportunity } from "@/types/opportunity";

export type KnowledgeState = "Observed" | "Inferred" | "Confirmed" | "Unknown";
export type ProfileFact<T> = { value: T; state: KnowledgeState; source: string; sourceReference: string | null; confidence: number; createdAt: string; lastUpdated: string; confirmedAt: string | null; superseded: boolean };
export type ExecutiveGeographicProfile = {
  homeCountry: ProfileFact<string | null>;
  currentCountry: ProfileFact<string | null>;
  currentCity: ProfileFact<string | null>;
  citizenships: ProfileFact<string[]>;
  workAuthorizations: ProfileFact<string[]>;
  preferredCountries: ProfileFact<string[]>;
  excludedCountries: ProfileFact<string[]>;
  preferredRegions: ProfileFact<string[]>;
  remotePreference: ProfileFact<"Worldwide" | "EMEA" | "EU" | "Country restricted" | "No preference" | null>;
  hybridPreference: ProfileFact<boolean | null>;
  onsitePreference: ProfileFact<boolean | null>;
  relocationPreference: ProfileFact<"Willing" | "Not willing" | "Ask first" | null>;
  sponsorshipRequirement: ProfileFact<"Required" | "Not required" | "Unknown" | null>;
  timezonePreference: ProfileFact<string[]>;
  languagePreferences: ProfileFact<string[]>;
  travelPreference: ProfileFact<string | null>;
  profileConfidence: number;
};

export type ExecutiveCareerContext = {
  roleTitles: string[];
  industries: string[];
  capabilities: string[];
};

export function executiveCareerContextFromRows(rows: Array<{ role_title?: string; notes?: string }>): ExecutiveCareerContext {
  const industries = new Set<string>();
  const capabilities = new Set<string>();
  for (const row of rows) {
    if (!row.notes) continue;
    try {
      const notes = JSON.parse(row.notes) as { industries?: unknown; technologies?: unknown; responsibilities?: unknown };
      for (const value of Array.isArray(notes.industries) ? notes.industries : []) if (typeof value === "string" && value.trim()) industries.add(value.trim());
      for (const value of [...(Array.isArray(notes.technologies) ? notes.technologies : []), ...(Array.isArray(notes.responsibilities) ? notes.responsibilities : [])]) if (typeof value === "string" && value.trim()) capabilities.add(value.trim());
    } catch { /* Plain-text legacy notes are not promoted into ranking evidence. */ }
  }
  return { roleTitles: rows.map((row) => row.role_title?.trim()).filter((value): value is string => Boolean(value)), industries: [...industries], capabilities: [...capabilities].slice(0, 40) };
}

export type EligibilityState = "Eligible" | "Probably Eligible" | "Eligibility Unknown" | "Relocation Required" | "Sponsorship Required" | "Not Currently Eligible";
export type OpportunityConfidenceResult = {
  eligibility: EligibilityState;
  professionalFit: number;
  leadershipFit: number;
  experienceFit: number;
  skillsFit: number;
  industryFit: number;
  languageFit: number;
  preferenceFit: number;
  freshness: number;
  sourceConfidence: number;
  dataCompleteness: number;
  opportunityConfidence: number;
  recommendationConfidence: number;
  label: "Excellent Opportunity" | "Strong Opportunity" | "Worth Reviewing" | "Possible Fit" | "Stretch or Relocation Option" | "Eligibility Unclear" | "Not Currently Eligible";
  explanation: string;
  missingInformation: string[];
  hardExclusions: string[];
};

const now = "1970-01-01T00:00:00.000Z";
const unknown = <T>(value: T): ProfileFact<T> => ({ value, state: "Unknown", source: "No confirmed evidence", sourceReference: null, confidence: 0, createdAt: now, lastUpdated: now, confirmedAt: null, superseded: false });
export const unknownGeographicProfile = (): ExecutiveGeographicProfile => ({
  homeCountry: unknown(null), currentCountry: unknown(null), currentCity: unknown(null), citizenships: unknown([]), workAuthorizations: unknown([]), preferredCountries: unknown([]), excludedCountries: unknown([]), preferredRegions: unknown([]), remotePreference: unknown(null), hybridPreference: unknown(null), onsitePreference: unknown(null), relocationPreference: unknown(null), sponsorshipRequirement: unknown(null), timezonePreference: unknown([]), languagePreferences: unknown([]), travelPreference: unknown(null), profileConfidence: 0,
});

function hydrateFact<T>(fallback: ProfileFact<T>, value: unknown): ProfileFact<T> {
  if (!value || typeof value !== "object" || !("value" in value)) return fallback;
  const incoming = value as Partial<ProfileFact<T>>;
  return { ...fallback, ...incoming, sourceReference: incoming.sourceReference ?? null, createdAt: incoming.createdAt ?? incoming.lastUpdated ?? fallback.createdAt, confirmedAt: incoming.confirmedAt ?? (incoming.state === "Confirmed" ? incoming.lastUpdated ?? null : null), superseded: incoming.superseded ?? false } as ProfileFact<T>;
}

/** Adds newly introduced profile fields without changing or promoting legacy evidence. */
export function hydrateExecutiveGeographicProfile(value: unknown): ExecutiveGeographicProfile {
  const fallback = unknownGeographicProfile();
  if (!value || typeof value !== "object") return fallback;
  const profile = value as Partial<ExecutiveGeographicProfile>;
  return {
    homeCountry: hydrateFact(fallback.homeCountry, profile.homeCountry), currentCountry: hydrateFact(fallback.currentCountry, profile.currentCountry), currentCity: hydrateFact(fallback.currentCity, profile.currentCity), citizenships: hydrateFact(fallback.citizenships, profile.citizenships), workAuthorizations: hydrateFact(fallback.workAuthorizations, profile.workAuthorizations), preferredCountries: hydrateFact(fallback.preferredCountries, profile.preferredCountries), excludedCountries: hydrateFact(fallback.excludedCountries, profile.excludedCountries), preferredRegions: hydrateFact(fallback.preferredRegions, profile.preferredRegions), remotePreference: hydrateFact(fallback.remotePreference, profile.remotePreference), hybridPreference: hydrateFact(fallback.hybridPreference, profile.hybridPreference), onsitePreference: hydrateFact(fallback.onsitePreference, profile.onsitePreference), relocationPreference: hydrateFact(fallback.relocationPreference, profile.relocationPreference), sponsorshipRequirement: hydrateFact(fallback.sponsorshipRequirement, profile.sponsorshipRequirement), timezonePreference: hydrateFact(fallback.timezonePreference, profile.timezonePreference), languagePreferences: hydrateFact(fallback.languagePreferences, profile.languagePreferences), travelPreference: hydrateFact(fallback.travelPreference, profile.travelPreference), profileConfidence: typeof profile.profileConfidence === "number" ? profile.profileConfidence : 0,
  };
}

export function preferProfileFact<T>(existing: ProfileFact<T>, incoming: ProfileFact<T>) {
  if (existing.state === "Confirmed" && incoming.state !== "Confirmed") return existing;
  if (existing.state === "Confirmed" && incoming.state === "Confirmed" && Date.parse(existing.lastUpdated) > Date.parse(incoming.lastUpdated)) return existing;
  return incoming;
}

export const founderGeographicProfileFixture = (lastUpdated = "2026-07-17T00:00:00.000Z"): ExecutiveGeographicProfile => ({
  ...unknownGeographicProfile(),
  homeCountry: confirmedFact("Türkiye", "Executive confirmation", lastUpdated),
  currentCountry: confirmedFact("Türkiye", "Executive confirmation", lastUpdated),
  citizenships: confirmedFact(["Türkiye", "European Union"], "Executive-confirmed CV evidence", lastUpdated),
  workAuthorizations: confirmedFact(["Türkiye", "European Union"], "Executive confirmation", lastUpdated),
  preferredCountries: confirmedFact(["Türkiye", "European Union", "EMEA"], "Founder acceptance fixture", lastUpdated),
  preferredRegions: confirmedFact(["EMEA", "European Union"], "Founder acceptance fixture", lastUpdated),
  remotePreference: confirmedFact("Worldwide", "Founder acceptance fixture", lastUpdated),
  profileConfidence: 0.82,
});

function confirmedFact<T>(value: T, source: string, timestamp: string): ProfileFact<T> {
  return { value, state: "Confirmed", source, sourceReference: null, confidence: 1, createdAt: timestamp, lastUpdated: timestamp, confirmedAt: timestamp, superseded: false };
}

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
const includesAny = (text: string, values: string[]) => values.some(value => text.includes(normalize(value)));
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const opportunityText = (opportunity: Opportunity) => normalize([opportunity.country, opportunity.location, opportunity.workArrangement, opportunity.summary, ...(opportunity.exclusions ?? []), ...(opportunity.riskFlags ?? [])].join(" "));
const has = (text: string, expression: RegExp) => expression.test(text);

const executiveRoleFamilies = {
  sales: ["sales", "account executive", "commercial director"],
  revenue: ["revenue", "cro", "chief revenue officer"],
  businessDevelopment: ["business development", "partnership", "alliances"],
  commercialLeadership: ["commercial leadership", "commercial strategy", "go to market", "gtm"],
  generalManagement: ["general manager", "managing director", "country manager", "business unit"],
  enterpriseTechnology: ["enterprise software", "saas", "artificial intelligence", "cybersecurity", "broadcast technology", "media technology"],
} as const;

function familyMatches(text: string) {
  const padded = ` ${normalize(text)} `;
  return Object.entries(executiveRoleFamilies).filter(([, terms]) => terms.some((term) => padded.includes(` ${normalize(term)} `))).map(([family]) => family);
}

function careerFit(opportunity: Opportunity, context?: ExecutiveCareerContext) {
  const baseline = clamp(opportunity.executiveFitScore || opportunity.overallScore || 0);
  if (!context || !context.roleTitles.length) return { professionalFit: baseline, industryFit: clamp(opportunity.strategicOpportunityScore || 50) };
  const roleEvidence = context.roleTitles.join(" ");
  const profileFamilies = new Set(familyMatches(roleEvidence));
  const opportunityFamilies = familyMatches(`${opportunity.jobTitle} ${opportunity.summary}`);
  const familyOverlap = opportunityFamilies.filter((family) => profileFamilies.has(family)).length;
  const roleTokens = new Set(normalize(roleEvidence).split(" ").filter((token) => token.length > 3));
  const opportunityTokens = new Set(normalize(opportunity.jobTitle).split(" ").filter((token) => token.length > 3));
  const tokenOverlap = [...opportunityTokens].filter((token) => roleTokens.has(token)).length;
  const titleFit = opportunityFamilies.length ? clamp(42 + familyOverlap * 24 + tokenOverlap * 8) : clamp(38 + tokenOverlap * 12);
  const opportunityCapabilityText = normalize([opportunity.summary, ...opportunity.requiredSkills, ...opportunity.keyResponsibilities].join(" "));
  const capabilityMatches = context.capabilities.filter((capability) => opportunityCapabilityText.includes(normalize(capability))).length;
  const capabilityFit = context.capabilities.length ? clamp(35 + (capabilityMatches / Math.min(context.capabilities.length, 8)) * 65) : 50;
  const industryText = normalize(`${opportunity.industry} ${opportunity.summary}`);
  const industryMatches = context.industries.filter((industry) => industryText.includes(normalize(industry))).length;
  const industryFit = context.industries.length ? clamp(35 + (industryMatches / Math.min(context.industries.length, 4)) * 65) : clamp(opportunity.strategicOpportunityScore || 50);
  return { professionalFit: clamp(baseline * .25 + titleFit * .55 + capabilityFit * .20), industryFit };
}

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

const hardCap: Record<EligibilityState, number> = { Eligible: 100, "Probably Eligible": 100, "Eligibility Unknown": 49, "Relocation Required": 59, "Sponsorship Required": 54, "Not Currently Eligible": 20 };
function geographicFitScore(opportunity: Opportunity, eligibility: EligibilityState) {
  const text = opportunityText(opportunity);
  if (has(text, /\b(worldwide|global remote|work from anywhere|anywhere)\b/) && opportunity.workArrangement === "Remote") return 100;
  if (has(text, /\b(emea|europe middle east africa)\b/)) return 98;
  if (has(text, /\b(eu|eea|european union|europe)\b/)) return 96;
  if (has(text, /\b(turkiye|turkey|istanbul|ankara)\b/)) return 94;
  return ({ Eligible: 90, "Probably Eligible": 85, "Relocation Required": 60, "Sponsorship Required": 50, "Eligibility Unknown": 40, "Not Currently Eligible": 0 } as Record<EligibilityState, number>)[eligibility];
}

export function assessOpportunityConfidence(opportunity: Opportunity, profile: ExecutiveGeographicProfile, careerContext?: ExecutiveCareerContext): OpportunityConfidenceResult {
  const eligibility = classifyGeographicEligibility(opportunity, profile);
  const career = careerFit(opportunity, careerContext);
  const professionalFit = career.professionalFit;
  const leadershipFit = professionalFit;
  const experienceFit = clamp(opportunity.overallScore || professionalFit);
  const required = opportunity.requiredSkills ?? [];
  const strengths = opportunity.matchingStrengths ?? [];
  const text = opportunityText(opportunity);
  const skillsFit = required.length ? clamp(strengths.length / required.length * 100) : 50;
  const industryFit = career.industryFit;
  const languageFit = profile.languagePreferences.value.length ? (profile.languagePreferences.value.some(language => text.includes(normalize(language))) ? 100 : 50) : 50;
  const preferred = profile.preferredCountries.value.map(normalize);
  const worldwideRemotePreference = profile.remotePreference.value === "Worldwide" && opportunity.workArrangement === "Remote" && has(text, /\b(worldwide|global remote|work from anywhere|anywhere)\b/);
  const preferenceFit = worldwideRemotePreference || (preferred.length && includesAny(text, preferred)) ? 100 : preferred.length ? 45 : 50;
  const ageHours = opportunity.freshness?.ageHours;
  const freshness = ageHours === undefined ? ({ Fresh: 100, Recent: 75, Stale: 25, Unknown: 45 }[opportunity.freshness?.status ?? "Unknown"]) : ageHours <= 48 ? 100 : ageHours <= 168 ? 75 : ageHours <= 720 ? 45 : 20;
  const sourceConfidence = clamp(opportunity.confidenceScore ?? 0);
  const dataCompleteness = clamp(opportunity.completenessScore ?? [opportunity.companyName, opportunity.jobTitle, opportunity.location, opportunity.country, opportunity.summary, opportunity.sourceUrl].filter(Boolean).length / 6 * 100);
  const missingPenalty = eligibility.missingInformation.length * 3 + (opportunity.verificationStatus === "Unverified LinkedIn observation" ? 8 : 0);
  const weighted = geographicFitScore(opportunity, eligibility.state) * .30 + professionalFit * .30 + skillsFit * .15 + industryFit * .10 + preferenceFit * .10 + ((freshness + sourceConfidence) / 2) * .05 - missingPenalty;
  const opportunityConfidence = Math.min(hardCap[eligibility.state], clamp(weighted));
  const evidenceCompleteness = clamp(100 - eligibility.missingInformation.length * 15 - (opportunity.verificationStatus === "Unverified LinkedIn observation" ? 20 : 0));
  const label: OpportunityConfidenceResult["label"] = eligibility.state === "Not Currently Eligible" ? "Not Currently Eligible" : eligibility.state === "Relocation Required" || eligibility.state === "Sponsorship Required" ? "Stretch or Relocation Option" : eligibility.state === "Eligibility Unknown" ? "Eligibility Unclear" : opportunityConfidence >= 85 ? "Excellent Opportunity" : opportunityConfidence >= 70 ? "Strong Opportunity" : opportunityConfidence >= 50 ? "Worth Reviewing" : "Possible Fit";
  const hardExclusions = eligibility.state === "Not Currently Eligible" ? [eligibility.explanation] : [];
  return { eligibility: eligibility.state, professionalFit, leadershipFit, experienceFit, skillsFit, industryFit, languageFit, preferenceFit, freshness, sourceConfidence, dataCompleteness, opportunityConfidence, recommendationConfidence: clamp(evidenceCompleteness * .7 + profile.profileConfidence * 100 * .3), label, explanation: eligibility.explanation, missingInformation: eligibility.missingInformation, hardExclusions };
}

export function sortOpportunitiesForExecutive(opportunities: readonly Opportunity[], profile: ExecutiveGeographicProfile, careerContext?: ExecutiveCareerContext) {
  return [...opportunities].sort((left, right) => {
    const a = assessOpportunityConfidence(left, profile, careerContext), b = assessOpportunityConfidence(right, profile, careerContext);
    return b.opportunityConfidence - a.opportunityConfidence || b.recommendationConfidence - a.recommendationConfidence || Date.parse(right.publishedAt) - Date.parse(left.publishedAt) || left.companyName.localeCompare(right.companyName);
  });
}
