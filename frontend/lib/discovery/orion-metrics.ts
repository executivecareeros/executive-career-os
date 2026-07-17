export const orionMetricsVersion = "orion-m1-metrics-v1" as const;
export const orionQualityMetricsVersion = "orion-m2-quality-v1" as const;

export const gociRegions = [
  "worldwide-remote",
  "north-america",
  "latin-america",
  "europe",
  "united-kingdom",
  "middle-east",
  "africa",
  "asia",
  "oceania",
] as const;

export type GociRegion = (typeof gociRegions)[number];

export type GociComponent = {
  opportunityDensity: number;
  employerDiversity: number;
  providerDiversity: number;
  freshness: number;
  canonicalQuality: number;
};

export type GociRegionalEvidence = {
  region: GociRegion;
  activeOpportunities: number;
  activeEmployers: number;
  activeProviders: number;
  freshOpportunities: number;
  qualityCompleteOpportunities: number;
};

export type GociRegionalResult = GociRegionalEvidence & {
  components: GociComponent;
  score: number;
};

export type GlobalOpportunityCoverageIndex = {
  version: typeof orionMetricsVersion;
  measuredAt: string;
  score: number;
  regions: readonly GociRegionalResult[];
};

const round = (value: number) => Math.round(value * 10) / 10;

export type ProviderReliabilityEvidence = {
  scheduledRuns: number; completedRuns: number; replayRuns: number; replaySafeRuns: number;
  onCadenceRuns: number; errorCount: number;
};
export function calculateProviderReliabilityIndex(e: ProviderReliabilityEvidence) {
  const schedulerHealth = percentage(e.onCadenceRuns, e.scheduledRuns);
  const ingestionSuccess = percentage(e.completedRuns, e.scheduledRuns);
  const replaySuccess = percentage(e.replaySafeRuns, e.replayRuns);
  const refreshConsistency = e.scheduledRuns > 0 ? percentage(e.onCadenceRuns, e.scheduledRuns) : 0;
  const errorControl = e.scheduledRuns > 0 ? clamp(100 - percentage(e.errorCount, e.scheduledRuns)) : 0;
  return { version: orionQualityMetricsVersion, score: round(schedulerHealth * .2 + ingestionSuccess * .3 + replaySuccess * .2 + refreshConsistency * .15 + errorControl * .15), components: { schedulerHealth: round(schedulerHealth), ingestionSuccess: round(ingestionSuccess), replaySuccess: round(replaySuccess), refreshConsistency: round(refreshConsistency), errorControl: round(errorControl) } };
}

export type EmployerResolutionEvidence = { opportunities: number; linkedOpportunities: number; duplicateEmployerKeys: number; replayChecks: number; replayConsistentChecks: number };
export function calculateEmployerResolutionAccuracy(e: EmployerResolutionEvidence) {
  const linkage = percentage(e.linkedOpportunities, e.opportunities);
  const duplicateControl = e.linkedOpportunities > 0 ? clamp(100 - percentage(e.duplicateEmployerKeys, e.linkedOpportunities)) : 0;
  const replayConsistency = percentage(e.replayConsistentChecks, e.replayChecks);
  return { version: orionQualityMetricsVersion, score: round(linkage * .7 + duplicateControl * .2 + replayConsistency * .1), components: { linkage: round(linkage), duplicateControl: round(duplicateControl), replayConsistency: round(replayConsistency) } };
}

export const opportunityCompletenessFields = ["title", "location", "applicationUrl", "compensation", "workArrangement", "employmentType", "confidence"] as const;
export type OpportunityCompletenessEvidence = Record<(typeof opportunityCompletenessFields)[number], { supported: boolean; present: boolean }>;
export function calculateOpportunityCompletenessIndex(items: readonly OpportunityCompletenessEvidence[]) {
  let supported = 0, present = 0;
  for (const item of items) for (const field of opportunityCompletenessFields) if (item[field].supported) { supported += 1; if (item[field].present) present += 1; }
  return { version: orionQualityMetricsVersion, score: round(percentage(present, supported)), supportedFields: supported, presentFields: present };
}

export const rciRegions = ["north-america", "europe", "united-kingdom", "asia", "middle-east", "latin-america", "africa", "worldwide-remote"] as const;
export type RciRegion = (typeof rciRegions)[number];
export type RegionalCoverageEvidence = { region: RciRegion; opportunities: number; remoteOpportunities: number };
export function calculateRegionalCoverageIndex(evidence: readonly RegionalCoverageEvidence[]) {
  const byRegion = new Map(evidence.map(item => [item.region, item]));
  const regions = rciRegions.map(region => byRegion.get(region) ?? { region, opportunities: 0, remoteOpportunities: 0 });
  const active = regions.filter(region => region.opportunities > 0).length;
  const counts = regions.map(region => region.opportunities);
  const maximum = Math.max(...counts, 0);
  const balance = maximum > 0 ? percentage(counts.reduce((sum, count) => sum + count / maximum, 0), regions.length) : 0;
  const breadth = percentage(active, regions.length);
  return { version: orionQualityMetricsVersion, score: round(breadth * .6 + balance * .4), breadth: round(breadth), balance: round(balance), regions };
}

const regionWeights: Readonly<Record<GociRegion, number>> = {
  "worldwide-remote": 10,
  "north-america": 20,
  "latin-america": 8,
  europe: 18,
  "united-kingdom": 10,
  "middle-east": 8,
  africa: 6,
  asia: 14,
  oceania: 6,
};

const componentWeights: Readonly<Record<keyof GociComponent, number>> = {
  opportunityDensity: 30,
  employerDiversity: 20,
  providerDiversity: 15,
  freshness: 20,
  canonicalQuality: 15,
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const percentage = (numerator: number, denominator: number) => denominator > 0 ? numerator / denominator * 100 : 0;

/**
 * M1 reference targets are deliberately fixed and profile-independent. They
 * make progress comparable over time; changing them requires an Orion decision.
 */
export function calculateGociRegionalEvidence(evidence: GociRegionalEvidence): GociRegionalResult {
  const components: GociComponent = {
    opportunityDensity: clamp(percentage(evidence.activeOpportunities, 100)),
    employerDiversity: clamp(percentage(evidence.activeEmployers, 20)),
    providerDiversity: clamp(percentage(evidence.activeProviders, 3)),
    freshness: clamp(percentage(evidence.freshOpportunities, evidence.activeOpportunities)),
    canonicalQuality: clamp(percentage(evidence.qualityCompleteOpportunities, evidence.activeOpportunities)),
  };
  const score = Math.round((Object.keys(componentWeights) as (keyof GociComponent)[]).reduce(
    (total, component) => total + components[component] * componentWeights[component],
    0,
  ) / 100);
  return { ...evidence, components, score };
}

/** GOCI is network evidence only. No executive profile is accepted by design. */
export function calculateGlobalOpportunityCoverageIndex(
  evidence: readonly GociRegionalEvidence[],
  measuredAt: string,
): GlobalOpportunityCoverageIndex {
  const byRegion = new Map(evidence.map(item => [item.region, item]));
  const regions = gociRegions.map(region => calculateGociRegionalEvidence(byRegion.get(region) ?? {
    region,
    activeOpportunities: 0,
    activeEmployers: 0,
    activeProviders: 0,
    freshOpportunities: 0,
    qualityCompleteOpportunities: 0,
  }));
  return {
    version: orionMetricsVersion,
    measuredAt,
    score: Math.round(regions.reduce((total, region) => total + region.score * regionWeights[region.region], 0) / 100),
    regions,
  };
}
