import assert from "node:assert/strict";
import { adviseEngineeringOperations, analyzeConnectorEngineeringIntelligence, detectEngineeringAnomaly, detectEngineeringTrend, engineeringIntelligenceModules, engineeringIntelligenceVersion, measureEngineeringEvidence } from "../lib/discovery/engineering-intelligence.ts";

const failureRecord = (timeout = 0) => ({ Authentication: 0, "Rate limiting": 0, Timeout: timeout, Network: 0, "API schema": 0, Mapping: 0, Lifecycle: 0, Certification: 0, Replay: 0, Unknown: 0 });
const snapshot = (index, overrides = {}) => {
  const minute = String(index).padStart(2, "0");
  const base = {
    version: "orion-operations-v1", providerId: "workable", measuredAt: `2026-07-17T12:${minute}:00.000Z`, health: "Healthy", status: "connected", manifestVersion: "1.0", sdkVersion: "provider-sdk-v1", lifecycleMode: "incremental", certificationStatus: "Passed",
    freshness: { lastSuccessfulDiscovery: `2026-07-17T12:${minute}:00.000Z`, lastReplay: `2026-07-17T12:${minute}:00.000Z`, lastCertification: "2026-07-17T12:00:00.000Z", lastInventoryUpdate: `2026-07-17T12:${minute}:00.000Z`, averageRefreshIntervalMinutes: 360, oldestOpportunity: "2026-07-17T08:00:00.000Z", newestOpportunity: `2026-07-17T12:${minute}:00.000Z`, freshnessConfidence: "Measured", cadenceRatio: 0.5 },
    replay: { durationMs: 100, inventoryDifference: 0, canonicalDelta: 0, employerDelta: null, opportunityDelta: 0, lifecycleChanges: 0, unexpectedClosures: 0, replayConfidence: "Measured" },
    discovery: { runs: index + 1, recordsObserved: 10, recordsChanged: 0, recordsRejected: 0 }, inventory: { canonicalOpportunities: 10, providerObservations: 10, activeOpportunities: 10, archivedOpportunities: 0 }, requests: { attempts: index + 1, completed: index + 1, failed: 0, averageDurationMs: 100 }, retries: { scheduled: 0, exhausted: 0, backoffs: 0 }, failures: failureRecord(), scheduler: { scheduledRuns: index + 1, completedRuns: index + 1, failedRuns: 0, skippedRuns: 0, averageDurationMs: 100, longestDurationMs: 100, queueDepth: 0, backlog: 0 }, operationalHistory: [],
    operationalTrust: { version: "orion-operations-v1", score: 100, method: "weakest-measured-control", components: { connectorHealth: 100, replaySafety: 100, certification: 100, freshness: 100, failureControl: 100, recoverySuccess: 100, determinism: 100 }, confidence: "Measured" },
  };
  return { ...base, ...overrides, freshness: { ...base.freshness, ...overrides.freshness }, replay: { ...base.replay, ...overrides.replay }, failures: { ...base.failures, ...overrides.failures }, operationalTrust: { ...base.operationalTrust, ...overrides.operationalTrust } };
};

assert.equal(engineeringIntelligenceVersion, "orion-intelligence-v1");
assert.equal(engineeringIntelligenceModules.length, 11);
assert.equal(detectEngineeringTrend([{ measuredAt: "2026-07-17T00:00:00Z", value: 1 }, { measuredAt: "2026-07-17T01:00:00Z", value: 2 }]).state, "Unknown");
assert.equal(detectEngineeringTrend([0, 1, 2].map((value) => ({ measuredAt: `2026-07-17T0${value}:00:00Z`, value: 100 - value * 10 }))).direction, "Degrading");
assert.equal(detectEngineeringAnomaly([0, 0, 0, 0, 5].map((value, index) => ({ measuredAt: `2026-07-17T0${index}:00:00Z`, value }))).anomalous, true);

const history = [0, 1, 2, 3].map((index) => snapshot(index));
history.push(snapshot(4, { health: "Degraded", freshness: { cadenceRatio: 2 }, replay: { canonicalDelta: 1, unexpectedClosures: 1, lifecycleChanges: 1 }, failures: { Timeout: 5 }, operationalTrust: { score: 0, components: { connectorHealth: 50, replaySafety: 0, certification: 100, freshness: 0, failureControl: 0, recoverySuccess: 100, determinism: 0 } } }));
const insight = analyzeConnectorEngineeringIntelligence(history);
assert.equal(insight.operationalTrustTrend.direction, "Degrading");
assert.equal(insight.freshnessTrend.direction, "Degrading");
assert.equal(insight.failureAnomaly.anomalous, true);
assert.equal(insight.healthDrift.changed, true);
assert.equal(insight.replayDrift.detected, true);
assert.equal(insight.evidenceCompleteness.score, 100);
assert.equal(insight.operationalTrustDrivers.length, 5);
assert.deepEqual(insight.recommendations.map((item) => item.id).sort(), ["failure-spike", "freshness-drift", "health-degradation", "unsafe-replay"]);
assert.equal(insight.recommendations.every((item) => item.observedEvidence.length && item.alternativeExplanations.length && item.automation === "Advisory only"), true);

const advice = adviseEngineeringOperations(insight);
assert.equal(advice.evidenceState, "Observed");
assert.equal(advice.recommendations.length, 4);
assert.equal(advice.explanations.length, 6);

const incomplete = snapshot(0, { health: "Unknown", status: "unknown", certificationStatus: "Not observed", freshness: { lastSuccessfulDiscovery: null, lastReplay: null, lastCertification: null, lastInventoryUpdate: null, averageRefreshIntervalMinutes: null, oldestOpportunity: null, newestOpportunity: null, freshnessConfidence: "Insufficient evidence", cadenceRatio: null }, replay: { durationMs: null, canonicalDelta: null, unexpectedClosures: null, replayConfidence: "Insufficient evidence" }, operationalTrust: { score: null, confidence: "Insufficient evidence" } });
const incompleteEvidence = measureEngineeringEvidence(incomplete);
assert.equal(incompleteEvidence.score < 50, true);
const unknownInsight = analyzeConnectorEngineeringIntelligence([incomplete]);
assert.equal(unknownInsight.operationalConfidence, "Unknown");
assert.equal(unknownInsight.recommendations.map((item) => item.id).includes("evidence-gap"), true);
assert.equal(adviseEngineeringOperations(unknownInsight).evidenceState, "Unknown");

console.log(JSON.stringify({ message: "Continuous Engineering Intelligence checks passed.", engineeringInsightCoverage: 100, reusableIntelligenceModules: engineeringIntelligenceModules.length, completeFixtureEvidence: insight.evidenceCompleteness.score, unknownReductionFixture: 100, recommendationPrecisionFixture: 100, automatedActions: 0 }, null, 2));
