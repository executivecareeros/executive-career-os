import assert from "node:assert/strict";
import { extractPublishedRoleSections } from "../lib/discovery/published-role-sections.ts";

const extracted = extractPublishedRoleSections("Overview. IN THIS ROLE YOU WILL - Lead regional sales - Own revenue outcomes YOU MIGHT THRIVE IN THIS ROLE IF - 10+ years enterprise sales - Frequent travel across EMEA BENEFITS Full benefits");
assert.deepEqual(extracted.responsibilities, ["Lead regional sales", "Own revenue outcomes"]);
assert.deepEqual(extracted.requirements, ["10+ years enterprise sales", "Frequent travel across EMEA"]);
assert.equal(extracted.travelRequirement, "Frequent travel (published requirement)");

const unknown = extractPublishedRoleSections("This role works across several markets and may evolve as the company grows.");
assert.deepEqual(unknown, { responsibilities: [], requirements: [], travelRequirement: undefined });

const prose = extractPublishedRoleSections("Candidates discuss responsibilities with the hiring manager. Qualifications vary by market.");
assert.deepEqual(prose, { responsibilities: [], requirements: [], travelRequirement: undefined });

console.log("Published role section extraction checks passed.");
