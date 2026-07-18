import assert from "node:assert/strict";
import { canonicalCountry } from "../lib/discovery/country-normalization.ts";

assert.equal(canonicalCountry("GB"), "United Kingdom");
assert.equal(canonicalCountry("UK"), "United Kingdom");
assert.equal(canonicalCountry("United Kingdom"), "United Kingdom");
assert.equal(canonicalCountry("USA"), "United States");
assert.equal(canonicalCountry("South Korea"), "South Korea");
assert.equal(canonicalCountry("TR"), "Türkiye");
assert.equal(canonicalCountry("Turkey"), "Türkiye");
assert.equal(canonicalCountry("Germany"), "Germany");
assert.equal(canonicalCountry("TX"), undefined, "US state abbreviations must not be guessed as countries");
assert.equal(canonicalCountry("New York"), undefined, "cities must not be guessed as countries");
assert.equal(canonicalCountry("Remote"), undefined, "work arrangements are not countries");
assert.equal(canonicalCountry("Hybrid"), undefined, "work arrangements are not countries");

console.log("Deterministic country normalization checks passed.");
