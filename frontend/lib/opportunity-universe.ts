import type { Opportunity, OpportunityStatus, OpportunityUniverseStage } from "@/types/opportunity";

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
  return [opportunity.companyName, opportunity.jobTitle, opportunity.country, opportunity.location]
    .map(normalizeIdentityPart)
    .join("|");
}

export type OpportunityDuplicateCluster = {
  key: string;
  canonical: Opportunity;
  observations: Opportunity[];
  sourceCount: number;
  requiresReview: boolean;
};

export function clusterDuplicateOpportunities(opportunities: Opportunity[]): OpportunityDuplicateCluster[] {
  const groups = new Map<string, Opportunity[]>();
  for (const opportunity of opportunities) {
    const key = opportunityDuplicateKey(opportunity);
    groups.set(key, [...(groups.get(key) ?? []), opportunity]);
  }
  return [...groups.entries()].map(([key, observations]) => {
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
