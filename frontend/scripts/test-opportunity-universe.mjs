import assert from "node:assert/strict";
import { canTransitionOpportunity, clusterDuplicateOpportunities, isInUniverseStage, opportunityDuplicateKey, resolveUniverseStage, summarizeOpportunityUniverse } from "../lib/opportunity-universe.ts";

const base = {
  id: "one", companyName: "North Star, Inc.", companyInitials: "NS", jobTitle: "Chief Revenue Officer", location: "London", country: "United Kingdom",
  workArrangement: "Hybrid", employmentType: "Full-time", industry: "Technology", companySize: "Enterprise", source: "Employer", publishedAt: "2026-07-01", discoveredAt: "2026-07-02",
  executiveFitScore: 86, strategicOpportunityScore: 84, overallScore: 85, confidenceScore: 80, status: "Qualified", priority: "High", travelRequirement: "Unknown", summary: "",
  keyResponsibilities: [], requiredSkills: [], preferredSkills: [], matchingStrengths: [], missingRequirements: [], riskFlags: [], exclusions: [], decisionRationale: "", recommendedCVProfile: "", coverLetterRecommended: false, notes: "",
};

assert.equal(resolveUniverseStage(base), "Recommended");
assert.equal(resolveUniverseStage({ ...base, overallScore: 72, confidenceScore: 60, status: "Evaluating" }), "Qualified");
assert.equal(resolveUniverseStage({ ...base, overallScore: 50, confidenceScore: 40, status: "Discovered" }), "Universe");
assert.equal(canTransitionOpportunity("Discovered", "Evaluating"), true);
assert.equal(canTransitionOpportunity("Discovered", "Interview"), false);
assert.equal(isInUniverseStage(base, "Universe"), true);
assert.equal(isInUniverseStage(base, "Qualified"), true);

const duplicate = { ...base, id: "two", companyName: "North Star Inc", source: "Job board", confidenceScore: 70 };
assert.equal(opportunityDuplicateKey(base), opportunityDuplicateKey(duplicate));
const clusters = clusterDuplicateOpportunities([base, duplicate]);
assert.equal(clusters.length, 1);
assert.equal(clusters[0].canonical.id, "one");
assert.equal(clusters[0].sourceCount, 2);
assert.equal(clusters[0].requiresReview, true);

const summary = summarizeOpportunityUniverse([base, { ...base, id: "three", universeStage: "Universe", source: "Recruiter" }]);
assert.equal(summary.total, 2);
assert.equal(summary.stages.Recommended, 1);
assert.equal(summary.stages.Universe, 2);
assert.equal(summary.stages.Qualified, 1);
assert.equal(summary.sourceCount, 2);

console.log("Opportunity Universe domain checks passed.");
