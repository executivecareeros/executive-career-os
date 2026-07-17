import type { Opportunity } from "@/types/opportunity";
import type { ProviderCertificationReport } from "./provider-certification.ts";
import type { ProviderManifest } from "./provider-manifest.ts";
import type {
  CoverageQueueItem,
  DiscoveryHealth,
  IngestionDisposition,
  OpportunityIngestionOutcome,
} from "./types.ts";

export const connectorOperationsVersion = "orion-operations-v1" as const;
export const connectorSdkVersion = "provider-sdk-v1" as const;

export const connectorHealthStates = ["Healthy", "Warning", "Degraded", "Recovering", "Offline", "Unknown"] as const;
export type ConnectorOperationalHealth = (typeof connectorHealthStates)[number];
export const failureClasses = ["Authentication", "Rate limiting", "Timeout", "Network", "API schema", "Mapping", "Lifecycle", "Certification", "Replay", "Unknown"] as const;
export type ConnectorFailureClass = (typeof failureClasses)[number];

export type ConnectorOperationalEventKind =
  | "discovery-started" | "discovery-completed" | "replay-started" | "replay-completed"
  | "retry" | "backoff" | "failure" | "recovery" | "certification"
  | "manifest-validation" | "scheduler-activity" | "inventory-update";

export type ConnectorOperationalEvent = {
  providerId: string;
  kind: ConnectorOperationalEventKind;
  occurredAt: string;
  runId?: string;
  status: "succeeded" | "failed" | "scheduled" | "observed";
  failureClass?: ConnectorFailureClass;
  code?: string;
  durationMs?: number;
  counts?: Readonly<Record<string, number>>;
};

export type ConnectorFreshness = {
  lastSuccessfulDiscovery: string | null;
  lastReplay: string | null;
  lastCertification: string | null;
  lastInventoryUpdate: string | null;
  averageRefreshIntervalMinutes: number | null;
  oldestOpportunity: string | null;
  newestOpportunity: string | null;
  freshnessConfidence: "Measured" | "Insufficient evidence";
  cadenceRatio: number | null;
};

export type ConnectorReplayDiagnostics = {
  durationMs: number | null;
  inventoryDifference: number | null;
  canonicalDelta: number | null;
  employerDelta: number | null;
  opportunityDelta: number | null;
  lifecycleChanges: number | null;
  unexpectedClosures: number | null;
  replayConfidence: "Measured" | "Insufficient evidence";
};

export type ConnectorSchedulerMetrics = {
  scheduledRuns: number;
  completedRuns: number;
  failedRuns: number;
  skippedRuns: number;
  averageDurationMs: number | null;
  longestDurationMs: number | null;
  queueDepth: number;
  backlog: number;
};

export type OperationalTrustScore = {
  version: typeof connectorOperationsVersion;
  score: number | null;
  method: "weakest-measured-control";
  components: {
    connectorHealth: number | null;
    replaySafety: number | null;
    certification: number | null;
    freshness: number | null;
    failureControl: number | null;
    recoverySuccess: number | null;
    determinism: number | null;
  };
  confidence: "Measured" | "Insufficient evidence";
};

export type ConnectorOperationsSnapshot = {
  version: typeof connectorOperationsVersion;
  providerId: string;
  measuredAt: string;
  health: ConnectorOperationalHealth;
  status: DiscoveryHealth["status"] | "unknown";
  manifestVersion: string;
  sdkVersion: typeof connectorSdkVersion;
  lifecycleMode: ProviderManifest["lifecycle"]["snapshot"];
  certificationStatus: "Passed" | "Not observed";
  freshness: ConnectorFreshness;
  replay: ConnectorReplayDiagnostics;
  discovery: { runs: number; recordsObserved: number; recordsChanged: number; recordsRejected: number };
  inventory: { canonicalOpportunities: number; providerObservations: number; activeOpportunities: number; archivedOpportunities: number };
  requests: { attempts: number; completed: number; failed: number; averageDurationMs: number | null };
  retries: { scheduled: number; exhausted: number; backoffs: number };
  failures: Readonly<Record<ConnectorFailureClass, number>>;
  scheduler: ConnectorSchedulerMetrics;
  operationalHistory: readonly ConnectorOperationalEvent[];
  operationalTrust: OperationalTrustScore;
};

export type ConnectorOperationsEvidence = {
  manifest: ProviderManifest;
  health?: DiscoveryHealth;
  certification?: ProviderCertificationReport & { certifiedAt?: string };
  runs?: readonly OpportunityIngestionOutcome[];
  queue?: readonly CoverageQueueItem[];
  inventory?: readonly Opportunity[];
  replayRunIds?: readonly string[];
  measuredAt: string;
};

const validTime = (value?: string | null) => value && !Number.isNaN(Date.parse(value)) ? value : null;
const latest = (values: readonly (string | null)[]) => values.filter((value): value is string => Boolean(value)).sort().at(-1) ?? null;
const average = (values: readonly number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
const percent = (numerator: number, denominator: number) => denominator ? Math.round(numerator / denominator * 1000) / 10 : null;

export function classifyOperationalFailure(code: string): ConnectorFailureClass {
  const value = code.toUpperCase();
  if (/AUTH|UNAUTHORIZED|FORBIDDEN|CREDENTIAL/.test(value)) return "Authentication";
  if (/RATE|429|THROTTL/.test(value)) return "Rate limiting";
  if (/TIMEOUT|ABORT/.test(value)) return "Timeout";
  if (/NETWORK|FETCH|DNS|CONNECTION/.test(value)) return "Network";
  if (/SCHEMA|BATCH|PAYLOAD|SOURCE_RECORD|INVALID_PROVIDER/.test(value)) return "API schema";
  if (/MAPPING|NORMALIZATION/.test(value)) return "Mapping";
  if (/LIFECYCLE|CLOSURE|DEACTIVAT/.test(value)) return "Lifecycle";
  if (/CERTIF/.test(value)) return "Certification";
  if (/REPLAY|IDEMPOT/.test(value)) return "Replay";
  return "Unknown";
}

function runEvents(providerId: string, runs: readonly OpportunityIngestionOutcome[], replayIds: Set<string>) {
  const events: ConnectorOperationalEvent[] = [];
  let unresolvedFailure = false;
  for (const outcome of runs) {
    const replay = replayIds.has(outcome.run.id);
    events.push({ providerId, kind: replay ? "replay-started" : "discovery-started", occurredAt: outcome.run.startedAt, runId: outcome.run.id, status: "observed" });
    const failed = outcome.run.status === "failed";
    events.push({
      providerId,
      kind: failed ? "failure" : replay ? "replay-completed" : "discovery-completed",
      occurredAt: outcome.run.finishedAt ?? outcome.run.startedAt,
      runId: outcome.run.id,
      status: failed ? "failed" : "succeeded",
      failureClass: failed ? classifyOperationalFailure(outcome.run.errors[0]?.code ?? "UNKNOWN") : undefined,
      code: failed ? outcome.run.errors[0]?.code : undefined,
      durationMs: outcome.run.durationMs,
      counts: { observed: outcome.run.jobsFound, changed: outcome.run.jobsImported, ignored: outcome.run.jobsIgnored },
    });
    if (outcome.nextRetryAt) {
      events.push({ providerId, kind: "retry", occurredAt: outcome.run.finishedAt ?? outcome.run.startedAt, runId: outcome.run.id, status: "scheduled" });
      events.push({ providerId, kind: "backoff", occurredAt: outcome.nextRetryAt, runId: outcome.run.id, status: "scheduled" });
    }
    if (failed) unresolvedFailure = true;
    else if (unresolvedFailure) {
      events.push({ providerId, kind: "recovery", occurredAt: outcome.run.finishedAt ?? outcome.run.startedAt, runId: outcome.run.id, status: "succeeded" });
      unresolvedFailure = false;
    }
  }
  return events;
}

function dispositionCount(outcome: OpportunityIngestionOutcome | undefined, disposition: IngestionDisposition) {
  return outcome?.items.filter((item) => item.disposition === disposition).length ?? 0;
}

function deriveReplay(runs: readonly OpportunityIngestionOutcome[], replayIds: Set<string>, lifecycleMode: ProviderManifest["lifecycle"]["snapshot"]): ConnectorReplayDiagnostics {
  const replayIndex = runs.findLastIndex((outcome) => replayIds.has(outcome.run.id));
  const replay = replayIndex >= 0 ? runs[replayIndex] : undefined;
  const previous = replayIndex > 0 ? runs[replayIndex - 1] : undefined;
  if (!replay || !previous) return { durationMs: null, inventoryDifference: null, canonicalDelta: null, employerDelta: null, opportunityDelta: null, lifecycleChanges: null, unexpectedClosures: null, replayConfidence: "Insufficient evidence" };
  const canonicalDelta = dispositionCount(replay, "inserted") + dispositionCount(replay, "updated") - dispositionCount(replay, "deactivated");
  const lifecycleChanges = dispositionCount(replay, "deactivated");
  const unexpectedClosures = lifecycleMode === "incremental" ? lifecycleChanges : 0;
  return {
    durationMs: replay.run.durationMs ?? null,
    inventoryDifference: replay.run.jobsFound - previous.run.jobsFound,
    canonicalDelta,
    employerDelta: null,
    opportunityDelta: canonicalDelta,
    lifecycleChanges,
    unexpectedClosures,
    replayConfidence: "Measured",
  };
}

function deriveFreshness(evidence: ConnectorOperationsEvidence, successful: readonly OpportunityIngestionOutcome[], replayIds: Set<string>): ConnectorFreshness {
  const inventoryTimes = (evidence.inventory ?? []).map((item) => validTime(item.lastObservedAt) ?? validTime(item.discoveredAt));
  const successTimes = successful.map((outcome) => validTime(outcome.run.finishedAt)).filter((value): value is string => Boolean(value)).sort();
  const intervals = successTimes.slice(1).map((value, index) => (Date.parse(value) - Date.parse(successTimes[index])) / 60_000).filter((value) => value >= 0);
  const lastSuccessfulDiscovery = latest(successTimes);
  const cadence = evidence.manifest.scheduler.defaultCadenceMinutes;
  const elapsedMinutes = lastSuccessfulDiscovery ? (Date.parse(evidence.measuredAt) - Date.parse(lastSuccessfulDiscovery)) / 60_000 : null;
  const cadenceRatio = elapsedMinutes !== null && elapsedMinutes >= 0 ? Math.round((elapsedMinutes / cadence) * 100) / 100 : null;
  return {
    lastSuccessfulDiscovery,
    lastReplay: latest(successful.filter((outcome) => replayIds.has(outcome.run.id)).map((outcome) => validTime(outcome.run.finishedAt))),
    lastCertification: validTime(evidence.certification?.certifiedAt) ?? null,
    lastInventoryUpdate: latest(inventoryTimes),
    averageRefreshIntervalMinutes: average(intervals),
    oldestOpportunity: inventoryTimes.filter((value): value is string => Boolean(value)).sort().at(0) ?? null,
    newestOpportunity: latest(inventoryTimes),
    freshnessConfidence: lastSuccessfulDiscovery ? "Measured" : "Insufficient evidence",
    cadenceRatio,
  };
}

function deriveHealth(input: { health?: DiscoveryHealth; certification: boolean; successful: readonly OpportunityIngestionOutcome[]; failed: readonly OpportunityIngestionOutcome[]; freshness: ConnectorFreshness; replay: ConnectorReplayDiagnostics }): ConnectorOperationalHealth {
  if (!input.health && !input.successful.length && !input.failed.length) return "Unknown";
  if (input.health?.status === "unavailable" || input.health?.status === "disabled") return "Offline";
  const lastSuccess = latest(input.successful.map((item) => validTime(item.run.finishedAt)));
  const lastFailure = latest(input.failed.map((item) => validTime(item.run.finishedAt)));
  if (lastFailure && lastSuccess && lastSuccess > lastFailure) return "Recovering";
  if (lastFailure || (input.replay.unexpectedClosures ?? 0) > 0) return "Degraded";
  if (!input.certification || input.freshness.cadenceRatio === null || input.freshness.cadenceRatio > 1.5) return "Warning";
  if (["available", "connected"].includes(input.health?.status ?? "") && input.successful.length) return "Healthy";
  return "Unknown";
}

function trustScore(input: { health: ConnectorOperationalHealth; certification: boolean; freshness: ConnectorFreshness; replay: ConnectorReplayDiagnostics; runs: readonly OpportunityIngestionOutcome[] }): OperationalTrustScore {
  const successful = input.runs.filter((outcome) => outcome.run.status !== "failed").length;
  const failed = input.runs.length - successful;
  const recoveredFailures = input.runs.filter((outcome, index) => outcome.run.status === "failed" && input.runs.slice(index + 1).some((laterRun) => laterRun.run.status !== "failed")).length;
  const healthValues: Record<ConnectorOperationalHealth, number | null> = { Healthy: 100, Warning: 75, Degraded: 50, Recovering: 75, Offline: 0, Unknown: null };
  const components = {
    connectorHealth: healthValues[input.health],
    replaySafety: input.replay.replayConfidence === "Measured" ? (input.replay.unexpectedClosures === 0 ? 100 : 0) : null,
    certification: input.certification ? 100 : null,
    freshness: input.freshness.cadenceRatio === null ? null : input.freshness.cadenceRatio <= 1 ? 100 : input.freshness.cadenceRatio <= 1.5 ? 75 : 0,
    failureControl: percent(successful, input.runs.length),
    recoverySuccess: failed ? percent(recoveredFailures, failed) : input.runs.length ? 100 : null,
    determinism: input.replay.replayConfidence === "Measured" ? (input.replay.canonicalDelta === 0 ? 100 : 0) : null,
  };
  const measured = Object.values(components).filter((value): value is number => value !== null);
  const complete = measured.length === Object.keys(components).length;
  return { version: connectorOperationsVersion, score: complete ? Math.min(...measured) : null, method: "weakest-measured-control", components, confidence: complete ? "Measured" : "Insufficient evidence" };
}

export function buildConnectorOperationsSnapshot(evidence: ConnectorOperationsEvidence): ConnectorOperationsSnapshot {
  const runs = [...(evidence.runs ?? [])].sort((a, b) => a.run.startedAt.localeCompare(b.run.startedAt));
  const queue = evidence.queue ?? [];
  const inventory = evidence.inventory ?? [];
  const replayIds = new Set(evidence.replayRunIds ?? []);
  const successful = runs.filter((outcome) => outcome.run.status !== "failed");
  const failed = runs.filter((outcome) => outcome.run.status === "failed");
  const replay = deriveReplay(runs, replayIds, evidence.manifest.lifecycle.snapshot);
  const freshness = deriveFreshness(evidence, successful, replayIds);
  const certified = evidence.certification?.checks.deploymentReadiness === "passed";
  const health = deriveHealth({ health: evidence.health, certification: certified, successful, failed, freshness, replay });
  const events = runEvents(evidence.manifest.identity.id, runs, replayIds);
  events.push({ providerId: evidence.manifest.identity.id, kind: "manifest-validation", occurredAt: evidence.measuredAt, status: "succeeded" });
  if (certified) events.push({ providerId: evidence.manifest.identity.id, kind: "certification", occurredAt: evidence.certification?.certifiedAt ?? evidence.measuredAt, status: "succeeded", durationMs: evidence.certification?.durationMs });
  if (freshness.lastInventoryUpdate) events.push({ providerId: evidence.manifest.identity.id, kind: "inventory-update", occurredAt: freshness.lastInventoryUpdate, status: "observed", counts: { canonicalOpportunities: inventory.length } });
  for (const item of queue) events.push({ providerId: evidence.manifest.identity.id, kind: "scheduler-activity", occurredAt: item.requestedAt, runId: item.id, status: item.status === "failed" ? "failed" : item.status === "completed" ? "succeeded" : "scheduled" });
  const failureCounts = Object.fromEntries(failureClasses.map((kind) => [kind, 0])) as Record<ConnectorFailureClass, number>;
  for (const outcome of failed) for (const error of outcome.run.errors) failureCounts[classifyOperationalFailure(error.code)] += 1;
  const durations = runs.map((outcome) => outcome.run.durationMs).filter((value): value is number => value !== undefined);
  const completedQueue = queue.filter((item) => item.status === "completed").length;
  const failedQueue = queue.filter((item) => item.status === "failed").length;
  const retries = queue.filter((item) => item.status === "retrying" || item.attempt > 1).length;
  const status: ConnectorOperationsSnapshot["status"] = evidence.health?.status ?? "unknown";
  const snapshot: ConnectorOperationsSnapshot = {
    version: connectorOperationsVersion,
    providerId: evidence.manifest.identity.id,
    measuredAt: evidence.measuredAt,
    health,
    status,
    manifestVersion: evidence.manifest.version,
    sdkVersion: connectorSdkVersion,
    lifecycleMode: evidence.manifest.lifecycle.snapshot,
    certificationStatus: certified ? "Passed" as const : "Not observed" as const,
    freshness,
    replay,
    discovery: { runs: runs.length, recordsObserved: runs.reduce((sum, outcome) => sum + outcome.run.jobsFound, 0), recordsChanged: runs.reduce((sum, outcome) => sum + outcome.run.jobsImported, 0), recordsRejected: runs.reduce((sum, outcome) => sum + outcome.items.filter((item) => item.disposition === "rejected").length, 0) },
    inventory: { canonicalOpportunities: inventory.length, providerObservations: inventory.reduce((sum, item) => sum + (item.sources?.filter((source) => source.id === evidence.manifest.identity.id).length ?? 0), 0), activeOpportunities: inventory.filter((item) => item.status !== "Archived").length, archivedOpportunities: inventory.filter((item) => item.status === "Archived").length },
    requests: { attempts: runs.length, completed: successful.length, failed: failed.length, averageDurationMs: average(durations) },
    retries: { scheduled: retries, exhausted: queue.filter((item) => item.status === "failed" && item.attempt >= item.maximumAttempts).length, backoffs: runs.filter((outcome) => Boolean(outcome.nextRetryAt)).length },
    failures: failureCounts,
    scheduler: { scheduledRuns: queue.length, completedRuns: completedQueue, failedRuns: failedQueue, skippedRuns: queue.filter((item) => item.status === "cancelled").length, averageDurationMs: average(durations), longestDurationMs: durations.length ? Math.max(...durations) : null, queueDepth: queue.filter((item) => ["queued", "retrying", "running"].includes(item.status)).length, backlog: queue.filter((item) => ["queued", "retrying"].includes(item.status) && item.availableAt <= evidence.measuredAt).length },
    operationalHistory: events.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.kind.localeCompare(b.kind)),
    operationalTrust: {} as OperationalTrustScore,
  };
  snapshot.operationalTrust = trustScore({ health, certification: certified, freshness, replay, runs });
  return snapshot;
}

export function searchOperationalFailures(events: readonly ConnectorOperationalEvent[], query: { providerId?: string; failureClass?: ConnectorFailureClass; code?: string }) {
  return events.filter((event) => event.kind === "failure"
    && (!query.providerId || event.providerId === query.providerId)
    && (!query.failureClass || event.failureClass === query.failureClass)
    && (!query.code || event.code === query.code));
}
