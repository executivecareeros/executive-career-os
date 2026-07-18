import type { Opportunity } from "@/types/opportunity";

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
    oneOf(filters.countries, item.country) && oneOf(filters.cities, item.location) && oneOf(filters.regions, item.location) &&
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
