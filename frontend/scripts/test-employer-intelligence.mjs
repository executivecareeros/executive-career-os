import assert from "node:assert/strict";
import { buildCanonicalEmployerIntelligence } from "../lib/employer-intelligence.ts";
import { hydrateExecutiveGeographicProfile } from "../lib/opportunity-geography.ts";

const company = { name: "Acme", country: "Netherlands", industry: "Enterprise Software", official_domain: "acme.example", careers_url: "https://jobs.example/acme", ats_provider: "greenhouse", identity_confidence: 96, last_verified_at: "2026-07-18T10:00:00Z" };
const role = (id, title, country, location) => ({ id, contentFingerprint: id, companyName: "Acme", jobTitle: title, country, location, industry: "Enterprise Software", companySize: "Enterprise", summary: "Published role evidence", lastObservedAt: "2026-07-18T10:00:00Z" });
const intelligence = buildCanonicalEmployerIntelligence(company, [role("1", "Chief Revenue Officer", "Netherlands", "Amsterdam"), role("2", "VP Sales", "Germany", "Berlin")], new Date("2026-07-18T12:00:00Z"));
assert.equal(intelligence.activeOpportunities, 2);
assert.equal(intelligence.executiveOpportunities, 2);
assert.equal(intelligence.commercialOpportunities, 2);
assert.deepEqual(intelligence.operatingCountries, ["Germany", "Netherlands"]);
assert.equal(intelligence.freshness, "Current");
assert.match(intelligence.fingerprint, /^employer-intelligence-v1:/);
assert.deepEqual(buildCanonicalEmployerIntelligence(company, [role("1", "Chief Revenue Officer", "Netherlands", "Amsterdam"), role("2", "VP Sales", "Germany", "Berlin")], new Date("2026-07-18T12:00:00Z")).fingerprint, intelligence.fingerprint);

const profile = hydrateExecutiveGeographicProfile({ manualPreferences: { countries: ["Germany"], source: "User Preference", updatedAt: "2026-07-18T12:00:00Z" } });
assert.deepEqual(profile.manualPreferences.countries, ["Germany"]);
assert.deepEqual(profile.manualPreferences.industries, []);
console.log("Employer intelligence and manual preference checks passed.");
