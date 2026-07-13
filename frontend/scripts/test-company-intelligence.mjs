import assert from "node:assert/strict";
import { calculateDepartmentHealth, calculateFreshness, calculateMetricStatus, canAccessArea, createCompanySnapshot, metricRegistry, rankFounderActions, suppressDuplicateAlerts, unavailableObservation } from "../lib/company-intelligence/index.ts";

const source = { id: "test", name: "Test", type: "Provider", reference: "test://source", connectionState: "Not Connected" };

assert.equal(calculateMetricStatus(undefined, { warning: 5, critical: 10, direction: "Above Is Worse" }), "Unknown", "Missing metrics must not become zero or healthy.");
assert.equal(calculateMetricStatus(12, { warning: 5, critical: 10, direction: "Above Is Worse" }), "Critical");
assert.equal(calculateMetricStatus(3, { warning: 5, critical: 10, direction: "Above Is Worse" }), "Healthy");

const unavailable = unavailableObservation("users", source, "Founder", "No source");
assert.equal(unavailable.value, undefined);
assert.equal(unavailable.valueKind, "Unavailable");
assert.equal(unavailable.status, "Not Connected");

const freshness = calculateFreshness("2026-07-13T00:00:00.000Z", new Date("2026-07-13T06:00:00.000Z"), 12, "Connected", "Daily");
assert.equal(freshness.state, "Current");
assert.equal(freshness.ageInHours, 6);
assert.equal(calculateFreshness(undefined, new Date(), 12, "Not Connected", "Daily").state, "Not Connected");

assert.equal(calculateDepartmentHealth([], "Not Connected"), "Not Connected");
assert.equal(calculateDepartmentHealth([], "Partially Connected"), "Unknown");

const actions = [
  { id: "later", title: "Later", department: "Product", urgency: "Future", importance: "Low", reason: "Test", evidence: [], recommendedNextStep: "Wait", owner: "Founder", sourceLink: "test", status: "Open", approvalRequired: false },
  { id: "now", title: "Now", department: "Security", urgency: "Immediate", importance: "Critical", reason: "Test", evidence: [], recommendedNextStep: "Review", owner: "Founder", sourceLink: "test", status: "Open", approvalRequired: true },
];
assert.equal(rankFounderActions(actions, new Date("2026-07-13T00:00:00.000Z"))[0].id, "now");

const alert = { id: "a", title: "Alert", department: "Security", severity: "High", evidence: [], sourceReference: "test", status: "Open", correlationId: "same" };
assert.equal(suppressDuplicateAlerts([alert, { ...alert, id: "b" }]).length, 1);

assert.equal(canAccessArea("Founder", "Finance"), true);
assert.equal(canAccessArea("Board Member", "Company Overview"), false, "Only the founder view is enabled in this foundation.");
assert.equal(canAccessArea("Auditor", "Finance"), false);

const snapshot = createCompanySnapshot(new Date("2026-07-13T09:00:00.000Z"));
assert.equal(snapshot.brief.status, "Demonstration Briefing");
assert.ok(snapshot.brief.sections.every((section) => section.evidence.length > 0));
assert.ok(snapshot.actions.length >= 3);
assert.equal(snapshot.health.departments.length, 15);
assert.equal(snapshot.health.metrics.find((metric) => metric.definition.id === "revenue").observation.value, undefined);
assert.equal(new Set(metricRegistry.map((metric) => metric.canonicalKey)).size, metricRegistry.length, "Canonical metric keys must be unique.");
assert.ok(metricRegistry.length >= 60, "The registry must cover company, users, sales, marketing, support, finance, and engineering foundations.");

console.log("Company Intelligence deterministic tests passed.");
