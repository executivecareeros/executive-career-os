import type { ConnectorFailureClass, ConnectorOperationsSnapshot, ConnectorOperationalHealth } from "./connector-operations.ts";

export const engineeringIntelligenceVersion = "orion-intelligence-v1" as const;
export const engineeringIntelligenceModules = [
  "trend-detection", "anomaly-detection", "health-drift", "freshness-drift", "replay-drift",
  "failure-pattern-recognition", "recovery-pattern-recognition", "operational-confidence",
  "evidence-completeness", "unknown-state-detection", "recommendation-generation",
] as const;

export type EngineeringConfidence = "High" | "Moderate" | "Low" | "Unknown";
export type EngineeringEvidenceState = "Observed" | "Inferred" | "Unknown";
export type MetricPoint = { measuredAt: string; value: number };
export type EngineeringTrend = {
  state: EngineeringEvidenceState;
  direction: "Improving" | "Degrading" | "Stable" | "Unknown";
  change: number | null;
  changePercent: number | null;
  samples: number;
  confidence: EngineeringConfidence;
  explanation: string;
};
export type EngineeringAnomaly = {
  state: EngineeringEvidenceState;
  anomalous: boolean | null;
  current: number | null;
  baselineMedian: number | null;
  medianAbsoluteDeviation: number | null;
  confidence: EngineeringConfidence;
  explanation: string;
};
export type EngineeringRecommendation = {
  id: string;
  providerId: string;
  observedEvidence: readonly string[];
  supportingMeasurements: Readonly<Record<string, number | string | null>>;
  confidence: EngineeringConfidence;
  alternativeExplanations: readonly string[];
  recommendedAction: string;
  expectedOperationalImpact: string;
  automation: "Advisory only";
};
export type EngineeringInsight = {
  providerId: string;
  measuredAt: string;
  operationalTrustTrend: EngineeringTrend;
  freshnessTrend: EngineeringTrend;
  failureAnomaly: EngineeringAnomaly;
  healthDrift: { from: ConnectorOperationalHealth | null; to: ConnectorOperationalHealth | null; changed: boolean | null; explanation: string };
  replayDrift: { detected: boolean | null; canonicalDelta: number | null; unexpectedClosures: number | null; explanation: string };
  failurePatterns: readonly { failureClass: ConnectorFailureClass; current: number; previousAverage: number; increased: boolean }[];
  recoveryPattern: { observedRecoveries: number; unresolvedFailures: number; explanation: string };
  evidenceCompleteness: { score: number; known: number; required: number; missing: readonly string[] };
  unknownStates: readonly string[];
  operationalConfidence: EngineeringConfidence;
  operationalTrustDrivers: readonly { component: string; previous: number | null; current: number | null; change: number | null }[];
  recommendations: readonly EngineeringRecommendation[];
};

const round = (value: number) => Math.round(value * 10) / 10;
const median = (values: readonly number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export function detectEngineeringTrend(points: readonly MetricPoint[], options: { higherIsBetter?: boolean; meaningfulPercent?: number } = {}): EngineeringTrend {
  const ordered = [...points].filter((point) => Number.isFinite(point.value) && !Number.isNaN(Date.parse(point.measuredAt))).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  if (ordered.length < 3) return { state: "Unknown", direction: "Unknown", change: null, changePercent: null, samples: ordered.length, confidence: "Unknown", explanation: "At least three measured samples are required." };
  const first = ordered[0].value;
  const last = ordered.at(-1)!.value;
  const change = round(last - first);
  const changePercent = first === 0 ? (last === 0 ? 0 : 100) : round(change / Math.abs(first) * 100);
  const meaningful = Math.abs(changePercent) >= (options.meaningfulPercent ?? 10);
  const rawDirection = !meaningful ? "Stable" : change > 0 ? "Increasing" : "Decreasing";
  const higherIsBetter = options.higherIsBetter ?? true;
  const direction = rawDirection === "Stable" ? "Stable" : (rawDirection === "Increasing") === higherIsBetter ? "Improving" : "Degrading";
  const intervalDirections = ordered.slice(1).map((point, index) => Math.sign(point.value - ordered[index].value));
  const expected = Math.sign(change);
  const consistent = expected === 0 ? intervalDirections.filter((value) => value === 0).length : intervalDirections.filter((value) => value === 0 || value === expected).length;
  const consistency = consistent / intervalDirections.length;
  const confidence: EngineeringConfidence = ordered.length >= 5 && consistency >= 0.75 ? "High" : consistency >= 0.5 ? "Moderate" : "Low";
  return { state: "Observed", direction, change, changePercent, samples: ordered.length, confidence, explanation: `${ordered.length} measured samples changed from ${first} to ${last}; directional consistency was ${round(consistency * 100)}%.` };
}

export function detectEngineeringAnomaly(points: readonly MetricPoint[]): EngineeringAnomaly {
  const ordered = [...points].filter((point) => Number.isFinite(point.value) && !Number.isNaN(Date.parse(point.measuredAt))).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  if (ordered.length < 5) return { state: "Unknown", anomalous: null, current: ordered.at(-1)?.value ?? null, baselineMedian: null, medianAbsoluteDeviation: null, confidence: "Unknown", explanation: "At least five measured samples are required." };
  const current = ordered.at(-1)!.value;
  const baseline = ordered.slice(0, -1).map((point) => point.value);
  const baselineMedian = median(baseline);
  const mad = median(baseline.map((value) => Math.abs(value - baselineMedian)));
  const anomalous = mad === 0 ? current !== baselineMedian : Math.abs(current - baselineMedian) > 3 * mad;
  return { state: "Observed", anomalous, current, baselineMedian: round(baselineMedian), medianAbsoluteDeviation: round(mad), confidence: ordered.length >= 8 ? "High" : "Moderate", explanation: mad === 0 ? `The stable baseline was ${baselineMedian}; the current value is ${current}.` : `The current value is compared with a baseline median of ${round(baselineMedian)} and a median absolute deviation of ${round(mad)}.` };
}

const requiredEvidence = [
  ["health", (snapshot: ConnectorOperationsSnapshot) => snapshot.health !== "Unknown"],
  ["source status", (snapshot: ConnectorOperationsSnapshot) => snapshot.status !== "unknown"],
  ["certification", (snapshot: ConnectorOperationsSnapshot) => snapshot.certificationStatus === "Passed"],
  ["last successful discovery", (snapshot: ConnectorOperationsSnapshot) => snapshot.freshness.lastSuccessfulDiscovery !== null],
  ["last replay", (snapshot: ConnectorOperationsSnapshot) => snapshot.freshness.lastReplay !== null],
  ["last certification", (snapshot: ConnectorOperationsSnapshot) => snapshot.freshness.lastCertification !== null],
  ["last inventory update", (snapshot: ConnectorOperationsSnapshot) => snapshot.freshness.lastInventoryUpdate !== null],
  ["average refresh interval", (snapshot: ConnectorOperationsSnapshot) => snapshot.freshness.averageRefreshIntervalMinutes !== null],
  ["oldest opportunity", (snapshot: ConnectorOperationsSnapshot) => snapshot.freshness.oldestOpportunity !== null],
  ["newest opportunity", (snapshot: ConnectorOperationsSnapshot) => snapshot.freshness.newestOpportunity !== null],
  ["replay duration", (snapshot: ConnectorOperationsSnapshot) => snapshot.replay.durationMs !== null],
  ["canonical replay delta", (snapshot: ConnectorOperationsSnapshot) => snapshot.replay.canonicalDelta !== null],
  ["unexpected closures", (snapshot: ConnectorOperationsSnapshot) => snapshot.replay.unexpectedClosures !== null],
  ["operational trust", (snapshot: ConnectorOperationsSnapshot) => snapshot.operationalTrust.score !== null],
] as const;

export function measureEngineeringEvidence(snapshot: ConnectorOperationsSnapshot) {
  const missing = requiredEvidence.filter(([, predicate]) => !predicate(snapshot)).map(([label]) => label);
  const known = requiredEvidence.length - missing.length;
  return { score: round(known / requiredEvidence.length * 100), known, required: requiredEvidence.length, missing };
}

const totalFailures = (snapshot: ConnectorOperationsSnapshot) => Object.values(snapshot.failures).reduce((sum, count) => sum + count, 0);
const confidenceFrom = (evidenceScore: number, samples: number): EngineeringConfidence => evidenceScore === 100 && samples >= 5 ? "High" : evidenceScore >= 80 && samples >= 3 ? "Moderate" : evidenceScore >= 50 ? "Low" : "Unknown";

type PatternContext = { latest: ConnectorOperationsSnapshot; previous?: ConnectorOperationsSnapshot; history: readonly ConnectorOperationsSnapshot[]; completeness: ReturnType<typeof measureEngineeringEvidence>; failureAnomaly: EngineeringAnomaly };
type OperationalPattern = { id: string; evidence: readonly string[]; matches(context: PatternContext): boolean; measurements(context: PatternContext): Readonly<Record<string, number | string | null>>; confidence(context: PatternContext): EngineeringConfidence; alternatives: readonly string[]; action: string; impact: string };

export const knownOperationalPatterns: readonly OperationalPattern[] = [
  { id: "unsafe-replay", evidence: ["Replay recorded unexpected lifecycle closures."], matches: ({ latest }) => (latest.replay.unexpectedClosures ?? 0) > 0, measurements: ({ latest }) => ({ unexpectedClosures: latest.replay.unexpectedClosures, canonicalDelta: latest.replay.canonicalDelta }), confidence: ({ latest }) => latest.replay.replayConfidence === "Measured" ? "High" : "Unknown", alternatives: ["A deliberate complete-snapshot lifecycle transition may explain closures only when the manifest authorizes it."], action: "Pause connector activation and inspect replay lifecycle evidence.", impact: "Prevents canonical inventory loss or false closure." },
  { id: "freshness-drift", evidence: ["Latest successful discovery exceeded the declared cadence."], matches: ({ latest }) => (latest.freshness.cadenceRatio ?? 0) > 1.5, measurements: ({ latest }) => ({ cadenceRatio: latest.freshness.cadenceRatio, lastSuccessfulDiscovery: latest.freshness.lastSuccessfulDiscovery }), confidence: ({ latest }) => latest.freshness.freshnessConfidence === "Measured" ? "High" : "Unknown", alternatives: ["A deliberately paused schedule can produce the same cadence ratio."], action: "Inspect scheduler state, queue backlog, and the latest provider failure before changing cadence.", impact: "Restores timely opportunity observations without speculative scheduling changes." },
  { id: "failure-spike", evidence: ["The latest failure count is anomalous against measured history."], matches: ({ failureAnomaly }) => failureAnomaly.anomalous === true, measurements: ({ failureAnomaly }) => ({ currentFailures: failureAnomaly.current, baselineMedian: failureAnomaly.baselineMedian, medianAbsoluteDeviation: failureAnomaly.medianAbsoluteDeviation }), confidence: ({ failureAnomaly }) => failureAnomaly.confidence, alternatives: ["A larger scheduled cohort can increase absolute failures without reducing failure rate.", "A provider incident can affect several runs temporarily."], action: "Search failure events by class and code, then compare request volume before remediation.", impact: "Reduces repeated investigation and targets the dominant failure signature." },
  { id: "evidence-gap", evidence: ["Required operational evidence is incomplete."], matches: ({ completeness }) => completeness.score < 100, measurements: ({ completeness }) => ({ evidenceCompleteness: completeness.score, missingFields: completeness.missing.length }), confidence: () => "High", alternatives: ["A newly certified but not activated connector is expected to lack live evidence."], action: "Collect the missing approved evidence; do not infer the absent state.", impact: "Raises confidence without fabricating operational conclusions." },
  { id: "health-degradation", evidence: ["Connector health moved to a less trustworthy state."], matches: ({ latest, previous }) => Boolean(previous && healthRank(latest.health) < healthRank(previous.health)), measurements: ({ latest, previous }) => ({ previousHealth: previous?.health ?? null, currentHealth: latest.health }), confidence: ({ history }) => history.length >= 3 ? "Moderate" : "Low", alternatives: ["A stricter evidence requirement can lower health without an underlying provider failure."], action: "Compare freshness, replay, and failure-class evidence at the health transition.", impact: "Explains the state change before an operational response is selected." },
] as const;

const healthRank = (health: ConnectorOperationalHealth) => ({ Unknown: 0, Offline: 1, Degraded: 2, Warning: 3, Recovering: 4, Healthy: 5 })[health];

export function analyzeConnectorEngineeringIntelligence(history: readonly ConnectorOperationsSnapshot[]): EngineeringInsight {
  const ordered = [...history].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  if (!ordered.length) throw new Error("Engineering intelligence requires at least one operations snapshot");
  if (new Set(ordered.map((snapshot) => snapshot.providerId)).size !== 1) throw new Error("Engineering intelligence history must contain one provider");
  const latest = ordered.at(-1)!;
  const previous = ordered.at(-2);
  const trustPoints = ordered.flatMap((snapshot) => snapshot.operationalTrust.score === null ? [] : [{ measuredAt: snapshot.measuredAt, value: snapshot.operationalTrust.score }]);
  const freshnessPoints = ordered.flatMap((snapshot) => snapshot.freshness.cadenceRatio === null ? [] : [{ measuredAt: snapshot.measuredAt, value: snapshot.freshness.cadenceRatio }]);
  const failurePoints = ordered.map((snapshot) => ({ measuredAt: snapshot.measuredAt, value: totalFailures(snapshot) }));
  const failureAnomaly = detectEngineeringAnomaly(failurePoints);
  const completeness = measureEngineeringEvidence(latest);
  const failurePatterns = Object.keys(latest.failures).map((failureClass) => {
    const values = ordered.slice(0, -1).map((snapshot) => snapshot.failures[failureClass as ConnectorFailureClass]);
    const previousAverage = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const current = latest.failures[failureClass as ConnectorFailureClass];
    return { failureClass: failureClass as ConnectorFailureClass, current, previousAverage: round(previousAverage), increased: current > Math.max(1, previousAverage * 2) };
  }).filter((pattern) => pattern.current > 0 || pattern.previousAverage > 0);
  const recoveries = latest.operationalHistory.filter((event) => event.kind === "recovery").length;
  const failures = latest.operationalHistory.filter((event) => event.kind === "failure").length;
  const context: PatternContext = { latest, previous, history: ordered, completeness, failureAnomaly };
  const recommendations = knownOperationalPatterns.filter((pattern) => pattern.matches(context)).map((pattern): EngineeringRecommendation => ({ id: pattern.id, providerId: latest.providerId, observedEvidence: pattern.evidence, supportingMeasurements: pattern.measurements(context), confidence: pattern.confidence(context), alternativeExplanations: pattern.alternatives, recommendedAction: pattern.action, expectedOperationalImpact: pattern.impact, automation: "Advisory only" }));
  const unknownStates = completeness.missing.map((item) => `${item}: Unknown`);
  const operationalTrustDrivers = Object.entries(latest.operationalTrust.components).map(([component, current]) => {
    const prior = previous?.operationalTrust.components[component as keyof typeof latest.operationalTrust.components] ?? null;
    return { component, previous: prior, current, change: prior === null || current === null ? null : round(current - prior) };
  }).filter((driver) => driver.change !== 0);
  return {
    providerId: latest.providerId,
    measuredAt: latest.measuredAt,
    operationalTrustTrend: detectEngineeringTrend(trustPoints, { higherIsBetter: true }),
    freshnessTrend: detectEngineeringTrend(freshnessPoints, { higherIsBetter: false }),
    failureAnomaly,
    healthDrift: { from: previous?.health ?? null, to: latest.health, changed: previous ? previous.health !== latest.health : null, explanation: previous ? `Health changed from ${previous.health} to ${latest.health}.` : "No prior health snapshot is available." },
    replayDrift: { detected: latest.replay.replayConfidence === "Measured" ? latest.replay.canonicalDelta !== 0 || latest.replay.unexpectedClosures !== 0 : null, canonicalDelta: latest.replay.canonicalDelta, unexpectedClosures: latest.replay.unexpectedClosures, explanation: latest.replay.replayConfidence === "Measured" ? `Replay canonical delta is ${latest.replay.canonicalDelta}; unexpected closures are ${latest.replay.unexpectedClosures}.` : "Replay evidence is insufficient." },
    failurePatterns,
    recoveryPattern: { observedRecoveries: recoveries, unresolvedFailures: Math.max(0, failures - recoveries), explanation: `${recoveries} evidenced recoveries and ${Math.max(0, failures - recoveries)} unresolved failure events are present in the latest history.` },
    evidenceCompleteness: completeness,
    unknownStates,
    operationalConfidence: confidenceFrom(completeness.score, ordered.length),
    operationalTrustDrivers,
    recommendations,
  };
}

export type AtlasEngineeringAdvice = {
  providerId: string;
  summary: string;
  explanations: readonly string[];
  recommendations: readonly EngineeringRecommendation[];
  confidence: EngineeringConfidence;
  evidenceState: EngineeringEvidenceState;
};

export function adviseEngineeringOperations(insight: EngineeringInsight): AtlasEngineeringAdvice {
  const trustDrivers = insight.operationalTrustDrivers.length
    ? `Operational Trust drivers: ${insight.operationalTrustDrivers.map((driver) => `${driver.component} ${driver.previous ?? "Unknown"}→${driver.current ?? "Unknown"}`).join(", ")}.`
    : "Operational Trust drivers: no measured component change is available.";
  const explanations = [
    `Operational Trust trend: ${insight.operationalTrustTrend.direction}. ${insight.operationalTrustTrend.explanation}`,
    trustDrivers,
    `Health: ${insight.healthDrift.explanation}`,
    `Freshness trend: ${insight.freshnessTrend.direction}. ${insight.freshnessTrend.explanation}`,
    `Replay: ${insight.replayDrift.explanation}`,
    `Evidence completeness: ${insight.evidenceCompleteness.score}% (${insight.evidenceCompleteness.known}/${insight.evidenceCompleteness.required}).`,
  ];
  const unknown = insight.operationalConfidence === "Unknown";
  return { providerId: insight.providerId, summary: unknown ? "Operational understanding is incomplete." : insight.recommendations.length ? `${insight.recommendations.length} evidence-based investigation recommendation(s) require review.` : "No evidence-based degradation recommendation is active.", explanations, recommendations: insight.recommendations, confidence: insight.operationalConfidence, evidenceState: unknown ? "Unknown" : "Observed" };
}
