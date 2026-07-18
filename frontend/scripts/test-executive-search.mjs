import assert from "node:assert/strict";
import { matchesExecutiveSearch, searchSuggestions } from "../lib/executive-search.ts";
import { classifyOpportunityIndustry } from "../lib/discovery/industry-classification.ts";

const opportunity = {
  companyName: "Acme Cloud", jobTitle: "Chief Revenue Officer", location: "Amsterdam, Netherlands", country: "Netherlands",
  industry: "Enterprise Software", summary: "Lead global enterprise sales", requiredSkills: ["SaaS"], employmentType: "Full-time",
  workArrangement: "Hybrid", companySize: "Enterprise", salaryMin: 180000, salaryMax: 220000, salaryCurrency: "EUR",
};
const filters = { query: "CRO", countries: ["Netherlands"], cities: ["Amsterdam"], regions: [], industries: ["Enterprise Software"], titles: [], departments: ["Sales"], seniorities: ["Chief"], employmentTypes: ["Full-time"], remoteOptions: ["Hybrid"], companySizes: ["Enterprise"], salaryMinimum: "190000", salaryMaximum: "230000", salaryCurrency: "EUR" };
assert.equal(matchesExecutiveSearch(opportunity, filters), true, "aliases and multi-select filters should match");
assert.equal(matchesExecutiveSearch(opportunity, { ...filters, countries: ["United States"] }), false, "country preference must be respected");
assert.ok(searchSuggestions("cro", [opportunity]).includes("cro"), "aliases should be suggested");
assert.ok(searchSuggestions("reveneu", [opportunity]).includes("Chief Revenue Officer"), "common misspellings should suggest the intended role");

const baseJob = { sourceId: "1", source: "greenhouse", title: "VP Sales", company: { sourceId: "acme", name: "Acme" }, description: "Lead revenue for our enterprise SaaS cloud platform.", discoveredAt: "2026-07-18T00:00:00Z", rawMetadata: {} };
assert.deepEqual(classifyOpportunityIndustry({ ...baseJob, company: { ...baseJob.company, industry: "Cybersecurity" } }).source, "Verified provider metadata");
assert.equal(classifyOpportunityIndustry(baseJob).value, "Not specified", "role copy must not determine employer industry");
assert.equal(classifyOpportunityIndustry({ ...baseJob, rawMetadata: { industry: "Enterprise Software" } }).value, "Enterprise Software", "explicit provider industry metadata remains valid evidence");
assert.equal(classifyOpportunityIndustry({ ...baseJob, description: "Build an AI-first commerce platform." }).value, "Not specified", "technology mentioned in a role must not be presented as employer industry evidence");
assert.equal(classifyOpportunityIndustry({ ...baseJob, description: "Executive leadership role." }).value, "Not specified", "unknown must remain unknown");
console.log("Executive search and industry classification tests passed.");
