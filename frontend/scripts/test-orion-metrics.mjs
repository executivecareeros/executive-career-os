import assert from "node:assert/strict";
import {
  calculateEmployerResolutionAccuracy,
  calculateGlobalOpportunityCoverageIndex,
  calculateGociRegionalEvidence,
  calculateOpportunityCompletenessIndex,
  calculateProviderReliabilityIndex,
  calculateRegionalCoverageIndex,
  gociRegions,
  orionMetricsVersion,
} from "../lib/discovery/orion-metrics.ts";

const full = calculateGociRegionalEvidence({
  region: "europe",
  activeOpportunities: 100,
  activeEmployers: 20,
  activeProviders: 3,
  freshOpportunities: 100,
  qualityCompleteOpportunities: 100,
});
assert.equal(full.score, 100);

const partial = calculateGociRegionalEvidence({
  region: "europe",
  activeOpportunities: 50,
  activeEmployers: 10,
  activeProviders: 1,
  freshOpportunities: 40,
  qualityCompleteOpportunities: 25,
});
assert.equal(partial.score, 54);

const index = calculateGlobalOpportunityCoverageIndex([full], "2026-07-17T00:00:00.000Z");
assert.equal(index.version, orionMetricsVersion);
assert.equal(index.score, 18, "Unmeasured regions must contribute zero");
assert.equal(index.regions.length, gociRegions.length);
assert.equal(index.regions.find(region => region.region === "north-america")?.score, 0);
assert.equal("profile" in index, false, "Executive profiles must not influence GOCI");

assert.equal(calculateProviderReliabilityIndex({ scheduledRuns: 2, completedRuns: 2, replayRuns: 1, replaySafeRuns: 1, onCadenceRuns: 2, errorCount: 0 }).score, 100);
assert.equal(calculateEmployerResolutionAccuracy({ opportunities: 100, linkedOpportunities: 100, duplicateEmployerKeys: 0, replayChecks: 1, replayConsistentChecks: 1 }).score, 100);
assert.equal(calculateOpportunityCompletenessIndex([{ title: { supported: true, present: true }, location: { supported: true, present: true }, applicationUrl: { supported: true, present: true }, compensation: { supported: false, present: false }, workArrangement: { supported: true, present: true }, employmentType: { supported: true, present: false }, confidence: { supported: true, present: true } }]).score, 83.3, "Unknown unsupported fields must not lower OCI");
const rci = calculateRegionalCoverageIndex([{ region: "europe", opportunities: 10, remoteOpportunities: 3 }, { region: "north-america", opportunities: 10, remoteOpportunities: 2 }]);
assert.equal(rci.breadth, 25);
assert.equal(rci.regions.length, 8);

console.log("Orion metrics checks passed.");
