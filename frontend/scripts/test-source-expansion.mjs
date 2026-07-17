import assert from "node:assert/strict";
import { rankProviderExpansion, sourceExpansionRoadmap } from "../lib/discovery/source-expansion.ts";

assert.equal(sourceExpansionRoadmap.length, 10);
assert.equal(sourceExpansionRoadmap[0].id, "smartrecruiters", "An accessible high-yield source should outrank famous but gated sources");
assert.equal(sourceExpansionRoadmap.every((item, index, all) => index === 0 || all[index - 1].priorityScore >= item.priorityScore), true);
const demandLed = rankProviderExpansion([
  { id: "a", name: "Famous", accessMethod: "Unknown", expectedUniqueInventory: 50, demandCoverage: 20, geographyCoverage: 50, sourceReliability: 50, accessConfidence: 10, duplicateRisk: 90, effort: 90, founderGate: true, nextAction: "Review" },
  { id: "b", name: "Useful", accessMethod: "Official feed", expectedUniqueInventory: 80, demandCoverage: 90, geographyCoverage: 80, sourceReliability: 90, accessConfidence: 95, duplicateRisk: 10, effort: 20, founderGate: false, nextAction: "Build" },
]);
assert.equal(demandLed[0].id, "b");
console.log("Source expansion prioritization checks passed.");
