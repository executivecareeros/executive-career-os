import type { DiscoverySourceKind, ProviderFounderGateReason, ProviderEvaluationRating } from "./types";

export type StrategicProviderStatus = "implemented" | "founder-approval-required" | "evaluation";

export interface StrategicProviderPriority {
  id: DiscoverySourceKind;
  name: string;
  tier: 1 | 2;
  status: StrategicProviderStatus;
  strategy: string;
  technicalFeasibility: ProviderEvaluationRating;
  legalCompliance: ProviderEvaluationRating;
  operationalRisk: ProviderEvaluationRating;
  expectedCoverage: ProviderEvaluationRating;
  founderGateReasons: readonly ProviderFounderGateReason[];
  fastestCompliantPath?: string;
}

/** Founder-directed Tier 1 portfolio. A constrained provider remains visible until its gate is resolved. */
export const tierOneProviderPriorities: readonly StrategicProviderPriority[] = [
  { id: "greenhouse", name: "Greenhouse", tier: 1, status: "implemented", strategy: "Official employer Job Board API", technicalFeasibility: "high", legalCompliance: "high", operationalRisk: "low", expectedCoverage: "high", founderGateReasons: [] },
  { id: "lever", name: "Lever", tier: 1, status: "implemented", strategy: "Official employer Postings API", technicalFeasibility: "high", legalCompliance: "high", operationalRisk: "low", expectedCoverage: "high", founderGateReasons: [] },
  { id: "ashby", name: "Ashby", tier: 1, status: "implemented", strategy: "Official public Job Posting API", technicalFeasibility: "high", legalCompliance: "high", operationalRisk: "low", expectedCoverage: "moderate", founderGateReasons: [] },
  { id: "corporate-career-site", name: "Company Career Sites", tier: 1, status: "implemented", strategy: "Bounded single-page JobPosting structured-data collection", technicalFeasibility: "high", legalCompliance: "high", operationalRisk: "moderate", expectedCoverage: "high", founderGateReasons: [] },
  { id: "linkedin", name: "LinkedIn Jobs", tier: 1, status: "founder-approval-required", strategy: "Approved LinkedIn Talent Solutions partnership", technicalFeasibility: "moderate", legalCompliance: "unknown", operationalRisk: "high", expectedCoverage: "high", founderGateReasons: ["contract-acceptance", "provider-terms-acceptance"], fastestCompliantPath: "Apply for LinkedIn Talent Solutions partner access and review the required agreement before building an adapter." },
  { id: "workday", name: "Workday", tier: 1, status: "founder-approval-required", strategy: "Authorized tenant integration or a provider-confirmed public collection interface", technicalFeasibility: "moderate", legalCompliance: "unknown", operationalRisk: "high", expectedCoverage: "high", founderGateReasons: ["provider-terms-acceptance", "legal-compliance-uncertainty"], fastestCompliantPath: "Secure an authorized employer tenant or Workday partner path and confirm collection rights before implementing the adapter." },
] as const;

