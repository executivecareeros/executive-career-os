export const orionMetricsVersion = "orion-m1-metrics-v1" as const;

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
