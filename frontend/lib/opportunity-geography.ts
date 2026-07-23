import type { Opportunity } from "@/types/opportunity";

export type KnowledgeState = "Observed" | "Inferred" | "Confirmed" | "Unknown";
export type ProfileFact<T> = { value: T; state: KnowledgeState; source: string; sourceReference: string | null; confidence: number; createdAt: string; lastUpdated: string; confirmedAt: string | null; superseded: boolean };
export type ExecutiveManualPreferences = {
  locations: string[]; countries: string[]; industries: string[]; titles: string[]; seniorities: string[];
  salaryMinimum: number | null; salaryMaximum: number | null; salaryCurrency: string | null;
  employmentTypes: string[]; remotePreferences: string[]; companySizes: string[]; travelPreference: string | null;
  source: "User Preference"; updatedAt: string | null;
};
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
  manualPreferences: ExecutiveManualPreferences;
  profileConfidence: number;
};

export type ExecutiveCareerContext = {
  roleTitles: string[];
  industries: string[];
  capabilities: string[];
  languages: string[];
  achievements?: string[];
  leadershipScopes?: string[];
  geographicResponsibilities?: string[];
  revenueScopes?: string[];
  employmentTypes?: string[];
};

export function executiveCareerContextFromRows(rows: Array<{ role_title?: string; notes?: string }>): ExecutiveCareerContext {
  const industries = new Set<string>();
  const capabilities = new Set<string>();
  const languages = new Set<string>();
  const achievements = new Set<string>();
  const leadershipScopes = new Set<string>();
  const geographicResponsibilities = new Set<string>();
  const revenueScopes = new Set<string>();
  const employmentTypes = new Set<string>();
  for (const row of rows) {
    if (!row.notes) continue;
    try {
      const notes = JSON.parse(row.notes) as { industries?: unknown; technologies?: unknown; responsibilities?: unknown; achievements?: unknown; leadershipScope?: unknown; geographicResponsibility?: unknown; revenueScope?: unknown; employmentType?: unknown; documentContext?: unknown };
      for (const value of Array.isArray(notes.industries) ? notes.industries : []) if (typeof value === "string" && value.trim()) industries.add(value.trim());
      for (const value of [...(Array.isArray(notes.technologies) ? notes.technologies : []), ...(Array.isArray(notes.responsibilities) ? notes.responsibilities : [])]) if (typeof value === "string" && value.trim()) capabilities.add(value.trim());
      for (const value of Array.isArray(notes.achievements) ? notes.achievements : []) if (typeof value === "string" && value.trim()) achievements.add(value.trim());
      if (typeof notes.leadershipScope === "string" && notes.leadershipScope.trim()) leadershipScopes.add(notes.leadershipScope.trim());
      if (typeof notes.geographicResponsibility === "string" && notes.geographicResponsibility.trim()) geographicResponsibilities.add(notes.geographicResponsibility.trim());
      if (typeof notes.revenueScope === "string" && notes.revenueScope.trim()) revenueScopes.add(notes.revenueScope.trim());
      if (typeof notes.employmentType === "string" && notes.employmentType.trim()) employmentTypes.add(notes.employmentType.trim());
      const documentContext = typeof notes.documentContext === "string" ? JSON.parse(notes.documentContext) as { skills?: unknown; languages?: unknown } : null;
      for (const skill of Array.isArray(documentContext?.skills) ? documentContext.skills : []) {
        if (skill && typeof skill === "object" && "name" in skill && typeof skill.name === "string" && skill.name.trim()) capabilities.add(skill.name.trim());
      }
      for (const language of Array.isArray(documentContext?.languages) ? documentContext.languages : []) {
        if (language && typeof language === "object" && "language" in language && typeof language.language === "string" && language.language.trim()) languages.add(language.language.trim());
      }
    } catch { /* Plain-text legacy notes are not promoted into ranking evidence. */ }
  }
  return { roleTitles: rows.map((row) => row.role_title?.trim()).filter((value): value is string => Boolean(value)), industries: [...industries], capabilities: [...capabilities].slice(0, 80), languages: [...languages], achievements: [...achievements].slice(0, 40), leadershipScopes: [...leadershipScopes], geographicResponsibilities: [...geographicResponsibilities], revenueScopes: [...revenueScopes], employmentTypes: [...employmentTypes] };
}

export type ExecutiveBehaviorProfile = {
  evidenceCount: number;
  titleFamilies: Record<string, number>;
  industries: Record<string, number>;
  countries: Record<string, number>;
  workArrangements: Record<string, number>;
  employmentTypes: Record<string, number>;
};

export const emptyExecutiveBehaviorProfile = (): ExecutiveBehaviorProfile => ({ evidenceCount: 0, titleFamilies: {}, industries: {}, countries: {}, workArrangements: {}, employmentTypes: {} });

export type EligibilityState = "Eligible" | "Probably Eligible" | "Eligibility Unknown" | "Relocation Required" | "Sponsorship Required" | "Not Currently Eligible";
export type OpportunityConfidenceResult = {
  eligibility: EligibilityState;
  professionalFit: number;
  leadershipFit: number;
  experienceFit: number;
  skillsFit: number;
  industryFit: number;
  languageFit: number;
  seniorityFit: number;
  achievementFit: number;
  leadershipScopeFit: number;
  compensationFit: number;
  workModelFit: number;
  travelFit: number;
  behaviorFit: number;
  behaviorEvidenceCount: number;
  preferenceFit: number;
  freshness: number;
  sourceConfidence: number;
  dataCompleteness: number;
  opportunityConfidence: number;
  recommendationConfidence: number;
  label: "Excellent Opportunity" | "Strong Opportunity" | "Worth Reviewing" | "Possible Fit" | "Stretch or Relocation Option" | "Eligibility Unclear" | "Not Currently Eligible";
  explanation: string;
  professionalExplanation: string;
  missingInformation: string[];
  hardExclusions: string[];
};

const now = "1970-01-01T00:00:00.000Z";
const unknown = <T>(value: T): ProfileFact<T> => ({ value, state: "Unknown", source: "No confirmed evidence", sourceReference: null, confidence: 0, createdAt: now, lastUpdated: now, confirmedAt: null, superseded: false });
export const unknownGeographicProfile = (): ExecutiveGeographicProfile => ({
  homeCountry: unknown(null), currentCountry: unknown(null), currentCity: unknown(null), citizenships: unknown([]), workAuthorizations: unknown([]), preferredCountries: unknown([]), excludedCountries: unknown([]), preferredRegions: unknown([]), remotePreference: unknown(null), hybridPreference: unknown(null), onsitePreference: unknown(null), relocationPreference: unknown(null), sponsorshipRequirement: unknown(null), timezonePreference: unknown([]), languagePreferences: unknown([]), travelPreference: unknown(null), manualPreferences: { locations: [], countries: [], industries: [], titles: [], seniorities: [], salaryMinimum: null, salaryMaximum: null, salaryCurrency: null, employmentTypes: [], remotePreferences: [], companySizes: [], travelPreference: null, source: "User Preference", updatedAt: null }, profileConfidence: 0,
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
    homeCountry: hydrateFact(fallback.homeCountry, profile.homeCountry), currentCountry: hydrateFact(fallback.currentCountry, profile.currentCountry), currentCity: hydrateFact(fallback.currentCity, profile.currentCity), citizenships: hydrateFact(fallback.citizenships, profile.citizenships), workAuthorizations: hydrateFact(fallback.workAuthorizations, profile.workAuthorizations), preferredCountries: hydrateFact(fallback.preferredCountries, profile.preferredCountries), excludedCountries: hydrateFact(fallback.excludedCountries, profile.excludedCountries), preferredRegions: hydrateFact(fallback.preferredRegions, profile.preferredRegions), remotePreference: hydrateFact(fallback.remotePreference, profile.remotePreference), hybridPreference: hydrateFact(fallback.hybridPreference, profile.hybridPreference), onsitePreference: hydrateFact(fallback.onsitePreference, profile.onsitePreference), relocationPreference: hydrateFact(fallback.relocationPreference, profile.relocationPreference), sponsorshipRequirement: hydrateFact(fallback.sponsorshipRequirement, profile.sponsorshipRequirement), timezonePreference: hydrateFact(fallback.timezonePreference, profile.timezonePreference), languagePreferences: hydrateFact(fallback.languagePreferences, profile.languagePreferences), travelPreference: hydrateFact(fallback.travelPreference, profile.travelPreference), manualPreferences: { ...fallback.manualPreferences, ...(profile.manualPreferences && typeof profile.manualPreferences === "object" ? profile.manualPreferences : {}) }, profileConfidence: typeof profile.profileConfidence === "number" ? profile.profileConfidence : 0,
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
const signalTokens = (value: string) => normalize(value).split(" ").filter((token) => token.length > 2 && !["and", "the", "for", "with", "from", "into", "across"].includes(token));
function evidenceSupports(term: string, evidence: string) {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return false;
  if (evidence.includes(normalizedTerm)) return true;
  const tokens = signalTokens(normalizedTerm);
  return tokens.length > 0 && tokens.filter((token) => evidence.includes(token)).length / tokens.length >= .6;
}
const knownLanguages = ["English", "French", "German", "Spanish", "Italian", "Portuguese", "Dutch", "Turkish", "Bulgarian", "Russian", "Arabic", "Mandarin", "Chinese", "Japanese", "Korean", "Hindi", "Polish", "Swedish", "Norwegian", "Danish", "Finnish", "Greek", "Romanian", "Czech", "Hungarian"];

const executiveRoleFamilies = {
  sales: ["sales", "account executive", "commercial director"],
  revenue: ["revenue", "chief revenue officer"],
  businessDevelopment: ["business development", "partnership", "partner funding", "fundraising", "alliances"],
  commercialLeadership: ["commercial leadership", "commercial strategy", "go to market", "gtm"],
  generalManagement: ["general manager", "managing director", "country manager", "business unit"],
  technical: ["engineer", "engineering", "developer", "technical lead", "tech lead", "technical support", "solutions architect", "data scientist", "information technology"],
  product: ["product manager", "product management", "product director", "chief product officer"],
  finance: ["finance", "financial", "accounting", "controller", "chief financial officer", "cfo"],
  people: ["human resources", "people officer", "talent", "recruiter"],
  marketing: ["marketing", "brand", "communications", "chief marketing officer", "cmo"],
  operations: ["operations", "operational", "chief operating officer", "coo"],
} as const;

const leadershipTitle = /\b(chief|c[a-z]o|founder|president|vice president|vp|director|head|managing director|country manager|general manager|partner)\b/;
const individualContributorTitle = /\b(engineer|developer|specialist|coordinator|analyst|representative|associate|administrator|technician|consultant|planner)\b/;

function familyMatches(text: string) {
  const padded = ` ${normalize(text)} `;
  return Object.entries(executiveRoleFamilies).filter(([, terms]) => terms.some((term) => padded.includes(` ${normalize(term)} `))).map(([family]) => family);
}

const seniorityLevel = (title: string) => {
  const value = normalize(title);
  if (/\b(chief|c[a-z]o|founder|president)\b/.test(value)) return 5;
  if (/\b(svp|evp|vice president|vp)\b/.test(value)) return 4;
  if (/\b(director|head|managing director|general manager|country manager|partner)\b/.test(value)) return 3;
  if (/\b(manager|lead)\b/.test(value)) return 2;
  return 1;
};

function seniorityFitFor(opportunity: Opportunity, context?: ExecutiveCareerContext) {
  if (!context?.roleTitles.length) return 50;
  const profile = Math.max(...context.roleTitles.map(seniorityLevel));
  const role = seniorityLevel(opportunity.jobTitle);
  const distance = role - profile;
  return distance === 0 ? 100 : distance === 1 ? 82 : distance > 1 ? 52 : distance === -1 ? 42 : 15;
}

function evidenceOverlap(values: string[], evidence: string, matched = 88, unknown = 50) {
  if (!values.length) return unknown;
  const matches = values.filter((value) => evidenceSupports(value, evidence)).length;
  return matches ? clamp(55 + Math.min(1, matches / Math.min(values.length, 4)) * (matched - 55)) : 35;
}

function publishedCompensationFit(opportunity: Opportunity, profile: ExecutiveGeographicProfile) {
  const minimum = profile.manualPreferences.salaryMinimum;
  if (!minimum) return 50;
  if (!opportunity.salaryMin && !opportunity.salaryMax) return 50;
  const expectedCurrency = profile.manualPreferences.salaryCurrency;
  if (expectedCurrency && opportunity.salaryCurrency && expectedCurrency !== opportunity.salaryCurrency) return 50;
  const maximum = opportunity.salaryMax ?? opportunity.salaryMin ?? 0;
  return maximum >= minimum ? 100 : maximum >= minimum * .9 ? 65 : 15;
}

function travelFitFor(opportunity: Opportunity, profile: ExecutiveGeographicProfile) {
  const preference = profile.manualPreferences.travelPreference ?? profile.travelPreference.value;
  if (!preference) return 50;
  if (/flexible/i.test(preference)) return 100;
  const allowed = Number(preference.match(/\d+/)?.[0] ?? (/no travel/i.test(preference) ? 0 : NaN));
  const required = Number(opportunity.travelRequirement.match(/\d+/)?.[0] ?? NaN);
  if (!Number.isFinite(allowed) || !Number.isFinite(required)) return 50;
  return required <= allowed ? 100 : required <= allowed + 10 ? 60 : 20;
}

function learnedBehaviorFit(opportunity: Opportunity, behavior?: ExecutiveBehaviorProfile) {
  if (!behavior || behavior.evidenceCount < 3) return 50;
  const values = [
    ...familyMatches(opportunity.jobTitle).map((family) => behavior.titleFamilies[family]),
    behavior.industries[normalize(opportunity.industry)], behavior.countries[normalize(opportunity.country)],
    behavior.workArrangements[normalize(opportunity.workArrangement)], behavior.employmentTypes[normalize(opportunity.employmentType)],
  ].filter((value): value is number => typeof value === "number");
  if (!values.length) return 50;
  return clamp(50 + values.reduce((sum, value) => sum + value, 0) / values.length * 10);
}

const commercialFamilies = new Set(["sales", "revenue", "businessDevelopment", "commercialLeadership"]);
function relatedFamilyOverlap(profileFamilies: Set<string>, opportunityFamilies: string[]) {
  return opportunityFamilies.filter((family) => profileFamilies.has(family) || (commercialFamilies.has(family) && [...profileFamilies].some((profileFamily) => commercialFamilies.has(profileFamily)))).length;
}

function careerFit(opportunity: Opportunity, context?: ExecutiveCareerContext) {
  const baseline = clamp(opportunity.executiveFitScore || opportunity.overallScore || 0);
  if (!context || !context.roleTitles.length) return { professionalFit: baseline, industryFit: clamp(opportunity.strategicOpportunityScore || 50), mismatch: false, explanation: "Professional fit is not yet personalized because no confirmed role history is available." };
  const roleEvidence = context.roleTitles.join(" ");
  const profileFamilies = new Set(familyMatches(roleEvidence));
  // Role function is determined from the title. Industry and skill language in
  // the description must not turn an unrelated function into a career match.
  const opportunityFamilies = familyMatches(opportunity.jobTitle);
  const familyOverlap = relatedFamilyOverlap(profileFamilies, opportunityFamilies);
  const roleTokens = new Set(normalize(roleEvidence).split(" ").filter((token) => token.length > 3));
  const opportunityTokens = new Set(normalize(opportunity.jobTitle).split(" ").filter((token) => token.length > 3));
  const tokenOverlap = [...opportunityTokens].filter((token) => roleTokens.has(token)).length;
  let titleFit = opportunityFamilies.length ? clamp(38 + familyOverlap * 28 + tokenOverlap * 8) : clamp(32 + tokenOverlap * 12);
  const profileLeadershipShare = context.roleTitles.filter((title) => leadershipTitle.test(normalize(title))).length / context.roleTitles.length;
  const opportunityTitle = normalize(opportunity.jobTitle);
  const opportunityIsLeadership = leadershipTitle.test(opportunityTitle);
  const explicitlyIndividualContributor = /\bindividual contributor\b/.test(normalize(opportunity.summary));
  const opportunityIsIndividualContributor = (individualContributorTitle.test(opportunityTitle) && !opportunityIsLeadership) || explicitlyIndividualContributor;
  const functionMismatch = opportunityFamilies.length > 0 && familyOverlap === 0;
  if (profileLeadershipShare >= .5 && opportunityIsIndividualContributor) titleFit = Math.min(titleFit, 12);
  else if (functionMismatch) titleFit = Math.min(titleFit, 24);
  else if (profileLeadershipShare >= .5 && opportunityIsLeadership && familyOverlap > 0) titleFit = Math.max(titleFit, 82);
  const opportunityCapabilityText = normalize([opportunity.summary, ...opportunity.requiredSkills, ...opportunity.keyResponsibilities].join(" "));
  const capabilityMatches = context.capabilities.filter((capability) => evidenceSupports(capability, opportunityCapabilityText)).length;
  const capabilityFit = context.capabilities.length ? clamp(35 + (capabilityMatches / Math.min(context.capabilities.length, 8)) * 65) : 50;
  const industryText = normalize(`${opportunity.industry} ${opportunity.summary}`);
  const industryMatches = context.industries.filter((industry) => industryText.includes(normalize(industry))).length;
  const industryFit = context.industries.length ? clamp(35 + (industryMatches / Math.min(context.industries.length, 4)) * 65) : clamp(opportunity.strategicOpportunityScore || 50);
  let professionalFit = clamp(baseline * .15 + titleFit * .70 + capabilityFit * .15);
  if (profileLeadershipShare >= .5 && opportunityIsIndividualContributor) professionalFit = Math.min(professionalFit, 30);
  const explanation = profileLeadershipShare >= .5 && opportunityIsIndividualContributor
    ? "The role is an individual-contributor position and does not align with the confirmed executive leadership history."
    : functionMismatch
      ? "The role function is not supported by the confirmed career-title evidence."
      : familyOverlap > 0 && opportunityIsLeadership
        ? "The role function and leadership level align with confirmed career-title evidence."
        : familyOverlap > 0
          ? "The role function aligns with confirmed career-title evidence."
          : "The confirmed career titles provide limited evidence for this role function.";
  return { professionalFit, industryFit, mismatch: functionMismatch || (profileLeadershipShare >= .5 && opportunityIsIndividualContributor), explanation };
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

export function assessOpportunityConfidence(opportunity: Opportunity, profile: ExecutiveGeographicProfile, careerContext?: ExecutiveCareerContext, behavior?: ExecutiveBehaviorProfile): OpportunityConfidenceResult {
  const eligibility = classifyGeographicEligibility(opportunity, profile);
  const career = careerFit(opportunity, careerContext);
  const professionalFit = career.professionalFit;
  const leadershipFit = professionalFit;
  const experienceFit = clamp(opportunity.overallScore || professionalFit);
  const required = opportunity.requiredSkills ?? [];
  const strengths = opportunity.matchingStrengths ?? [];
  const text = opportunityText(opportunity);
  const confirmedCapabilityEvidence = normalize([...(careerContext?.capabilities ?? []), ...strengths].join(" "));
  const skillsFit = required.length
    ? clamp(required.filter((skill) => evidenceSupports(skill, confirmedCapabilityEvidence)).length / required.length * 100)
    : careerContext?.capabilities.length
      ? (careerContext.capabilities.some((capability) => evidenceSupports(capability, normalize([opportunity.jobTitle, opportunity.summary, ...opportunity.keyResponsibilities].join(" ")))) ? 75 : 50)
      : 50;
  const industryFit = career.industryFit;
  const confirmedLanguages = [...new Set([...profile.languagePreferences.value, ...(careerContext?.languages ?? [])])];
  const postingLanguages = knownLanguages.filter((language) => text.includes(normalize(language)) || required.some((skill) => normalize(skill).includes(normalize(language))));
  const languageFit = postingLanguages.length
    ? (postingLanguages.some((language) => confirmedLanguages.some((confirmed) => normalize(confirmed) === normalize(language))) ? 100 : 20)
    : 50;
  const seniorityFit = seniorityFitFor(opportunity, careerContext);
  const roleEvidence = normalize([opportunity.jobTitle, opportunity.summary, ...opportunity.keyResponsibilities, ...required].join(" "));
  const achievementFit = evidenceOverlap(careerContext?.achievements ?? [], roleEvidence);
  const leadershipScopeFit = evidenceOverlap(careerContext?.leadershipScopes ?? [], roleEvidence);
  const compensationFit = publishedCompensationFit(opportunity, profile);
  const travelFit = travelFitFor(opportunity, profile);
  const preferred = profile.preferredCountries.value.map(normalize);
  const worldwideRemotePreference = profile.remotePreference.value === "Worldwide" && opportunity.workArrangement === "Remote" && has(text, /\b(worldwide|global remote|work from anywhere|anywhere)\b/);
  const preferenceFit = worldwideRemotePreference || (preferred.length && includesAny(text, preferred)) ? 100 : preferred.length ? 45 : 50;
  const manual = profile.manualPreferences;
  const manualSignals: boolean[] = [];
  if (manual.countries.length) manualSignals.push(includesAny(text, manual.countries));
  if (manual.locations.length) manualSignals.push(includesAny(text, manual.locations));
  if (manual.industries.length) manualSignals.push(includesAny(normalize(`${opportunity.industry} ${opportunity.summary}`), manual.industries));
  if (manual.titles.length) manualSignals.push(includesAny(normalize(opportunity.jobTitle), manual.titles));
  if (manual.employmentTypes.length) manualSignals.push(manual.employmentTypes.includes(opportunity.employmentType));
  if (manual.remotePreferences.length) manualSignals.push(manual.remotePreferences.includes(opportunity.workArrangement));
  if (manual.companySizes.length) manualSignals.push(manual.companySizes.some((size) => normalize(opportunity.companySize).includes(normalize(size))));
  const userPreferenceFit = manual.updatedAt && manualSignals.length ? clamp(manualSignals.filter(Boolean).length / manualSignals.length * 100) : preferenceFit;
  const workModelSignals = [
    manual.employmentTypes.length ? manual.employmentTypes.includes(opportunity.employmentType) : undefined,
    manual.remotePreferences.length ? manual.remotePreferences.includes(opportunity.workArrangement) : undefined,
    manual.companySizes.length ? manual.companySizes.some((size) => normalize(opportunity.companySize).includes(normalize(size))) : undefined,
  ].filter((value): value is boolean => typeof value === "boolean");
  const workModelFit = workModelSignals.length ? clamp(workModelSignals.filter(Boolean).length / workModelSignals.length * 100) : 50;
  const behaviorFit = learnedBehaviorFit(opportunity, behavior);
  const ageHours = opportunity.freshness?.ageHours;
  const freshness = ageHours === undefined ? ({ Fresh: 100, Recent: 75, Stale: 25, Unknown: 45 }[opportunity.freshness?.status ?? "Unknown"]) : ageHours <= 48 ? 100 : ageHours <= 168 ? 75 : ageHours <= 720 ? 45 : 20;
  const sourceConfidence = clamp(opportunity.confidenceScore ?? 0);
  const dataCompleteness = clamp(opportunity.completenessScore ?? [opportunity.companyName, opportunity.jobTitle, opportunity.location, opportunity.country, opportunity.summary, opportunity.sourceUrl].filter(Boolean).length / 6 * 100);
  const missingPenalty = eligibility.missingInformation.length * 3 + (opportunity.verificationStatus === "Unverified LinkedIn observation" ? 8 : 0);
  const evidenceWeightedCareer = professionalFit * .17 + seniorityFit * .08 + skillsFit * .14 + industryFit * .08 + achievementFit * .04 + leadershipScopeFit * .04;
  const preferenceAndConditions = userPreferenceFit * .06 + languageFit * .05 + compensationFit * .03 + workModelFit * .03 + travelFit * .02;
  const behaviorAdjustment = behavior && behavior.evidenceCount >= 3 ? (behaviorFit - 50) * Math.min(.12, behavior.evidenceCount * .012) : 0;
  const weighted = geographicFitScore(opportunity, eligibility.state) * .30 + evidenceWeightedCareer + preferenceAndConditions + ((freshness + sourceConfidence) / 2) * .06 + behaviorAdjustment - missingPenalty;
  let opportunityConfidence = Math.min(hardCap[eligibility.state], clamp(weighted));
  if (postingLanguages.length && languageFit < 50) opportunityConfidence = Math.max(0, opportunityConfidence - 10);
  // Clear career-function conflicts are not strong recommendations even when
  // the role has favorable location evidence. Geography can disqualify a role;
  // it cannot manufacture professional fit.
  if (career.mismatch && careerContext?.roleTitles.length) opportunityConfidence = Math.min(opportunityConfidence, 39);
  const evidenceCompleteness = clamp(100 - eligibility.missingInformation.length * 15 - (opportunity.verificationStatus === "Unverified LinkedIn observation" ? 20 : 0));
  const label: OpportunityConfidenceResult["label"] = eligibility.state === "Not Currently Eligible" ? "Not Currently Eligible" : eligibility.state === "Relocation Required" || eligibility.state === "Sponsorship Required" ? "Stretch or Relocation Option" : eligibility.state === "Eligibility Unknown" ? "Eligibility Unclear" : opportunityConfidence >= 85 ? "Excellent Opportunity" : opportunityConfidence >= 70 ? "Strong Opportunity" : opportunityConfidence >= 50 ? "Worth Reviewing" : "Possible Fit";
  const hardExclusions = eligibility.state === "Not Currently Eligible" ? [eligibility.explanation] : [];
  return { eligibility: eligibility.state, professionalFit, leadershipFit, experienceFit, skillsFit, industryFit, languageFit, seniorityFit, achievementFit, leadershipScopeFit, compensationFit, workModelFit, travelFit, behaviorFit, behaviorEvidenceCount: behavior?.evidenceCount ?? 0, preferenceFit: userPreferenceFit, freshness, sourceConfidence, dataCompleteness, opportunityConfidence, recommendationConfidence: clamp(evidenceCompleteness * .7 + profile.profileConfidence * 100 * .3), label, explanation: eligibility.explanation, professionalExplanation: `${career.explanation} Seniority alignment: ${seniorityFit}%.${behavior && behavior.evidenceCount >= 3 ? ` Private decision calibration: ${behaviorFit}% from ${behavior.evidenceCount} actions.` : ""}`, missingInformation: eligibility.missingInformation, hardExclusions };
}

export function sortOpportunitiesForExecutive(opportunities: readonly Opportunity[], profile: ExecutiveGeographicProfile, careerContext?: ExecutiveCareerContext, behavior?: ExecutiveBehaviorProfile) {
  // Confidence assessment is the expensive part of ranking. Decorate once so
  // Array.sort does not recompute the complete Atlas model for every comparison.
  return opportunities.map((opportunity) => ({ opportunity, assessment: assessOpportunityConfidence(opportunity, profile, careerContext, behavior) })).sort((left, right) => {
    const a = left.assessment, b = right.assessment;
    return b.opportunityConfidence - a.opportunityConfidence || b.professionalFit - a.professionalFit || b.preferenceFit - a.preferenceFit || b.recommendationConfidence - a.recommendationConfidence || Date.parse(right.opportunity.publishedAt) - Date.parse(left.opportunity.publishedAt) || left.opportunity.companyName.localeCompare(right.opportunity.companyName);
  }).map(({ opportunity }) => opportunity);
}

/**
 * Prevents one freshly ingested employer cohort from occupying the entire first
 * recommendation page while preserving every opportunity for later review.
 */
export function diversifyExecutiveRecommendations(opportunities: readonly Opportunity[], perEmployer = 2) {
  const visible: Opportunity[] = [], overflow: Opportunity[] = [], counts = new Map<string, number>();
  for (const opportunity of opportunities) {
    const employer = normalize(opportunity.companyName || "unknown employer");
    const count = counts.get(employer) ?? 0;
    if (count < Math.max(1, perEmployer)) visible.push(opportunity);
    else overflow.push(opportunity);
    counts.set(employer, count + 1);
  }
  return [...visible, ...overflow];
}
