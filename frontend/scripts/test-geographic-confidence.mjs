import assert from "node:assert/strict";
import { assessOpportunityConfidence, founderGeographicProfileFixture, sortOpportunitiesForExecutive } from "../lib/opportunity-geography.ts";

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
assert.deepEqual(order,["worldwide","emea","eu","turkiye","relocation","unknown","us-sponsor","us-only"]);
console.log("Geographic confidence ranking checks passed.");
