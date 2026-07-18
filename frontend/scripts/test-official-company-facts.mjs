import assert from "node:assert/strict";
import { extractOfficialCompanyFacts, officialFactsFromPayload } from "../lib/company-intelligence/official-company-facts.ts";

const observedAt = "2026-07-18T10:00:00Z";
const html = `<!doctype html><html><head><meta property="og:description" content="Fallback overview"><script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Organization", name: "Acme", description: "Official overview", industry: "Enterprise Software",
  address: { "@type": "PostalAddress", addressLocality: "Amsterdam", addressCountry: "Netherlands" }, numberOfEmployees: { value: "501-1000" },
  makesOffer: [{ itemOffered: { "@type": "Service", name: "Executive Intelligence" } }],
})}</script></head></html>`;
const extracted = extractOfficialCompanyFacts({ html, sourceUrl: "https://www.acme.example/about", expectedDomain: "acme.example", observedAt });
assert.equal(extracted.canonicalName, "Acme");
assert.ok(extracted.facts.some((fact) => fact.field === "overview" && fact.value === "Official overview"));
assert.ok(extracted.facts.some((fact) => fact.field === "headquarters" && fact.value === "Amsterdam, Netherlands"));
assert.ok(extracted.facts.some((fact) => fact.field === "productOrService" && fact.value === "Executive Intelligence"));
assert.equal(extractOfficialCompanyFacts({ html, sourceUrl: "https://www.acme.example/about", expectedDomain: "https://acme.example", observedAt }).fingerprint, extracted.fingerprint);

const fallback = extractOfficialCompanyFacts({ html: '<meta content="Official fallback" property="og:description">', sourceUrl: "https://acme.example", expectedDomain: "acme.example", observedAt });
assert.equal(fallback.facts[0]?.value, "Official fallback");
assert.throws(() => extractOfficialCompanyFacts({ html, sourceUrl: "https://untrusted.example", expectedDomain: "acme.example", observedAt }), /verified employer domain/);
assert.throws(() => extractOfficialCompanyFacts({ html: "x".repeat(2_000_001), sourceUrl: "https://acme.example", expectedDomain: "acme.example", observedAt }), /bounded extraction limit/);
assert.doesNotThrow(() => extractOfficialCompanyFacts({ html: '<script type="application/ld+json">{bad</script>', sourceUrl: "https://acme.example", expectedDomain: "acme.example", observedAt }));

const accepted = officialFactsFromPayload({ companyIntelligence: { facts: extracted.facts } }, "acme.example");
assert.equal(accepted.length, extracted.facts.length);
assert.equal(officialFactsFromPayload({ companyIntelligence: { facts: extracted.facts.map((fact) => ({ ...fact, sourceUrl: "https://untrusted.example" })) } }, "acme.example").length, 0);
console.log("Official company fact extraction checks passed.");
