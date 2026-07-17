export const geographicCoverageStrategyVersion = "tmci-geography-v1" as const;

export const targetMarketRegions = [
  "g20",
  "worldwide-remote",
  "eu",
  "emea",
  "uk",
  "north-america",
  "mena",
  "apac",
  "latam",
  "africa",
] as const;

export type TargetMarketRegion = (typeof targetMarketRegions)[number];

export const remoteScopes = [
  "worldwide",
  "emea",
  "eu",
  "north-america",
  "apac",
  "latam",
  "mena",
  "country-restricted",
  "timezone-restricted",
  "unknown",
] as const;

export type RemoteScope = (typeof remoteScopes)[number];

export type CoverageMetric =
  | "employerCoverage"
  | "atsCoverage"
  | "executiveTitleCoverage"
  | "industryCoverage"
  | "freshness"
  | "canonicalQuality"
  | "executiveOpportunityDensity"
  | "remoteCoverage"
  | "workAuthorizationClarity"
  | "compensationCompleteness";

export type RegionalCoverageMetrics = Readonly<Record<CoverageMetric, number>>;

export type RegionalCoverageMeasurement = {
  region: TargetMarketRegion;
  metrics: RegionalCoverageMetrics;
  measuredAt: string;
  opportunityCount: number;
};

export type RegionalCoverageResult = RegionalCoverageMeasurement & {
  score: number;
};

export type TargetMarketCoverageIndex = {
  version: typeof geographicCoverageStrategyVersion;
  score: number;
  measuredAt: string;
  regions: readonly RegionalCoverageResult[];
  missingRegions: readonly TargetMarketRegion[];
};

const regionWeights: Readonly<Record<TargetMarketRegion, number>> = {
  g20: 18,
  "worldwide-remote": 14,
  eu: 12,
  emea: 10,
  uk: 9,
  "north-america": 12,
  mena: 7,
  apac: 8,
  latam: 5,
  africa: 5,
};

const metricWeights: Readonly<Record<CoverageMetric, number>> = {
  employerCoverage: 15,
  atsCoverage: 10,
  executiveTitleCoverage: 15,
  industryCoverage: 10,
  freshness: 12,
  canonicalQuality: 15,
  executiveOpportunityDensity: 10,
  remoteCoverage: 5,
  workAuthorizationClarity: 5,
  compensationCompleteness: 3,
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function calculateRegionalCoverage(metrics: RegionalCoverageMetrics): number {
  const weighted = (Object.keys(metricWeights) as CoverageMetric[]).reduce(
    (total, metric) => total + clamp(metrics[metric]) * metricWeights[metric],
    0,
  );
  return Math.round(weighted / 100);
}

/**
 * Calculates network coverage from market evidence only. Executive profiles and
 * recommendation preferences are intentionally absent from this contract.
 */
export function calculateTargetMarketCoverageIndex(
  measurements: readonly RegionalCoverageMeasurement[],
): TargetMarketCoverageIndex {
  const byRegion = new Map(measurements.map(measurement => [measurement.region, measurement]));
  const regions = targetMarketRegions.flatMap(region => {
    const measurement = byRegion.get(region);
    return measurement ? [{ ...measurement, score: calculateRegionalCoverage(measurement.metrics) }] : [];
  });
  const score = Math.round(regions.reduce(
    (total, result) => total + result.score * regionWeights[result.region],
    0,
  ) / 100);

  return {
    version: geographicCoverageStrategyVersion,
    score,
    measuredAt: regions.length === 0
      ? new Date(0).toISOString()
      : regions.map(region => region.measuredAt).sort().at(-1)!,
    regions,
    missingRegions: targetMarketRegions.filter(region => !byRegion.has(region)),
  };
}

export function classifyRemoteScope(input: {
  remote: boolean;
  explicitScope?: Exclude<RemoteScope, "unknown">;
}): RemoteScope | null {
  if (!input.remote) return null;
  return input.explicitScope ?? "unknown";
}
