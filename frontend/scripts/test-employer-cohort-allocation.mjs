import assert from "node:assert/strict";
import { allocateProviderCohortTargets } from "../lib/discovery/employer-cohort-allocation.ts";

assert.deepEqual(allocateProviderCohortTargets(1_000, ["greenhouse", "ashby", "smartrecruiters"]), [
  { provider: "greenhouse", target: 334 },
  { provider: "ashby", target: 333 },
  { provider: "smartrecruiters", target: 333 },
]);
assert.deepEqual(allocateProviderCohortTargets(2, ["greenhouse", "ashby", "smartrecruiters"]), [
  { provider: "greenhouse", target: 1 },
  { provider: "ashby", target: 1 },
  { provider: "smartrecruiters", target: 0 },
]);
assert.deepEqual(allocateProviderCohortTargets(3, ["greenhouse", "greenhouse", "smartrecruiters"]), [
  { provider: "greenhouse", target: 2 },
  { provider: "smartrecruiters", target: 1 },
]);
assert.deepEqual(allocateProviderCohortTargets(0, ["greenhouse"]), []);

console.log("Balanced employer cohort allocation checks passed.");
