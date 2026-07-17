import assert from "node:assert/strict";
import {
  calculateGlobalOpportunityCoverageIndex,
  calculateGociRegionalEvidence,
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

console.log("Orion metrics checks passed.");
