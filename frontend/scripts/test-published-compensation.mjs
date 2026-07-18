import assert from "node:assert/strict";
import { extractPublishedCompensation } from "../lib/discovery/published-compensation.ts";

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

console.log("Published compensation extraction tests passed.");
