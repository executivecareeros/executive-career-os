import assert from "node:assert/strict";
import { assessOpportunityConfidence, diversifyExecutiveRecommendations, founderGeographicProfileFixture, preferProfileFact, sortOpportunitiesForExecutive } from "../lib/opportunity-geography.ts";

const base = { id:"base",companyName:"Company",companyInitials:"CO",jobTitle:"Commercial Director",location:"Unknown",country:"Unknown",workArrangement:"Unknown",employmentType:"Full-time",industry:"Technology",companySize:"Enterprise",source:"Employer",publishedAt:"2026-07-16T00:00:00Z",discoveredAt:"2026-07-16T00:00:00Z",executiveFitScore:92,strategicOpportunityScore:85,overallScore:90,confidenceScore:90,status:"Discovered",priority:"High",travelRequirement:"Unknown",summary:"Lead international commercial growth.",keyResponsibilities:[],requiredSkills:["Enterprise sales","Leadership"],preferredSkills:[],matchingStrengths:["Enterprise sales","Leadership"],missingRequirements:[],riskFlags:[],exclusions:[],decisionRationale:"",recommendedCVProfile:"",coverLetterRecommended:false,notes:"",freshness:{status:"Fresh",ageHours:24,staleAfterHours:168} };
const opportunity=(id,location,country,workArrangement="Hybrid",summary=base.summary)=>({...base,id,location,country,workArrangement,summary});
const fixtures = [
  opportunity("worldwide","Worldwide","Global","Remote","Worldwide remote executive role."),
  opportunity("emea","EMEA","EMEA","Remote","Remote across EMEA."),
  opportunity("eu","Amsterdam","European Union","Hybrid"),
  opportunity("turkiye","Istanbul","Türkiye","Hybrid"),
  opportunity("relocation","Zurich","Switzerland","On-site","Relocation support may be available."),
  opportunity("unknown","Location not specified","Unknown","Unknown"),
  opportunity("us-sponsor","New York","United States","Hybrid","Visa sponsorship available."),
  opportunity("us-only","United States","United States","Remote","Remote for US residents only. No sponsorship."),
];
const profile = founderGeographicProfileFixture();
const results = Object.fromEntries(fixtures.map(item=>[item.id,assessOpportunityConfidence(item,profile)]));
assert.equal(results.worldwide.eligibility,"Eligible");
assert.equal(results.emea.eligibility,"Probably Eligible");
assert.equal(results.eu.eligibility,"Eligible");
assert.equal(results.turkiye.eligibility,"Eligible");
assert.equal(results.relocation.eligibility,"Relocation Required");
assert.equal(results.unknown.eligibility,"Eligibility Unknown");
assert.equal(results["us-sponsor"].eligibility,"Sponsorship Required");
assert.equal(results["us-only"].eligibility,"Not Currently Eligible");
assert.ok(results["us-only"].opportunityConfidence <= 20);
assert.ok(results.eu.opportunityConfidence > results["us-sponsor"].opportunityConfidence);
const order=sortOpportunitiesForExecutive(fixtures,profile).map(item=>item.id);
assert.deepEqual(order,["worldwide","emea","eu","turkiye","relocation","us-sponsor","unknown","us-only"]);
assert.equal(preferProfileFact(profile.homeCountry, { ...profile.homeCountry, value: "Unknown", state: "Inferred", source: "Later CV import" }).value, "Türkiye", "Confirmed facts must not be overwritten by inferred imports");
const unknownRole = (id, jobTitle, publishedAt) => ({ ...opportunity(id, "Location not specified", "Unknown", "Unknown"), jobTitle, publishedAt });
const executiveContext = { roleTitles: ["Sales Director", "Business Development Director"], industries: [], capabilities: [] };
const preferenceProfile = { ...profile, manualPreferences: { ...profile.manualPreferences, titles: ["Director"], updatedAt: "2026-07-21T00:00:00Z" } };
const tiedUnknown = [unknownRole("new-sales", "Sales Executive", "2026-07-21T00:00:00Z"), unknownRole("older-director", "Sales Director", "2026-07-20T00:00:00Z")];
assert.equal(sortOpportunitiesForExecutive(tiedUnknown, preferenceProfile, executiveContext)[0].id, "older-director", "Career and user-preference fit must break capped-confidence ties before recency");
assert.ok(assessOpportunityConfidence(tiedUnknown[1], preferenceProfile, executiveContext).preferenceFit > assessOpportunityConfidence(tiedUnknown[0], preferenceProfile, executiveContext).preferenceFit, "Only explicitly selected preference categories may contribute to preference fit");
const employerHeavy = [1,2,3,4].map(index => ({ ...base, id:`one-${index}`, companyName:"One Employer" })).concat([1,2].map(index => ({ ...base, id:`two-${index}`, companyName:"Two Employer" })));
assert.deepEqual(diversifyExecutiveRecommendations(employerHeavy, 2).slice(0, 4).map(item => item.id), ["one-1","one-2","two-1","two-2"], "One provider cohort must not crowd other employers off the first recommendation page");
assert.equal(diversifyExecutiveRecommendations(employerHeavy, 2).length, employerHeavy.length, "Recommendation diversity must not hide opportunities");
console.log("Geographic confidence ranking checks passed.");
