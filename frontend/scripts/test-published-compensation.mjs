import assert from "node:assert/strict";
import { extractPublishedCompensation, resolvePublishedCompensation } from "../lib/discovery/published-compensation.ts";

assert.deepEqual(
  extractPublishedCompensation("The base salary range is EUR 150,000–190,000 per year."),
  { minimum: 150000, maximum: 190000, currency: "EUR" },
);
assert.deepEqual(
  extractPublishedCompensation("The annual compensation range is $180k to $220k."),
  { minimum: 180000, maximum: 220000, currency: undefined },
);
assert.equal(extractPublishedCompensation("Revenue responsibility of €10m–€20m."), undefined);
assert.equal(extractPublishedCompensation("Requires 5–10 years of leadership experience."), undefined);
assert.equal(extractPublishedCompensation("Competitive salary and benefits."), undefined);
assert.deepEqual(resolvePublishedCompensation({ salaryMin: 100000, salaryMax: 120000, salaryCurrency: "GBP", summary: "Salary EUR 1,000,000–2,000,000" }), { minimum: 100000, maximum: 120000, currency: "GBP" });
assert.deepEqual(resolvePublishedCompensation({ summary: "Published salary: EUR 140,000–160,000 annually." }), { minimum: 140000, maximum: 160000, currency: "EUR" });

console.log("Published compensation extraction tests passed.");
