export const opportunityStatuses = ["Discovered", "Evaluating", "Qualified", "Ready to Apply", "Applied", "Interview", "Rejected", "Archived"] as const;
export type OpportunityStatus = (typeof opportunityStatuses)[number];

export const opportunityPriorities = ["High", "Medium", "Low"] as const;
export type OpportunityPriority = (typeof opportunityPriorities)[number];

export const workArrangements = ["Remote", "Hybrid", "On-site", "Unknown"] as const;
export type WorkArrangement = (typeof workArrangements)[number];
export type EmploymentType = "Full-time" | "Contract" | "Interim" | "Unknown";

export const opportunityUniverseStages = ["Universe", "Qualified", "Recommended"] as const;
export type OpportunityUniverseStage = (typeof opportunityUniverseStages)[number];

export const opportunitySourceKinds = ["Employer", "Job Board", "Recruiter", "Referral", "Manual", "Document", "URL"] as const;
export type OpportunitySourceKind = (typeof opportunitySourceKinds)[number];
export type OpportunitySource = {
  id: string;
  name: string;
  kind: OpportunitySourceKind;
  originalId?: string;
  originalUrl?: string;
  collectedAt: string;
  confidence: "High" | "Medium" | "Low" | "Unknown";
  firstSeenAt?: string;
  lastSeenAt?: string;
  lastFetchedAt?: string;
  lastVerifiedAt?: string;
  status?: "Active" | "Closed" | "Unknown";
  fetchStatus?: "Succeeded" | "Failed" | "Unknown";
  parserVersion?: string;
};

export type OpportunityFreshnessStatus = "Fresh" | "Recent" | "Stale" | "Unknown";
export type OpportunityFreshness = {
  status: OpportunityFreshnessStatus;
  lastObservedAt?: string;
  ageHours?: number;
  staleAfterHours: number;
  nextRefreshAt?: string;
};

export type OpportunityLifecycleEvent = {
  status: OpportunityStatus;
  occurredAt: string;
  reason: string;
  source: "Executive" | "Atlas" | "System";
};

export type OpportunityCompanyProfile = {
  companyId?: string;
  canonicalKey?: string;
  name: string;
  website?: string;
  industry?: string;
  headquarters?: string;
  size?: string;
  evidenceStatus: "Confirmed" | "Partial" | "Unknown";
};

export type Opportunity = {
  id: string;
  externalIds?: string[];
  normalizedTitle?: string;
  canonicalUrl?: string;
  employerDomain?: string;
  companyId?: string;
  companyName: string;
  companyInitials: string;
  companyLogo?: string;
  jobTitle: string;
  location: string;
  country: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  industry: string;
  companySize: string;
  source: string;
  sourceUrl?: string;
  visibility?: "Private";
  verificationStatus?: "Employer source matched" | "Unverified LinkedIn observation";
  sources?: OpportunitySource[];
  lastObservedAt?: string;
  freshness?: OpportunityFreshness;
  universeStage?: OpportunityUniverseStage;
  lifecycle?: OpportunityLifecycleEvent[];
  companyProfile?: OpportunityCompanyProfile;
  publishedAt: string;
  discoveredAt: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  executiveFitScore: number;
  strategicOpportunityScore: number;
  overallScore: number;
  confidenceScore: number;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  travelRequirement: string;
  summary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  matchingStrengths: string[];
  missingRequirements: string[];
  riskFlags: string[];
  exclusions: string[];
  decisionRationale: string;
  recommendedCVProfile: string;
  coverLetterRecommended: boolean;
  applicationDeadline?: string;
  closedAt?: string;
  closureReason?: string;
  canonicalizationConfidence?: number;
  completenessScore?: number;
  legitimacyState?: "Verified" | "Probable" | "Unverified" | "Rejected";
  notes: string;
};

export type OpportunityRecommendation = "Strong Apply" | "Apply" | "Review Carefully" | "Do Not Apply";
export type OpportunityAssessment = {
  recommendation: OpportunityRecommendation;
  rationale: string[];
};

export type OpportunitySort = "newest" | "overall" | "executiveFit" | "strategic" | "company" | "deadline";
export type OpportunityFiltersState = {
  keyword: string;
  status: OpportunityStatus | "";
  industry: string;
  country: string;
  workArrangement: WorkArrangement | "";
  minimumExecutiveFitScore: number;
  minimumStrategicScore: number;
  priority: OpportunityPriority | "";
};
