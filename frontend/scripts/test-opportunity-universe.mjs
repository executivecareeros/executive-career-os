import assert from "node:assert/strict";
import { canTransitionOpportunity, clusterDuplicateOpportunities, isCanonicalOpportunityMatch, isInUniverseStage, mergeOpportunityObservations, opportunityDuplicateKey, resolveUniverseStage, summarizeOpportunityUniverse } from "../lib/opportunity-universe.ts";
import { toLiveOpportunity } from "../lib/live-opportunity.ts";

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
assert.equal(isCanonicalOpportunityMatch({ ...base, companyName: "Provider A label", companyProfile: { canonicalKey: "company:global-123", name: "Provider A label", evidenceStatus: "Partial" } }, { ...duplicate, companyName: "Provider B label", companyProfile: { canonicalKey: "company:global-123", name: "Provider B label", evidenceStatus: "Partial" } }), true, "Resolved company identity must reconcile cross-provider labels");

const repairedEmployerIdentity = mergeOpportunityObservations(
  { ...base, employerDomain: "job-boards.greenhouse.io", companyProfile: { canonicalKey: "job-boards.greenhouse.io", name: "Datadog", website: "https://job-boards.greenhouse.io/datadog", evidenceStatus: "Partial" }, sources: [{ id: "greenhouse", name: "Greenhouse", kind: "Employer", originalId: "datadog-1", collectedAt: base.discoveredAt, confidence: "High" }] },
  { ...base, employerDomain: undefined, companyProfile: { canonicalKey: "greenhouse:datadog", name: "Datadog", evidenceStatus: "Unknown" }, sources: [{ id: "greenhouse", name: "Greenhouse", kind: "Employer", originalId: "datadog-1", collectedAt: duplicate.discoveredAt, confidence: "High" }] },
  duplicate.discoveredAt,
);
assert.equal(repairedEmployerIdentity.employerDomain, undefined, "An incoming connector identity must clear a historical ATS publishing domain");
assert.equal(repairedEmployerIdentity.companyProfile?.canonicalKey, "greenhouse:datadog");
assert.equal(repairedEmployerIdentity.companyProfile?.website, undefined);
assert.equal(isCanonicalOpportunityMatch(base, { ...duplicate, jobTitle: "Chief Operating Officer" }), false, "Different roles must never be merged");

const summary = summarizeOpportunityUniverse([base, { ...base, id: "three", universeStage: "Universe", source: "Recruiter" }]);
assert.equal(summary.total, 2);
assert.equal(summary.stages.Recommended, 1);
assert.equal(summary.stages.Universe, 2);
assert.equal(summary.stages.Qualified, 1);
assert.equal(summary.sourceCount, 2);

const live = toLiveOpportunity({ state: { id: "state", workspaceId: "workspace", executiveIdentityId: "executive", currentStep: "Reasoning", completedSteps: [], activeOpportunityId: "live-one", version: 1 }, historyCount: 1, feedbackCount: 0, lifecycleRequests: [], opportunity: { title: "Chief Revenue Officer", companyName: "North Star", location: "London", workModel: "Hybrid", source: "Recruiter", knownFacts: ["Reports to CEO"] } });
assert.equal(live?.id, "live-one");
assert.equal(live?.companyName, "North Star");
assert.equal(live?.matchScore, undefined);
assert.equal(live?.status, "Awaiting Atlas review");

const explained = toLiveOpportunity({ state: { id: "state", workspaceId: "workspace", executiveIdentityId: "executive", currentStep: "Decision", completedSteps: ["Reasoning"], activeOpportunityId: "live-one", version: 1 }, historyCount: 1, feedbackCount: 0, lifecycleRequests: [], opportunity: { title: "Chief Revenue Officer", companyName: "North Star" }, reasoning: { output: { recommendation: { action: "Apply", priority: "Soon", reasonCodes: ["STRATEGIC_FIT_HIGH"], evidenceIds: [] }, evidence: [], memoriesUsed: [], blueprintReferences: [], knowledgeReferences: [], ledgerReferences: [], compensationReferences: [], rulesApplied: ["STRATEGIC_FIT_HIGH"], conflicts: [], tradeoffs: [], gaps: [], questions: [], assumptions: [], alternatives: [], confidence: "High", why: ["STRATEGIC_FIT_HIGH"], whyNot: [], whatChanged: [], whatWouldChange: [] } } });
assert.equal(explained?.why[0], "The role shows strong strategic alignment with your Blueprint");

for (const [selectedDecisionAction, expected] of [["Apply", "Pursue"], ["Monitor", "Watch"], ["Reject", "Skip"]]) {
  const completed = toLiveOpportunity({ state: { id: "state", workspaceId: "workspace", executiveIdentityId: "executive", currentStep: "Feedback", completedSteps: ["Decision Finalized"], activeOpportunityId: "live-one", finalizedDecisionId: "decision-one", version: 2 }, historyCount: 1, feedbackCount: 0, lifecycleRequests: [], selectedDecisionAction, opportunity: { title: "Chief Revenue Officer", companyName: "North Star" } });
  assert.equal(completed?.executiveDecision, expected);
  assert.equal(completed?.status, `${expected} preserved`);
}

console.log("Opportunity Universe domain checks passed.");
