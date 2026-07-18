import type { Opportunity } from "@/types/opportunity";
import { canonicalCountry, countryFromExplicitLocation } from "./discovery/country-normalization.ts";

export type ExecutiveSearchFilters = {
  query: string; countries: string[]; cities: string[]; regions: string[]; industries: string[];
  titles: string[]; departments: string[]; seniorities: string[]; employmentTypes: string[];
  remoteOptions: string[]; companySizes: string[]; salaryMinimum: string; salaryMaximum: string; salaryCurrency: string;
};

const ALIASES: Record<string, readonly string[]> = {
  cro: ["chief revenue officer", "revenue leader"], cco: ["chief commercial officer", "commercial leader"],
  "business development": ["biz dev", "partnerships", "growth"], ai: ["artificial intelligence", "machine learning", "generative ai"],
  saas: ["software as a service", "enterprise software", "cloud software"], vp: ["vice president"],
};

export const EXECUTIVE_SEARCH_REGIONS = ["Worldwide", "EU", "Europe", "EMEA", "MENA", "APAC", "CIS", "Africa", "North America", "South America"] as const;
export const EXECUTIVE_SEARCH_INDUSTRIES = [
  "Aerospace & Defence", "Artificial Intelligence", "Automotive", "Banking", "Broadcast & Media Technology",
  "Business Services", "Consumer Goods", "Cybersecurity", "Education", "Energy & Utilities", "Enterprise Software",
  "Financial Services", "Government & Public Sector", "Healthcare", "Hospitality & Travel", "Industrial Technology",
  "Insurance", "Logistics & Supply Chain", "Manufacturing", "Media & Entertainment", "Pharmaceuticals & Biotechnology",
  "Professional Services", "Real Estate", "Retail & E-commerce", "Software & SaaS", "Telecommunications",
  "Transportation", "Venture Capital & Private Equity",
] as const;

const US_STATE_CODES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
const REGION_WORDS = /^(worldwide|global|remote|eu|europe|emea|mena|apac|cis|africa|north america|south america)$/i;

/** Repairs provider location taxonomy without guessing: explicit countries and US state codes only. */
export function searchCountry(item: Pick<Opportunity, "country" | "location">) {
  const rawCountry = item.country?.trim();
  if (rawCountry && US_STATE_CODES.has(rawCountry.toUpperCase())) return "United States";
  return canonicalCountry(rawCountry) ?? countryFromExplicitLocation(item.location);
}

export function searchCity(item: Pick<Opportunity, "country" | "location">) {
  const country = searchCountry(item);
  const segments = item.location.split(/[,;|/]|·|\s+[–—-]\s+/).map((part) => part.replace(/\b(remote|hybrid|on.?site)\b/ig, "").replace(/[()]/g, "").trim()).filter(Boolean);
  return segments.find((part) => {
    if (REGION_WORDS.test(part) || /\bremote\b/i.test(part)) return false;
    if (canonicalCountry(part) || US_STATE_CODES.has(part.toUpperCase())) return false;
    return part.toLowerCase() !== country?.toLowerCase();
  });
}

/** Search categories are deterministic navigation aids, not persisted employer facts. */
export function searchIndustries(item: Pick<Opportunity, "industry" | "companyName" | "jobTitle" | "summary" | "requiredSkills">) {
  const explicit = item.industry && !/^(unknown|not specified)$/i.test(item.industry) ? [item.industry] : [];
  const text = `${item.industry} ${item.companyName} ${item.jobTitle} ${item.summary} ${item.requiredSkills.join(" ")}`.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/\bartificial intelligence\b|\bgenerative ai\b|\bmachine learning\b/, "Artificial Intelligence"],
    [/cyber.?security|information security|identity security/, "Cybersecurity"],
    [/saas|cloud software|enterprise software|software platform/, "Software & SaaS"],
    [/broadcast|streaming|media technology|virtual production/, "Broadcast & Media Technology"],
    [/telecom|telecommunications|carrier services/, "Telecommunications"],
    [/banking|fintech|payments|capital markets/, "Financial Services"],
    [/healthcare|health tech|hospital|medical/, "Healthcare"],
    [/pharma|biotech|life sciences/, "Pharmaceuticals & Biotechnology"],
    [/retail|e.?commerce|marketplace/, "Retail & E-commerce"],
    [/manufacturing|industrial|automation/, "Industrial Technology"],
    [/logistics|supply chain|freight/, "Logistics & Supply Chain"],
    [/energy|utilities|renewable|oil and gas/, "Energy & Utilities"],
    [/consulting|professional services|advisory/, "Professional Services"],
    [/media|entertainment|publishing|gaming/, "Media & Entertainment"],
    [/education|learning|university|edtech/, "Education"],
    [/automotive|mobility|vehicle/, "Automotive"],
    [/aerospace|defen[cs]e|aviation/, "Aerospace & Defence"],
    [/real estate|property|proptech/, "Real Estate"],
    [/travel|hospitality|hotel/, "Hospitality & Travel"],
    [/venture capital|private equity|investment fund/, "Venture Capital & Private Equity"],
  ];
  return [...new Set([...explicit, ...rules.filter(([pattern]) => pattern.test(text)).map(([, industry]) => industry)])];
}

export function searchRegions(item: Pick<Opportunity, "country" | "location" | "workArrangement">) {
  const country = (searchCountry(item) ?? "").toLowerCase();
  const text = `${item.location} ${item.workArrangement}`.toLowerCase();
  const regions: string[] = [];
  const add = (...values: string[]) => regions.push(...values);
  if (/worldwide|global/.test(text) && /remote/.test(text)) add("Worldwide");
  if (/\bemea\b/.test(text)) add("EMEA");
  if (/\bmena\b|middle east/.test(text) || /united arab emirates|saudi arabia|qatar|kuwait|bahrain|oman|jordan|lebanon/.test(country)) add("MENA", "EMEA");
  if (/\bapac\b|asia pacific/.test(text) || /australia|new zealand|singapore|india|japan|china|south korea|indonesia|malaysia|philippines|thailand|vietnam/.test(country)) add("APAC");
  if (/\bcis\b/.test(text) || /armenia|azerbaijan|belarus|kazakhstan|kyrgyzstan|moldova|russia|tajikistan|turkmenistan|uzbekistan/.test(country)) add("CIS");
  if (/africa/.test(text) || /south africa|nigeria|kenya|egypt|morocco|ghana|ethiopia|tanzania/.test(country)) add("Africa", "EMEA");
  if (/united states|canada|mexico/.test(country) || /north america/.test(text)) add("North America");
  if (/brazil|argentina|chile|colombia|peru|uruguay|paraguay|ecuador|bolivia|venezuela/.test(country) || /south america|latam/.test(text)) add("South America");
  if (/united kingdom|germany|france|netherlands|spain|italy|belgium|sweden|denmark|finland|poland|ireland|austria|portugal|czechia|romania|greece|hungary|croatia|bulgaria|slovakia|slovenia|estonia|latvia|lithuania|luxembourg|malta|cyprus/.test(country)) add("EU", "Europe", "EMEA");
  else if (/türkiye|turkey|switzerland|norway|iceland|serbia|albania|bosnia|montenegro|north macedonia|ukraine/.test(country) || /\beurope\b/.test(text)) add("Europe", "EMEA");
  return [...new Set(regions)];
}

export function expandedSearchTerms(query: string) {
  const normalized = query.trim().toLowerCase();
  return [...new Set([normalized, ...(ALIASES[normalized] ?? [])])].filter(Boolean);
}

export function matchesExecutiveSearch(item: Opportunity, filters: ExecutiveSearchFilters) {
  const text = `${item.companyName} ${item.jobTitle} ${item.location} ${item.country} ${item.industry} ${item.summary} ${item.requiredSkills.join(" ")}`.toLowerCase();
  const terms = expandedSearchTerms(filters.query);
  const oneOf = (selected: string[], value: string) => !selected.length || selected.some((entry) => value.toLowerCase().includes(entry.toLowerCase()));
  const country = searchCountry(item);
  const countryMatch = !filters.countries.length || filters.countries.some(entry => country?.toLowerCase() === entry.toLowerCase());
  const regions = searchRegions(item);
  const regionMatch = !filters.regions.length || filters.regions.some(entry => regions.includes(entry));
  const cityMatch = !filters.cities.length || filters.cities.some((entry) => {
    const wantsRemote = /\bremote\b/i.test(entry);
    const city = entry.replace(/\bremote\b/ig, "").trim().toLowerCase();
    const location = `${searchCity(item) ?? ""} ${item.location}`.toLowerCase();
    const remote = `${item.workArrangement} ${item.location}`.toLowerCase();
    return (!city || location.includes(city)) && (!wantsRemote || remote.includes("remote"));
  });
  const salaryFloor = item.salaryMin ?? item.salaryMax;
  const salaryCeiling = item.salaryMax ?? item.salaryMin;
  return (!terms.length || terms.some((term) => text.includes(term))) &&
    countryMatch && cityMatch && regionMatch &&
    oneOf(filters.industries, searchIndustries(item).join(" ")) && oneOf(filters.titles, item.jobTitle) &&
    oneOf(filters.departments, `${item.jobTitle} ${item.summary}`) && oneOf(filters.seniorities, item.jobTitle) &&
    oneOf(filters.employmentTypes, item.employmentType) && oneOf(filters.remoteOptions, item.workArrangement) &&
    oneOf(filters.companySizes, item.companySize) &&
    (!filters.salaryCurrency || item.salaryCurrency === filters.salaryCurrency) &&
    (!filters.salaryMinimum || (salaryCeiling !== undefined && salaryCeiling >= Number(filters.salaryMinimum))) &&
    (!filters.salaryMaximum || (salaryFloor !== undefined && salaryFloor <= Number(filters.salaryMaximum)));
}

export function executiveSearchRelevance(item: Opportunity, filters: ExecutiveSearchFilters) {
  const text = `${item.companyName} ${item.jobTitle} ${item.summary} ${item.requiredSkills.join(" ")}`.toLowerCase();
  const terms = expandedSearchTerms(filters.query);
  let score = terms.reduce((total, term) => total + (item.jobTitle.toLowerCase().includes(term) ? 30 : text.includes(term) ? 12 : 0), 0);
  if (filters.countries.some(country => searchCountry(item)?.toLowerCase() === country.toLowerCase())) score += 25;
  if (filters.cities.some(city => `${searchCity(item) ?? ""} ${item.location}`.toLowerCase().includes(city.replace(/\bremote\b/ig, "").trim().toLowerCase()))) score += 25;
  if (filters.remoteOptions.some(option => item.workArrangement.toLowerCase().includes(option.toLowerCase())) || filters.cities.some(city => /\bremote\b/i.test(city) && `${item.workArrangement} ${item.location}`.toLowerCase().includes("remote"))) score += 15;
  if (filters.regions.some(region => searchRegions(item).includes(region))) score += 15;
  if (filters.industries.some(industry => searchIndustries(item).some(value => value.toLowerCase().includes(industry.toLowerCase())))) score += 15;
  return score;
}

export function searchSuggestions(query: string, opportunities: readonly Opportunity[], recent: readonly string[] = []) {
  const needle = query.trim().toLowerCase();
  const popular = opportunities.flatMap((item) => [item.jobTitle, item.companyName, item.industry]).filter((value) => value && value !== "Not specified");
  const candidates = [...recent, ...popular, ...Object.keys(ALIASES)];
  return [...new Set(candidates)].filter((value) => !needle || value.toLowerCase().includes(needle) || expandedSearchTerms(needle).some((term) => value.toLowerCase().includes(term)) || value.toLowerCase().split(/\s+/).some((word) => editDistance(word, needle) <= Math.max(1, Math.ceil(needle.length / 4)))).slice(0, 8);
}

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) { let previous = row[0]; row[0] = i; for (let j = 1; j <= right.length; j += 1) { const current = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1)); previous = current; } }
  return row[right.length];
}
