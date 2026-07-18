export const GLOBAL_EMPLOYER_TARGET_PER_COUNTRY = 1_000;
export const GLOBAL_EMPLOYER_TARGET_CEILING = 250_000;
export const GLOBAL_ACTIVE_OPPORTUNITY_TARGET = 3_000_000;

export type EmployerTargetCandidate = {
  sourceId: string;
  legalName: string;
  countryCode: string;
  officialDomain?: string;
  careersUrl?: string;
  employeeCount?: number;
  annualRevenueUsd?: number;
  marketCapitalizationUsd?: number;
  internationalOperations?: boolean;
  structuredCareerSource?: boolean;
  executiveHiringEvidence?: boolean;
  evidenceUrl: string;
};

export type RankedEmployerTarget = EmployerTargetCandidate & {
  priorityScore: number;
  rankInCountry: number;
};

const magnitude = (value?: number) => value && value > 0 ? Math.min(1, Math.log10(value + 1) / 12) : 0;

export function employerTargetPriority(candidate: EmployerTargetCandidate) {
  const score =
    magnitude(candidate.employeeCount) * 24 +
    magnitude(candidate.annualRevenueUsd) * 18 +
    magnitude(candidate.marketCapitalizationUsd) * 12 +
    (candidate.officialDomain ? 12 : 0) +
    (candidate.careersUrl ? 12 : 0) +
    (candidate.structuredCareerSource ? 10 : 0) +
    (candidate.executiveHiringEvidence ? 7 : 0) +
    (candidate.internationalOperations ? 5 : 0);
  return Math.round(Math.min(100, score) * 100) / 100;
}

export function selectGlobalEmployerTargets(candidates: readonly EmployerTargetCandidate[], perCountry = GLOBAL_EMPLOYER_TARGET_PER_COUNTRY) {
  const limit = Math.max(1, Math.min(GLOBAL_EMPLOYER_TARGET_PER_COUNTRY, Math.trunc(perCountry)));
  const unique = new Map<string, EmployerTargetCandidate>();
  for (const candidate of candidates) {
    const country = candidate.countryCode.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(country) || !candidate.legalName.trim() || !candidate.evidenceUrl.trim()) continue;
    const identity = candidate.officialDomain?.trim().toLowerCase().replace(/^www\./, "") || candidate.sourceId.trim().toLowerCase();
    if (!identity) continue;
    const key = `${country}:${identity}`;
    const normalized = { ...candidate, countryCode: country, legalName: candidate.legalName.trim(), officialDomain: candidate.officialDomain?.trim().toLowerCase().replace(/^www\./, "") };
    const current = unique.get(key);
    if (!current || employerTargetPriority(normalized) > employerTargetPriority(current)) unique.set(key, normalized);
  }
  const countries = new Map<string, EmployerTargetCandidate[]>();
  for (const candidate of unique.values()) countries.set(candidate.countryCode, [...(countries.get(candidate.countryCode) ?? []), candidate]);
  return [...countries.entries()].sort(([a], [b]) => a.localeCompare(b)).flatMap(([, countryCandidates]) =>
    countryCandidates
      .sort((a, b) => employerTargetPriority(b) - employerTargetPriority(a) || a.legalName.localeCompare(b.legalName))
      .slice(0, limit)
      .map((candidate, index): RankedEmployerTarget => ({ ...candidate, priorityScore: employerTargetPriority(candidate), rankInCountry: index + 1 })),
  ).slice(0, GLOBAL_EMPLOYER_TARGET_CEILING);
}

