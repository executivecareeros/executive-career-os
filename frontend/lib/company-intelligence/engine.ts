import type { CompanyAccessRole, CompanyHealth, CompanyMetric, DepartmentHealth, FounderAction, MetricFreshness, MetricObservation, MetricThreshold, OperationalAlert, SensitiveArea } from "./types.ts";

const healthWeight: Record<CompanyHealth, number> = {
  Critical: 6,
  "At Risk": 5,
  Watch: 4,
  Unknown: 3,
  "Not Connected": 2,
  Healthy: 1,
  "Not Applicable": 0,
};

const urgencyWeight: Record<FounderAction["urgency"], number> = { Immediate: 6, Today: 5, "This Week": 4, Monitor: 3, Future: 2, "No Action": 1 };
const importanceWeight: Record<FounderAction["importance"], number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export function calculateMetricStatus(value: number | undefined, threshold?: MetricThreshold): CompanyHealth {
  if (value === undefined) return "Unknown";
  if (!threshold) return "Unknown";
  const warningHit = threshold.warning !== undefined && (threshold.direction === "Above Is Worse" ? value >= threshold.warning : value <= threshold.warning);
  const criticalHit = threshold.critical !== undefined && (threshold.direction === "Above Is Worse" ? value >= threshold.critical : value <= threshold.critical);
  if (criticalHit) return "Critical";
  if (warningHit) return "Watch";
  return "Healthy";
}

export function calculateFreshness(measuredAt: string | undefined, now: Date, maximumAgeInHours: number | undefined, connectionState: "Connected" | "Partially Connected" | "Not Connected" | "Error" | "Not Applicable", frequency: MetricFreshness["expectedFrequency"]): MetricFreshness {
  if (connectionState === "Not Connected") return { state: "Not Connected", expectedFrequency: frequency, maximumAgeInHours };
  if (!measuredAt || maximumAgeInHours === undefined) return { state: "Unknown", measuredAt, expectedFrequency: frequency, maximumAgeInHours };
  const ageInHours = Math.max(0, (now.getTime() - new Date(measuredAt).getTime()) / 3_600_000);
  const state = ageInHours <= maximumAgeInHours ? "Current" : ageInHours <= maximumAgeInHours * 2 ? "Aging" : "Stale";
  return { state, measuredAt, expectedFrequency: frequency, ageInHours: Math.round(ageInHours * 10) / 10, maximumAgeInHours };
}

export function calculateDepartmentHealth(metrics: CompanyMetric[], connectionState: DepartmentHealth["connectionState"]): CompanyHealth {
  if (connectionState === "Not Connected" && metrics.length === 0) return "Not Connected";
  const meaningful = metrics.map((metric) => metric.observation.status).filter((status) => status !== "Not Applicable");
  if (meaningful.length === 0) return connectionState === "Not Connected" ? "Not Connected" : "Unknown";
  return meaningful.sort((a, b) => healthWeight[b] - healthWeight[a])[0];
}

export function rankFounderActions(actions: FounderAction[], now: Date): FounderAction[] {
  const dueWeight = (action: FounderAction) => {
    if (!action.dueDate) return 0;
    const hours = (new Date(action.dueDate).getTime() - now.getTime()) / 3_600_000;
    return hours < 0 ? 5 : hours <= 24 ? 4 : hours <= 168 ? 2 : 0;
  };
  return [...actions].sort((a, b) => {
    const aScore = urgencyWeight[a.urgency] * 10 + importanceWeight[a.importance] * 4 + dueWeight(a) + (a.status === "Blocked" ? 2 : 0);
    const bScore = urgencyWeight[b.urgency] * 10 + importanceWeight[b.importance] * 4 + dueWeight(b) + (b.status === "Blocked" ? 2 : 0);
    return bScore - aScore || a.title.localeCompare(b.title);
  });
}

export function suppressDuplicateAlerts(alerts: OperationalAlert[]): OperationalAlert[] {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    if (seen.has(alert.correlationId)) return false;
    seen.add(alert.correlationId);
    return true;
  });
}

export function canAccessArea(role: CompanyAccessRole, _area: SensitiveArea): boolean {
  return role === "Founder" && _area.length > 0;
}

export function unavailableObservation(metricId: string, source: MetricObservation["source"], owner: string, notes: string): MetricObservation {
  return {
    id: `${metricId}-unavailable`, metricId, status: source.connectionState === "Not Connected" ? "Not Connected" : "Unknown", direction: "Unknown", period: "Current",
    source, sourceReference: source.reference, freshness: { state: source.connectionState === "Not Connected" ? "Not Connected" : "Unknown", expectedFrequency: "Unknown" },
    confidence: "Very High", valueKind: "Unavailable", owner, notes, demoStatus: source.connectionState === "Not Connected" ? "Not Connected" : "Factual",
  };
}
