import assert from "node:assert/strict";
import { canonicalCountry, canonicalCountryOptions, countryFromExplicitLocation } from "../lib/discovery/country-normalization.ts";

assert.ok(canonicalCountryOptions.length >= 240, "Search must expose the complete ISO country registry");
assert.ok(canonicalCountryOptions.includes("Türkiye"));
assert.ok(canonicalCountryOptions.includes("United States"));
assert.deepEqual(canonicalCountryOptions, [...canonicalCountryOptions].sort((left, right) => left.localeCompare(right, "en")));

assert.equal(canonicalCountry("TR"), "Türkiye");
assert.equal(canonicalCountry("Turkey"), "Türkiye");
assert.equal(canonicalCountry("Türkiye"), "Türkiye");
assert.equal(canonicalCountry("GB"), "United Kingdom");
assert.equal(canonicalCountry("UK"), "United Kingdom");
assert.equal(canonicalCountry("United Kingdom"), "United Kingdom");
assert.equal(canonicalCountry("USA"), "United States");
assert.equal(canonicalCountry("South Korea"), "South Korea");
assert.equal(canonicalCountry("Germany"), "Germany");
assert.equal(canonicalCountry("European Union"), undefined);
assert.equal(canonicalCountry("EMEA"), undefined);
assert.equal(canonicalCountry("TX"), undefined, "US state abbreviations must not be guessed as countries");
assert.equal(canonicalCountry("New York"), undefined, "cities must not be guessed as countries");
assert.equal(canonicalCountry("Remote"), undefined, "work arrangements are not countries");
assert.equal(canonicalCountry("Hybrid"), undefined, "work arrangements are not countries");

assert.equal(countryFromExplicitLocation("Berlin, Germany"), "Germany");
assert.equal(countryFromExplicitLocation("Remote (United Kingdom)"), "United Kingdom");
assert.equal(countryFromExplicitLocation("Istanbul / Türkiye"), "Türkiye");
assert.equal(countryFromExplicitLocation("Remote — United States"), "United States");
assert.equal(countryFromExplicitLocation("Worldwide Remote"), undefined);
assert.equal(countryFromExplicitLocation("EMEA Remote"), undefined);
assert.equal(countryFromExplicitLocation("Berlin"), undefined, "A city must never be guessed into a country");
assert.equal(countryFromExplicitLocation("Not specified"), undefined);

console.log("Country normalization checks passed.");
