import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../components/home/simple-executive-home.tsx", import.meta.url), "utf8");

for (const required of [
  "Your executive briefing.",
  "Latest confirmed context",
  "Needs attention",
  "Opportunity in focus",
  "Atlas perspective",
  "Decision continuity",
  "Only confirmed workspace information appears here.",
]) assert.ok(source.includes(required), `Missing briefing contract: ${required}`);

assert.ok(source.includes("profileState?.confirmedRoleCount"), "Briefing must use the confirmed role count");
assert.ok(source.includes("unansweredQuestions"), "Briefing must expose material unanswered questions");
assert.ok(source.includes("decisionAction"), "Briefing must preserve decision continuity");
assert.ok(!source.includes('locale === "tr"'), "Production briefing must not switch to Turkish");
assert.ok(!source.includes("demo"), "Authenticated briefing must not depend on demonstration data");

console.log("Executive briefing contract passed");
