import assert from "node:assert/strict";
import { GLOBAL_ACTIVE_OPPORTUNITY_TARGET, GLOBAL_EMPLOYER_TARGET_CEILING, employerTargetPriority, selectGlobalEmployerTargets } from "../lib/discovery/global-employer-targets.ts";

const candidates = [
  { sourceId: "one", legalName: "Global One", countryCode: "us", officialDomain: "www.global-one.example", careersUrl: "https://global-one.example/careers", employeeCount: 100_000, annualRevenueUsd: 50_000_000_000, internationalOperations: true, structuredCareerSource: true, executiveHiringEvidence: true, evidenceUrl: "https://registry.example/one" },
  { sourceId: "duplicate", legalName: "Global One duplicate", countryCode: "US", officialDomain: "global-one.example", employeeCount: 10, evidenceUrl: "https://registry.example/duplicate" },
  { sourceId: "two", legalName: "Regional Two", countryCode: "US", officialDomain: "regional-two.example", employeeCount: 5_000, evidenceUrl: "https://registry.example/two" },
  { sourceId: "three", legalName: "Türkiye Three", countryCode: "TR", careersUrl: "https://three.example/jobs", structuredCareerSource: true, evidenceUrl: "https://registry.example/three" },
  { sourceId: "invalid", legalName: "Invalid", countryCode: "USA", evidenceUrl: "https://registry.example/invalid" },
];
const selected = selectGlobalEmployerTargets(candidates, 1);
assert.equal(selected.length, 2, "Country quotas must be independent");
assert.equal(selected.find(target => target.countryCode === "US")?.legalName, "Global One", "Highest-value verified employer must win its country cohort");
assert.equal(selected.find(target => target.countryCode === "US")?.rankInCountry, 1);
assert.ok(employerTargetPriority(candidates[0]) > employerTargetPriority(candidates[1]));
assert.equal(GLOBAL_EMPLOYER_TARGET_CEILING, 250_000);
assert.equal(GLOBAL_ACTIVE_OPPORTUNITY_TARGET, 3_000_000);
console.log("Global employer target selection checks passed.");

