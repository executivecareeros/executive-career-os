import { assessOpportunityFreshness } from "./opportunity-universe.ts";
import type { Opportunity, OpportunityLifecycleEvent, OpportunitySource } from "@/types/opportunity";
import { assessOpportunityConfidence, unknownGeographicProfile, type ExecutiveCareerContext, type ExecutiveGeographicProfile, type OpportunityConfidenceResult } from "./opportunity-geography.ts";

export type IntelligenceCertainty = "Confirmed" | "Estimated" | "Unknown";
export type OpportunityIntelligenceEvidence = { label: string; value: string; certainty: IntelligenceCertainty; source: string };
export type OpportunityRelation = { opportunityId: string; companyName: string; jobTitle: string; score: number; basis: string[] };
export type OpportunityIntelligenceBlueprint = {
  revisionId?: string;
  preferredIndustries: string[];
  preferredCountries: string[];
  minimumCompensation?: number;
  currency?: string;
  maximumTravelPercent?: number;
  leadershipLevel?: string;
  constraints: string[];
};
export type ExecutiveOpportunityIntelligence = {
  opportunityId: string;
  blueprintCompatibilityScore?: number;
  blueprintComparisons: number;
  atlasConfidence: { score: number; level: "Low" | "Moderate" | "High" | "Very High"; explanation: string };
  recommendation: "Prioritize" | "Research" | "Monitor" | "Deprioritize";
  guidance: string;
  evidence: OpportunityIntelligenceEvidence[];
  strengths: string[];
  concerns: string[];
  missingInformation: string[];
  provenance: OpportunitySource[];
  freshness: ReturnType<typeof assessOpportunityFreshness>;
  history: OpportunityLifecycleEvent[];
  relatedOpportunities: OpportunityRelation[];
  similarCompanies: string[];
  similarRoles: string[];
  opportunityConfidence: OpportunityConfidenceResult;
};

const known = (value?: string) => Boolean(value && !["unknown", "not specified", "not assessed", "awaiting assessment."].includes(value.trim().toLowerCase()));
const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
const same = (left: string, right: string) => normalize(left) === normalize(right);
const titleTokens = (value: string) => new Set(normalize(value).split(" ").filter((token) => token.length > 2 && !["and", "the", "global", "senior"].includes(token)));
const overlap = (left: Set<string>, right: Set<string>) => {
  const union = new Set([...left, ...right]);
  return union.size ? [...left].filter((token) => right.has(token)).length / union.size : 0;
};
const list = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const text = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;

export function opportunityIntelligenceBlueprint(payload?: Record<string, unknown>, revisionId?: string): OpportunityIntelligenceBlueprint {
  return {
    revisionId,
    preferredIndustries: list(payload?.preferredIndustries),
    preferredCountries: list(payload?.preferredCountries),
    minimumCompensation: number(payload?.minimumCompensation),
    currency: text(payload?.currency),
    maximumTravelPercent: number(payload?.maximumTravelPercent),
    leadershipLevel: text(payload?.leadershipLevel),
    constraints: list(payload?.constraints),
  };
}

function sourceEvidence(opportunity: Opportunity): OpportunitySource[] {
  if (!opportunity.sources?.length) return [{ id: opportunity.source, name: opportunity.source, kind: "Employer", originalUrl: opportunity.sourceUrl, collectedAt: opportunity.lastObservedAt ?? opportunity.discoveredAt, confidence: opportunity.confidenceScore >= 75 ? "High" : opportunity.confidenceScore >= 50 ? "Medium" : "Low" }];
  const byProvider = new Map<string, OpportunitySource>();
  for (const source of opportunity.sources) {
    const key = `${source.id}|${source.name.trim().toLowerCase()}`;
    const prior = byProvider.get(key);
    if (!prior || (source.lastSeenAt ?? source.collectedAt) > (prior.lastSeenAt ?? prior.collectedAt)) byProvider.set(key, source);
  }
  return [...byProvider.values()];
}

function relation(candidate: Opportunity, current: Opportunity): OpportunityRelation | undefined {
  if (candidate.id === current.id) return undefined;
  const basis: string[] = [];
  let score = 0;
  if (known(current.industry) && known(candidate.industry) && same(current.industry, candidate.industry)) { score += 30; basis.push("same industry"); }
  if (known(current.country) && known(candidate.country) && same(current.country, candidate.country)) { score += 20; basis.push("same country"); }
  if (current.workArrangement !== "Unknown" && current.workArrangement === candidate.workArrangement) { score += 10; basis.push("same work model"); }
  const roleOverlap = overlap(titleTokens(current.jobTitle), titleTokens(candidate.jobTitle));
  if (roleOverlap > 0) { score += Math.round(roleOverlap * 40); basis.push("related role language"); }
  return score ? { opportunityId: candidate.id, companyName: candidate.companyName, jobTitle: candidate.jobTitle, score: Math.min(100, score), basis } : undefined;
}

export function buildExecutiveOpportunityIntelligence(opportunity: Opportunity, blueprint: OpportunityIntelligenceBlueprint, universe: readonly Opportunity[], now = new Date().toISOString(), geographicProfile: ExecutiveGeographicProfile = unknownGeographicProfile(), careerContext?: ExecutiveCareerContext): ExecutiveOpportunityIntelligence {
  const strengths: string[] = [];
  const concerns: string[] = [];
  const missingInformation: string[] = [];
  const evidence: OpportunityIntelligenceEvidence[] = [];
  const scores: number[] = [];
  const provenance = sourceEvidence(opportunity);
  const opportunityConfidence = assessOpportunityConfidence(opportunity, geographicProfile, careerContext);
  const confirmedSource = provenance.length === 1 ? provenance[0].name : `${provenance.length} source observations`;
  const observationCertainty: IntelligenceCertainty = opportunity.verificationStatus === "Unverified LinkedIn observation" ? "Estimated" : "Confirmed";

  evidence.push({ label: "Role", value: opportunity.jobTitle, certainty: observationCertainty, source: confirmedSource });
  evidence.push({ label: "Company", value: opportunity.companyName, certainty: observationCertainty, source: confirmedSource });
  if (known(opportunity.location)) evidence.push({ label: "Location", value: opportunity.location, certainty: observationCertainty, source: confirmedSource }); else missingInformation.push("Role location");
  if (opportunity.verificationStatus === "Unverified LinkedIn observation") missingInformation.push("Employer-controlled source confirming this LinkedIn observation");
  if (opportunity.workArrangement !== "Unknown") evidence.push({ label: "Work model", value: opportunity.workArrangement, certainty: "Confirmed", source: confirmedSource }); else missingInformation.push("Remote, hybrid, or on-site expectation");
  if (opportunity.salaryMin !== undefined || opportunity.salaryMax !== undefined) evidence.push({ label: "Published compensation", value: `${opportunity.salaryCurrency ?? "Currency unknown"} ${opportunity.salaryMin ?? "?"}–${opportunity.salaryMax ?? "?"}`, certainty: "Confirmed", source: confirmedSource }); else missingInformation.push("Comparable compensation");
  if (!known(opportunity.travelRequirement)) missingInformation.push("Travel requirement");
  if (!known(opportunity.industry)) missingInformation.push("Company industry");
  if (!known(opportunity.companySize)) missingInformation.push("Company scale");

  if (blueprint.preferredIndustries.length && known(opportunity.industry)) {
    const match = blueprint.preferredIndustries.some((item) => same(item, opportunity.industry));
    scores.push(match ? 100 : 20);
    (match ? strengths : concerns).push(match ? `${opportunity.industry} matches a preferred industry` : `${opportunity.industry} is outside the currently preferred industries`);
  }
  if (blueprint.preferredCountries.length && known(opportunity.country)) {
    const match = blueprint.preferredCountries.some((item) => same(item, opportunity.country));
    scores.push(match ? 100 : 20);
    (match ? strengths : concerns).push(match ? `${opportunity.country} matches a preferred country` : `${opportunity.country} is outside the currently preferred countries`);
  }
  if (blueprint.minimumCompensation !== undefined && opportunity.salaryMin !== undefined) {
    if (blueprint.currency && opportunity.salaryCurrency && !same(blueprint.currency, opportunity.salaryCurrency)) {
      missingInformation.push(`Compensation comparison requires a verified ${opportunity.salaryCurrency}/${blueprint.currency} conversion`);
    } else {
      const match = opportunity.salaryMin >= blueprint.minimumCompensation;
      scores.push(match ? 100 : Math.max(0, Math.round(opportunity.salaryMin / blueprint.minimumCompensation * 100)));
      (match ? strengths : concerns).push(match ? "Published minimum compensation meets the Blueprint threshold" : "Published minimum compensation is below the Blueprint threshold");
    }
  }
  if (blueprint.leadershipLevel) {
    const match = normalize(opportunity.jobTitle).includes(normalize(blueprint.leadershipLevel));
    evidence.push({ label: "Leadership-level comparison", value: match ? `Role title contains “${blueprint.leadershipLevel}”` : `Role title does not confirm “${blueprint.leadershipLevel}”`, certainty: "Estimated", source: blueprint.revisionId ? "Active Blueprint and published role title" : "Published role title" });
  }
  if (!blueprint.revisionId) missingInformation.push("Active Executive Blueprint for a personal fit comparison");
  if (opportunityConfidence.eligibility === "Eligible" || opportunityConfidence.eligibility === "Probably Eligible") strengths.push(opportunityConfidence.explanation);
  else if (opportunityConfidence.eligibility === "Not Currently Eligible" || opportunityConfidence.eligibility === "Sponsorship Required" || opportunityConfidence.eligibility === "Relocation Required") concerns.push(opportunityConfidence.explanation);
  missingInformation.push(...opportunityConfidence.missingInformation);

  const blueprintCompatibilityScore = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : undefined;
  if (blueprintCompatibilityScore !== undefined) evidence.push({ label: "Blueprint compatibility", value: `${blueprintCompatibilityScore}% across ${scores.length} comparable dimension${scores.length === 1 ? "" : "s"}`, certainty: "Estimated", source: "Deterministic comparison with active Blueprint" });
  const completenessFields = [opportunity.location, opportunity.country, opportunity.industry, opportunity.companySize, opportunity.workArrangement !== "Unknown" ? opportunity.workArrangement : "", opportunity.salaryMin !== undefined ? "salary" : "", opportunity.summary].filter((value) => known(String(value))).length;
  const sourceConfidence = provenance.reduce((total, source) => total + ({ High: 90, Medium: 65, Low: 35, Unknown: 20 }[source.confidence]), 0) / provenance.length;
  const comparisonCoverage = Math.min(100, scores.length * 25);
  const confidenceScore = Math.round(sourceConfidence * .5 + completenessFields / 7 * 100 * .3 + comparisonCoverage * .2);
  const confidenceLevel = confidenceScore >= 80 ? "Very High" : confidenceScore >= 65 ? "High" : confidenceScore >= 45 ? "Moderate" : "Low";
  const blockedByEligibility = opportunityConfidence.eligibility === "Not Currently Eligible";
  const recommendation = blockedByEligibility || concerns.some((item) => item.includes("below") || item.includes("outside")) ? "Deprioritize" : opportunityConfidence.opportunityConfidence >= 75 && confidenceScore >= 65 ? "Prioritize" : missingInformation.length > 2 ? "Research" : "Monitor";
  const guidance = blockedByEligibility ? "Do not prioritize this role unless your work authorization or the employer's eligibility terms change." : recommendation === "Prioritize" ? "Review the open questions, then decide whether to pursue this opportunity." : recommendation === "Deprioritize" ? "Resolve the identified Blueprint or eligibility conflicts before investing further time." : recommendation === "Research" ? "Confirm the missing decision-critical information before choosing Pursue, Watch, or Skip." : "Keep this opportunity under review while gathering the remaining evidence.";
  evidence.push({ label: "Geographic eligibility", value: `${opportunityConfidence.eligibility}: ${opportunityConfidence.explanation}`, certainty: opportunityConfidence.eligibility === "Eligibility Unknown" ? "Unknown" : "Estimated", source: "Shared Opportunity Confidence Engine" });
  evidence.push({ label: "Opportunity confidence", value: `${opportunityConfidence.opportunityConfidence}% · ${opportunityConfidence.label}`, certainty: "Estimated", source: "Shared Opportunity Confidence Engine" });
  evidence.push({ label: "Professional fit", value: `${opportunityConfidence.professionalFit}% · ${opportunityConfidence.professionalExplanation}`, certainty: "Estimated", source: "Confirmed career-title evidence" });
  evidence.push({ label: "Atlas confidence", value: `${confidenceLevel} · ${confidenceScore}%`, certainty: "Estimated", source: "Source confidence, record completeness, and comparable Blueprint dimensions" });
  for (const item of missingInformation) evidence.push({ label: item, value: "Not established by current evidence", certainty: "Unknown", source: "No supporting canonical evidence" });

  const relatedOpportunities = universe.map((candidate) => relation(candidate, opportunity)).filter((item): item is OpportunityRelation => Boolean(item)).sort((left, right) => right.score - left.score).slice(0, 3);
  const similarCompanies = [...new Set(relatedOpportunities.filter((item) => item.companyName !== opportunity.companyName).map((item) => item.companyName))].slice(0, 3);
  const similarRoles = [...new Set(relatedOpportunities.filter((item) => item.jobTitle !== opportunity.jobTitle).map((item) => item.jobTitle))].slice(0, 3);
  const history: OpportunityLifecycleEvent[] = opportunity.lifecycle?.length ? [...opportunity.lifecycle] : [{ status: opportunity.status, occurredAt: opportunity.discoveredAt, reason: "Opportunity entered the Executive Opportunity Universe", source: "System" }];

  return { opportunityId: opportunity.id, blueprintCompatibilityScore, blueprintComparisons: scores.length, atlasConfidence: { score: confidenceScore, level: confidenceLevel, explanation: "Confidence reflects source quality, evidence completeness, and the number of Blueprint dimensions that can be compared. It is not certainty." }, recommendation, guidance, evidence, strengths, concerns, missingInformation: [...new Set(missingInformation)], provenance, freshness: assessOpportunityFreshness(opportunity, now), history, relatedOpportunities, similarCompanies, similarRoles, opportunityConfidence };
}
