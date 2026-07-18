import assert from "node:assert/strict";
import fs from "node:fs";

const card = fs.readFileSync(new URL("../components/opportunities/live-opportunity-universe.tsx", import.meta.url), "utf8");
const review = fs.readFileSync(new URL("../components/opportunities/collected-opportunity-intelligence.tsx", import.meta.url), "utf8");
const application = fs.readFileSync(new URL("../components/opportunities/opportunity-application-link.tsx", import.meta.url), "utf8");

assert.match(card, /OpportunityApplicationLink/);
assert.match(review, /OpportunityApplicationLink/);
assert.match(application, /Apply on employer site/);
assert.match(application, /Open source listing/);
assert.match(application, /noopener noreferrer/);
assert.doesNotMatch(card, /Original listing/);
assert.doesNotMatch(review, /Original listing/);

console.log("Opportunity application action tests passed.");
