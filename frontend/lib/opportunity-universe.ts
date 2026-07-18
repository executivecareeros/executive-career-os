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
  const leftSources = left.sources ?? [];
  const rightSources = right.sources ?? [];
  if (leftSources.some((source) => rightSources.some((candidate) => source.id === candidate.id && source.originalId && source.originalId === candidate.originalId))) return true;
  const leftCanonicalUrl = normalizeCanonicalUrl(left.canonicalUrl ?? left.sourceUrl);
  const rightCanonicalUrl = normalizeCanonicalUrl(right.canonicalUrl ?? right.sourceUrl);
  if (leftCanonicalUrl && leftCanonicalUrl === rightCanonicalUrl) return true;
  const conflictingSameProviderIdentity = leftSources.some((source) => rightSources.some((candidate) => source.id === candidate.id && source.originalId && candidate.originalId && source.originalId !== candidate.originalId));
  if (conflictingSameProviderIdentity) return false;
  const leftCompanyKey = normalizeIdentityPart(left.companyProfile?.canonicalKey ?? left.companyId ?? "");
  const rightCompanyKey = normalizeIdentityPart(right.companyProfile?.canonicalKey ?? right.companyId ?? "");
  const companyNamesMatch = normalizeIdentityPart(left.companyName) === normalizeIdentityPart(right.companyName);
  const companyMatches = leftCompanyKey && rightCompanyKey
    ? leftCompanyKey === rightCompanyKey || companyNamesMatch
    : companyNamesMatch;
  if (!companyMatches || normalizeIdentityPart(left.jobTitle) !== normalizeIdentityPart(right.jobTitle)) return false;
  const leftLocation = normalizeIdentityPart(`${left.country}|${left.location}`);
  const rightLocation = normalizeIdentityPart(`${right.country}|${right.location}`);
  if (leftLocation === rightLocation) return true;
  return unspecified.has(normalizeIdentityPart(left.country)) || unspecified.has(normalizeIdentityPart(right.country));
}

function normalizeCanonicalUrl(value?: string) {
  if (!value) return "";
  try { const url = new URL(value); return `${url.hostname.toLowerCase().replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`; }
  catch { return ""; }
}

const atsPublishingHosts = new Set([
  "boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io",
  "jobs.lever.co", "jobs.eu.lever.co", "jobs.ashbyhq.com", "apply.workable.com",
]);

function isAtsPublishingUrl(value?: string) {
  if (!value) return false;
  try { return atsPublishingHosts.has(new URL(value.includes("://") ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, "")); }
  catch { return false; }
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
  const sources = [...new Map(combined.map(source => {
    const prior = existing.sources?.find(item => item.id === source.id && item.originalId === source.originalId);
    return [`${source.id}|${source.originalId ?? ""}`, { ...prior, ...source, firstSeenAt: prior?.firstSeenAt ?? source.firstSeenAt ?? source.collectedAt, lastSeenAt: observedAt, lastFetchedAt: observedAt, status: "Active" as const, fetchStatus: "Succeeded" as const }];
  })).values()];
  const evidenceRichness = (item: Opportunity) => {
    const generic = /^(employer not confirmed|not specified|linkedin opportunity \d+)$/i;
    return [item.companyName, item.jobTitle, item.location].filter((value) => value && !generic.test(value)).length * 1_000 + (item.summary?.length ?? 0);
  };
  const incomingIsStronger = incoming.confidenceScore > existing.confidenceScore || (incoming.confidenceScore === existing.confidenceScore && evidenceRichness(incoming) > evidenceRichness(existing));
  const strongest = incomingIsStronger ? incoming : existing;
  const compensation = incoming.salaryMin !== undefined || incoming.salaryMax !== undefined ? incoming : existing;
  const reactivated = existing.status === "Archived" && sources.length > 0;
  const mergedStatus = reactivated ? incoming.status : strongest.status;
  const freshness = assessOpportunityFreshness({ ...strongest, lastObservedAt: observedAt }, observedAt);
  const repairedCompanyProfile = incoming.companyProfile?.canonicalKey
    ? {
        ...existing.companyProfile,
        ...incoming.companyProfile,
        website: incoming.companyProfile.website ?? (isAtsPublishingUrl(existing.companyProfile?.website) ? undefined : existing.companyProfile?.website),
      }
    : strongest.companyProfile;
  const nextContentFingerprint = strongest.contentFingerprint ?? existing.contentFingerprint ?? incoming.contentFingerprint;
  const contentChanged = Boolean(existing.contentFingerprint && nextContentFingerprint && existing.contentFingerprint !== nextContentFingerprint);
  return {
    ...strongest,
    id: existing.id,
    externalIds: [...new Set([...(existing.externalIds ?? []), ...(incoming.externalIds ?? [])])],
    canonicalUrl: strongest.canonicalUrl ?? existing.canonicalUrl ?? incoming.canonicalUrl,
    employerDomain: incoming.employerDomain ?? (isAtsPublishingUrl(existing.employerDomain) ? undefined : strongest.employerDomain ?? existing.employerDomain),
    companyProfile: repairedCompanyProfile,
    visibility: "Private",
    verificationStatus: existing.verificationStatus === "Employer source matched" || incoming.verificationStatus === "Employer source matched" ? "Employer source matched" : existing.verificationStatus ?? incoming.verificationStatus,
    sources,
    source: sources.map(source => source.name).join(" · ") || strongest.source,
    sourceUrl: strongest.sourceUrl ?? existing.sourceUrl,
    salaryMin: compensation.salaryMin,
    salaryMax: compensation.salaryMax,
    salaryCurrency: compensation.salaryCurrency,
    salaryDisclosure: compensation.salaryDisclosure,
    contentFingerprint: nextContentFingerprint,
    atlasAnalyzedFingerprint: contentChanged ? existing.atlasAnalyzedFingerprint : existing.atlasAnalyzedFingerprint ?? strongest.atlasAnalyzedFingerprint,
    atlasAnalysisStatus: contentChanged ? "Pending" : existing.atlasAnalysisStatus ?? strongest.atlasAnalysisStatus,
    status: mergedStatus,
    closedAt: reactivated ? undefined : strongest.closedAt,
    closureReason: reactivated ? undefined : strongest.closureReason,
    discoveredAt: existing.discoveredAt < incoming.discoveredAt ? existing.discoveredAt : incoming.discoveredAt,
    lastObservedAt: observedAt,
    freshness,
    lifecycle: [
      ...(existing.lifecycle ?? []),
      { status: mergedStatus, occurredAt: observedAt, reason: reactivated ? "Active source observation restored" : sources.length > (existing.sources?.length ?? 0) ? "Additional source observation merged" : "Source observation refreshed", source: "System" },
    ],
  };
}

export function activeCanonicalOpportunities(opportunities: readonly Opportunity[]) {
  return opportunities.filter((opportunity) => opportunity.status !== "Archived" && opportunity.sources?.some((source) => source.status !== "Closed") !== false);
}

export function summarizeCanonicalInventory(opportunities: readonly Opportunity[], now = new Date().toISOString()) {
  const active = activeCanonicalOpportunities(opportunities);
  const day = now.slice(0, 10);
  return {
    rawSourceRecords: opportunities.reduce((total, item) => total + Math.max(1, item.sources?.length ?? 0), 0),
    activeSourceRecords: active.reduce((total, item) => total + Math.max(1, item.sources?.filter(source => source.status !== "Closed").length ?? 0), 0),
    activeCanonicalOpportunities: active.length,
    newToday: active.filter(item => item.discoveredAt.slice(0, 10) === day).length,
    updatedToday: active.filter(item => item.lastObservedAt?.slice(0, 10) === day).length,
    deactivatedToday: opportunities.filter(item => item.closedAt?.slice(0, 10) === day).length,
    staleOpportunities: active.filter(item => assessOpportunityFreshness(item, now).status === "Stale").length,
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
