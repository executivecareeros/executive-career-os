import type { Opportunity, OpportunityFreshness, OpportunityStatus, OpportunityUniverseStage } from "@/types/opportunity";

export const opportunityLifecycleTransitions: Record<OpportunityStatus, readonly OpportunityStatus[]> = {
  Discovered: ["Evaluating", "Archived"],
  Evaluating: ["Qualified", "Rejected", "Archived"],
  Qualified: ["Ready to Apply", "Rejected", "Archived"],
  "Ready to Apply": ["Applied", "Rejected", "Archived"],
  Applied: ["Interview", "Rejected", "Archived"],
  Interview: ["Rejected", "Archived"],
  Rejected: ["Archived"],
  Archived: [],
};

export function canTransitionOpportunity(from: OpportunityStatus, to: OpportunityStatus) {
  return opportunityLifecycleTransitions[from].includes(to);
}

export function resolveUniverseStage(opportunity: Opportunity): OpportunityUniverseStage {
  if (opportunity.universeStage) return opportunity.universeStage;
  if (
    opportunity.overallScore >= 80 &&
    opportunity.confidenceScore >= 65 &&
    opportunity.exclusions.length === 0
  ) return "Recommended";
  if (
    ["Qualified", "Ready to Apply", "Applied", "Interview"].includes(opportunity.status) ||
    (opportunity.overallScore >= 70 && opportunity.confidenceScore >= 55)
  ) return "Qualified";
  return "Universe";
}

export function isInUniverseStage(opportunity: Opportunity, stage: OpportunityUniverseStage) {
  const resolved = resolveUniverseStage(opportunity);
  if (stage === "Universe") return true;
  if (stage === "Qualified") return resolved === "Qualified" || resolved === "Recommended";
  return resolved === "Recommended";
}

export function normalizeIdentityPart(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

export function opportunityDuplicateKey(opportunity: Opportunity) {
  const companyIdentity = opportunity.companyProfile?.canonicalKey || opportunity.companyId || opportunity.companyName;
  return [companyIdentity, opportunity.jobTitle, opportunity.country, opportunity.location]
    .map(normalizeIdentityPart)
    .join("|");
}

const unspecified = new Set(["", "not specified", "unknown"]);

/** Conservative cross-provider identity match. Uncertain records remain separate for review instead of being falsely merged. */
export function isCanonicalOpportunityMatch(left: Opportunity, right: Opportunity) {
  const leftCompanyKey = normalizeIdentityPart(left.companyProfile?.canonicalKey ?? left.companyId ?? "");
  const rightCompanyKey = normalizeIdentityPart(right.companyProfile?.canonicalKey ?? right.companyId ?? "");
  const companyMatches = leftCompanyKey && rightCompanyKey
    ? leftCompanyKey === rightCompanyKey
    : normalizeIdentityPart(left.companyName) === normalizeIdentityPart(right.companyName);
  if (!companyMatches || normalizeIdentityPart(left.jobTitle) !== normalizeIdentityPart(right.jobTitle)) return false;
  const leftLocation = normalizeIdentityPart(`${left.country}|${left.location}`);
  const rightLocation = normalizeIdentityPart(`${right.country}|${right.location}`);
  if (leftLocation === rightLocation) return true;
  return unspecified.has(normalizeIdentityPart(left.country)) || unspecified.has(normalizeIdentityPart(right.country));
}

export function findCanonicalOpportunityIndex(opportunities: readonly Opportunity[], candidate: Opportunity) {
  return opportunities.findIndex((opportunity) => isCanonicalOpportunityMatch(opportunity, candidate));
}

export function assessOpportunityFreshness(opportunity: Opportunity, now = new Date().toISOString()): OpportunityFreshness {
  const lastObservedAt = opportunity.lastObservedAt ?? opportunity.discoveredAt;
  const observed = Date.parse(lastObservedAt);
  const current = Date.parse(now);
  const staleAfterHours = opportunity.freshness?.staleAfterHours ?? 72;
  if (!Number.isFinite(observed) || !Number.isFinite(current)) return { status: "Unknown", staleAfterHours };
  const ageHours = Math.max(0, Math.round((current - observed) / 3_600_000));
  const status = ageHours <= 12 ? "Fresh" : ageHours < staleAfterHours ? "Recent" : "Stale";
  return { ...opportunity.freshness, status, lastObservedAt, ageHours, staleAfterHours };
}

export function mergeOpportunityObservations(existing: Opportunity, incoming: Opportunity, observedAt: string): Opportunity {
  const combined = [...(existing.sources ?? []), ...(incoming.sources ?? [])];
  const sources = [...new Map(combined.map(source => [`${source.id}|${source.originalId ?? ""}`, source])).values()];
  const incomingIsStronger = incoming.confidenceScore > existing.confidenceScore;
  const strongest = incomingIsStronger ? incoming : existing;
  const freshness = assessOpportunityFreshness({ ...strongest, lastObservedAt: observedAt }, observedAt);
  return {
    ...strongest,
    id: existing.id,
    sources,
    source: sources.map(source => source.name).join(" · ") || strongest.source,
    sourceUrl: strongest.sourceUrl ?? existing.sourceUrl,
    discoveredAt: existing.discoveredAt < incoming.discoveredAt ? existing.discoveredAt : incoming.discoveredAt,
    lastObservedAt: observedAt,
    freshness,
    lifecycle: [
      ...(existing.lifecycle ?? []),
      { status: existing.status, occurredAt: observedAt, reason: sources.length > (existing.sources?.length ?? 0) ? "Additional source observation merged" : "Source observation refreshed", source: "System" },
    ],
  };
}

export type OpportunityDuplicateCluster = {
  key: string;
  canonical: Opportunity;
  observations: Opportunity[];
  sourceCount: number;
  requiresReview: boolean;
};

export function clusterDuplicateOpportunities(opportunities: Opportunity[]): OpportunityDuplicateCluster[] {
  const groups: Array<{ key: string; observations: Opportunity[] }> = [];
  for (const opportunity of opportunities) {
    const group = groups.find((candidate) => isCanonicalOpportunityMatch(candidate.observations[0], opportunity));
    if (group) group.observations.push(opportunity);
    else groups.push({ key: opportunityDuplicateKey(opportunity), observations: [opportunity] });
  }
  return groups.map(({ key, observations }) => {
    const canonical = [...observations].sort((a, b) => {
      if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
      return b.discoveredAt.localeCompare(a.discoveredAt);
    })[0];
    const sourceCount = new Set(observations.flatMap((item) => item.sources?.map((source) => source.id) ?? [item.source])).size;
    return { key, canonical, observations, sourceCount, requiresReview: observations.length > 1 && sourceCount > 1 };
  });
}

export function summarizeOpportunityUniverse(opportunities: Opportunity[]) {
  const stages = {
    Universe: opportunities.length,
    Qualified: opportunities.filter((item) => isInUniverseStage(item, "Qualified")).length,
    Recommended: opportunities.filter((item) => isInUniverseStage(item, "Recommended")).length,
  } satisfies Record<OpportunityUniverseStage, number>;
  return {
    total: opportunities.length,
    stages,
    sourceCount: new Set(opportunities.flatMap((item) => item.sources?.map((source) => source.id) ?? [item.source])).size,
    duplicateClusters: clusterDuplicateOpportunities(opportunities).filter((cluster) => cluster.observations.length > 1).length,
  };
}
