import assert from "node:assert/strict";
import { assessOpportunityConfidence, founderGeographicProfileFixture, sortOpportunitiesForExecutive } from "../lib/opportunity-geography.ts";
import { readFile } from "node:fs/promises";

const base = { companyInitials: "EX", location: "Berlin, European Union", country: "Germany", workArrangement: "Hybrid", employmentType: "Full-time", industry: "Enterprise Software", companySize: "1000+", source: "Greenhouse", publishedAt: "2026-07-16", discoveredAt: "2026-07-16", executiveFitScore: 60, strategicOpportunityScore: 60, overallScore: 60, confidenceScore: 90, status: "Discovered", priority: "Medium", travelRequirement: "Unknown", summary: "Enterprise software leadership role.", keyResponsibilities: [], requiredSkills: [], preferredSkills: [], matchingStrengths: [], missingRequirements: [], riskFlags: [], exclusions: [], decisionRationale: "", recommendedCVProfile: "", coverLetterRecommended: false, notes: "" };
const opportunities = [
  { ...base, id: "commercial", companyName: "Commercial Co", jobTitle: "Chief Revenue Officer", summary: "Lead enterprise SaaS revenue, sales and go-to-market strategy." },
  { ...base, id: "engineering", companyName: "Engineering Co", jobTitle: "VP Engineering", summary: "Lead platform engineering and developer infrastructure." },
  { ...base, id: "us-only", companyName: "US Co", jobTitle: "Chief Revenue Officer", country: "United States", location: "US residents only — Remote", workArrangement: "Remote" },
];
const careerContext = { roleTitles: ["Group Sales Director", "Managing Director", "Business Development Director"], industries: ["Enterprise Software", "Broadcast Technology"], capabilities: ["Sales", "Business Development", "Go-to-market"] };
const profile = founderGeographicProfileFixture();
const ranked = sortOpportunitiesForExecutive(opportunities, profile, careerContext);
assert.equal(ranked[0].id, "commercial", "Confirmed commercial leadership must outrank an unrelated engineering role");
assert.equal(ranked.at(-1).id, "us-only", "A US-residence restriction must remain below eligible EU roles");
const commercial = assessOpportunityConfidence(opportunities[0], profile, careerContext);
const engineering = assessOpportunityConfidence(opportunities[1], profile, careerContext);
assert.ok(commercial.opportunityConfidence - engineering.opportunityConfidence >= 8, "Best Match must create useful score separation");
assert.ok(assessOpportunityConfidence(opportunities[2], profile, careerContext).opportunityConfidence <= 20, "Hard eligibility rules must cap confidence");

const review = await readFile(new URL("../components/opportunities/collected-opportunity-intelligence.tsx", import.meta.url), "utf8");
for (const heading of ["Atlas executive briefing", "Role summary", "What the executive will own", "Expected impact", "Leadership expectations", "Required capabilities", "Company analysis", "Questions requiring investigation"]) assert.match(review, new RegExp(heading), `${heading} must be visible in Opportunity Review`);
assert.ok(review.indexOf("Role summary") < review.indexOf("Company analysis"), "Role analysis must precede company analysis");
const topBar = await readFile(new URL("../components/top-bar.tsx", import.meta.url), "utf8");
assert.match(topBar, /href="\/" aria-label="ORENDALIS Home"/, "The mobile ORENDALIS logo must return Home");
console.log("Founder product correction checks passed.");
