import assert from "node:assert/strict";
import {
  calculateRegionalCoverage,
  calculateTargetMarketCoverageIndex,
  classifyRemoteScope,
  geographicCoverageStrategyVersion,
  targetMarketRegions,
} from "../lib/discovery/geographic-coverage.ts";

const completeMetrics = Object.freeze({
  employerCoverage: 80,
  atsCoverage: 70,
  executiveTitleCoverage: 90,
  industryCoverage: 75,
  freshness: 85,
  canonicalQuality: 95,
  executiveOpportunityDensity: 65,
  remoteCoverage: 60,
  workAuthorizationClarity: 55,
  compensationCompleteness: 40,
});

assert.equal(calculateRegionalCoverage(completeMetrics), 78);
assert.equal(classifyRemoteScope({ remote: true }), "unknown", "Remote without evidence must never become worldwide");
assert.equal(classifyRemoteScope({ remote: true, explicitScope: "worldwide" }), "worldwide");
assert.equal(classifyRemoteScope({ remote: false }), null);

const measurements = targetMarketRegions.map(region => ({
  region,
  metrics: completeMetrics,
  measuredAt: "2026-07-17T00:00:00.000Z",
  opportunityCount: 100,
}));
const tmci = calculateTargetMarketCoverageIndex(measurements);
assert.equal(tmci.version, geographicCoverageStrategyVersion);
assert.equal(tmci.score, 78);
assert.deepEqual(tmci.missingRegions, []);
assert.equal("profile" in tmci, false, "Founder or executive profile data must not enter TMCI output");

const partial = calculateTargetMarketCoverageIndex(measurements.slice(0, 1));
assert.equal(partial.score, 14, "Missing regions must contribute zero rather than inflate coverage");
assert.equal(partial.missingRegions.length, 9);

console.log("Geographic coverage strategy checks passed.");
