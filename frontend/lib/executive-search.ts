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

const US_STATE_CODES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
const REGION_WORDS = /^(worldwide|global|remote|eu|europe|emea|mena|apac|cis|africa|north america|south america)$/i;

/** Repairs provider location taxonomy without guessing: explicit countries and US state codes only. */
export function searchCountry(item: Pick<Opportunity, "country" | "location">) {
  const rawCountry = item.country?.trim();
  if (rawCountry && US_STATE_CODES.has(rawCountry.toUpperCase())) return "United States";
  return canonicalCountry(rawCountry) ?? countryFromExplicitLocation(item.location) ?? rawCountry;
}

export function searchCity(item: Pick<Opportunity, "country" | "location">) {
  const country = searchCountry(item);
  const segments = item.location.split(/[,;|/]|·|\s+[–—-]\s+/).map((part) => part.trim()).filter(Boolean);
  return segments.find((part) => {
    if (REGION_WORDS.test(part) || /\bremote\b/i.test(part)) return false;
    if (canonicalCountry(part) || US_STATE_CODES.has(part.toUpperCase())) return false;
    return part.toLowerCase() !== country?.toLowerCase();
  });
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
  const salaryFloor = item.salaryMin ?? item.salaryMax;
  const salaryCeiling = item.salaryMax ?? item.salaryMin;
  return (!terms.length || terms.some((term) => text.includes(term))) &&
    oneOf(filters.countries, searchCountry(item) ?? "") && oneOf(filters.cities, searchCity(item) ?? "") && oneOf(filters.regions, searchRegions(item).join(" ")) &&
    oneOf(filters.industries, item.industry) && oneOf(filters.titles, item.jobTitle) &&
    oneOf(filters.departments, `${item.jobTitle} ${item.summary}`) && oneOf(filters.seniorities, item.jobTitle) &&
    oneOf(filters.employmentTypes, item.employmentType) && oneOf(filters.remoteOptions, item.workArrangement) &&
    oneOf(filters.companySizes, item.companySize) &&
    (!filters.salaryCurrency || item.salaryCurrency === filters.salaryCurrency) &&
    (!filters.salaryMinimum || (salaryCeiling !== undefined && salaryCeiling >= Number(filters.salaryMinimum))) &&
    (!filters.salaryMaximum || (salaryFloor !== undefined && salaryFloor <= Number(filters.salaryMaximum)));
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
