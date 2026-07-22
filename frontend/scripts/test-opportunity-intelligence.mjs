import assert from "node:assert/strict";
import { buildExecutiveOpportunityIntelligence, opportunityIntelligenceBlueprint } from "../lib/opportunity-intelligence.ts";
import { founderGeographicProfileFixture } from "../lib/opportunity-geography.ts";

const base = {
  id: "discovered-greenhouse-one", companyName: "North Star", companyInitials: "NS", jobTitle: "Chief Revenue Officer", location: "London", country: "United Kingdom",
  workArrangement: "Hybrid", employmentType: "Full-time", industry: "Technology", companySize: "Enterprise", source: "Greenhouse", sourceUrl: "https://example.com/jobs/one",
  sources: [{ id: "greenhouse", name: "Greenhouse", kind: "Employer", originalId: "one", originalUrl: "https://example.com/jobs/one", collectedAt: "2026-07-14T08:00:00Z", confidence: "High" }],
  lastObservedAt: "2026-07-14T08:00:00Z", publishedAt: "2026-07-13T08:00:00Z", discoveredAt: "2026-07-14T08:00:00Z", salaryMin: 240000, salaryMax: 280000, salaryCurrency: "GBP",
  executiveFitScore: 90, strategicOpportunityScore: 90, overallScore: 90, confidenceScore: 90, status: "Discovered", priority: "Low", travelRequirement: "Not assessed", summary: "Lead global revenue growth.",
  keyResponsibilities: [], requiredSkills: ["Revenue leadership"], preferredSkills: [], matchingStrengths: ["Revenue leadership"], missingRequirements: [], riskFlags: [], exclusions: [], decisionRationale: "Awaiting Atlas assessment.", recommendedCVProfile: "Not assessed", coverLetterRecommended: false, notes: "",
};
const related = { ...base, id: "discovered-lever-two", companyName: "Blue Star", companyInitials: "BS", jobTitle: "VP Revenue", source: "Lever", sources: [{ ...base.sources[0], id: "lever", name: "Lever", originalId: "two" }] };
const blueprint = opportunityIntelligenceBlueprint({ preferredIndustries: ["Technology"], preferredCountries: ["United Kingdom"], minimumCompensation: 220000, currency: "GBP", leadershipLevel: "Chief", constraints: [] }, "blueprint-r1");
const geographicProfile = founderGeographicProfileFixture();
geographicProfile.homeCountry.value = "United Kingdom";
geographicProfile.currentCountry.value = "United Kingdom";
const intelligence = buildExecutiveOpportunityIntelligence(base, blueprint, [base, related], "2026-07-14T10:00:00Z", geographicProfile);

assert.equal(intelligence.blueprintCompatibilityScore, 100);
assert.equal(intelligence.recommendation, "Prioritize");
assert.equal(intelligence.atlasConfidence.level, "Very High");
assert.equal(intelligence.strengths.length, 4);
assert.equal(intelligence.missingInformation.includes("Travel requirement"), true);
assert.equal(intelligence.evidence.some((item) => item.certainty === "Confirmed"), true);
assert.equal(intelligence.evidence.some((item) => item.certainty === "Estimated"), true);
assert.equal(intelligence.evidence.some((item) => item.certainty === "Unknown"), true);
assert.equal(intelligence.provenance[0].originalId, "one");
assert.equal(intelligence.freshness.status, "Fresh");
assert.equal(intelligence.history.length, 1);
assert.equal(intelligence.relatedOpportunities[0].opportunityId, related.id);
assert.deepEqual(intelligence.similarCompanies, ["Blue Star"]);
assert.deepEqual(intelligence.similarRoles, ["VP Revenue"]);

const careerContext = { roleTitles: ["Sales Director", "Managing Director", "Business Development Director"], industries: ["Technology"], capabilities: ["Revenue leadership"], languages: [] };
const personalized = buildExecutiveOpportunityIntelligence(base, blueprint, [base], "2026-07-14T10:00:00Z", geographicProfile, careerContext);
assert.ok(personalized.strengths.some((item) => item.includes("role function") && item.includes("leadership level")), "Confirmed professional fit must appear in Atlas strengths, not only in raw evidence");
const mismatched = buildExecutiveOpportunityIntelligence({ ...base, jobTitle: "Technical Support Engineer", executiveFitScore: 96 }, blueprint, [base], "2026-07-14T10:00:00Z", geographicProfile, careerContext);
assert.ok(mismatched.concerns.some((item) => item.includes("individual-contributor")), "A confirmed leadership-level mismatch must appear in Atlas concerns");

const conflict = buildExecutiveOpportunityIntelligence({ ...base, country: "Germany", industry: "Media", salaryMin: 150000 }, blueprint, [base], "2026-07-14T10:00:00Z");
assert.equal(conflict.recommendation, "Deprioritize");
assert.equal(conflict.concerns.length, 3);

const unknown = buildExecutiveOpportunityIntelligence({ ...base, location: "Not specified", country: "Not specified", industry: "Not specified", companySize: "Not specified", workArrangement: "Unknown", salaryMin: undefined, salaryMax: undefined, salaryCurrency: undefined, summary: "Awaiting assessment." }, opportunityIntelligenceBlueprint(), [], "2026-07-14T10:00:00Z");
assert.equal(unknown.blueprintCompatibilityScore, undefined);
assert.equal(unknown.recommendation, "Research");
assert.equal(unknown.missingInformation.includes("Active Executive Blueprint for a personal fit comparison"), true);

console.log("Executive Opportunity Intelligence checks passed.");
