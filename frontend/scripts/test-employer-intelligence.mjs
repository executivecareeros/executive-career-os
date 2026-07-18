import assert from "node:assert/strict";
import { buildCanonicalEmployerIntelligence, toAtlasEmployerContext } from "../lib/employer-intelligence.ts";
import { hydrateExecutiveGeographicProfile } from "../lib/opportunity-geography.ts";

const company = { name: "Acme", country: "Netherlands", industry: "Enterprise Software", official_domain: "acme.example", careers_url: "https://jobs.example/acme", ats_provider: "greenhouse", identity_confidence: 96, last_verified_at: "2026-07-18T10:00:00Z", payload: { companyIntelligence: { facts: [
  { field: "overview", value: "Acme builds verified enterprise software.", sourceUrl: "https://www.acme.example/about", sourceType: "Schema.org", observedAt: "2026-07-18T10:00:00Z", confidence: 95 },
  { field: "headquarters", value: "Amsterdam, Netherlands", sourceUrl: "https://acme.example/about", sourceType: "Schema.org", observedAt: "2026-07-18T10:00:00Z", confidence: 90 },
  { field: "productOrService", value: "Enterprise Platform", sourceUrl: "https://acme.example/products", sourceType: "Schema.org", observedAt: "2026-07-18T10:00:00Z", confidence: 90 },
] } } };
const role = (id, title, country, location) => ({ id, contentFingerprint: id, companyName: "Acme", jobTitle: title, country, location, industry: "Enterprise Software", companySize: "Enterprise", summary: "Published role evidence", lastObservedAt: "2026-07-18T10:00:00Z" });
const intelligence = buildCanonicalEmployerIntelligence(company, [role("1", "Chief Revenue Officer", "Netherlands", "Amsterdam"), role("2", "VP Sales", "Germany", "Berlin")], new Date("2026-07-18T12:00:00Z"));
assert.equal(intelligence.activeOpportunities, 2);
assert.equal(intelligence.executiveOpportunities, 2);
assert.equal(intelligence.commercialOpportunities, 2);
assert.deepEqual(intelligence.operatingCountries, ["Germany", "Netherlands"]);
assert.equal(intelligence.freshness, "Current");
assert.equal(intelligence.overview, "Acme builds verified enterprise software.");
assert.equal(intelligence.headquarters, "Amsterdam, Netherlands");
assert.deepEqual(intelligence.productsAndServices, ["Enterprise Platform"]);
assert.match(intelligence.fingerprint, /^employer-intelligence-v2:/);
assert.deepEqual(buildCanonicalEmployerIntelligence(company, [role("1", "Chief Revenue Officer", "Netherlands", "Amsterdam"), role("2", "VP Sales", "Germany", "Berlin")], new Date("2026-07-18T12:00:00Z")).fingerprint, intelligence.fingerprint);
const atlas = toAtlasEmployerContext(intelligence);
assert.equal(atlas.summary, intelligence.overview);
assert.ok(atlas.confirmedFacts.some((fact) => fact.source.includes("https://acme.example/about")));
assert.deepEqual(atlas.unknowns, []);

const unverified = buildCanonicalEmployerIntelligence({ ...company, payload: { companyIntelligence: { facts: [{ ...company.payload.companyIntelligence.facts[0], sourceUrl: "https://untrusted.example/about" }] } } }, [], new Date("2026-07-18T12:00:00Z"));
assert.equal(unverified.overview, "No active opportunity evidence is currently available for Acme.");
assert.equal(unverified.headquarters, "Unknown");

const profile = hydrateExecutiveGeographicProfile({ manualPreferences: { countries: ["Germany"], source: "User Preference", updatedAt: "2026-07-18T12:00:00Z" } });
assert.deepEqual(profile.manualPreferences.countries, ["Germany"]);
assert.deepEqual(profile.manualPreferences.industries, []);
console.log("Employer intelligence and manual preference checks passed.");
