export const opportunityStatuses = ["Discovered", "Evaluating", "Qualified", "Ready to Apply", "Applied", "Interview", "Rejected", "Archived"] as const;
export type OpportunityStatus = (typeof opportunityStatuses)[number];

export const opportunityPriorities = ["High", "Medium", "Low"] as const;
export type OpportunityPriority = (typeof opportunityPriorities)[number];

export const workArrangements = ["Remote", "Hybrid", "On-site"] as const;
export type WorkArrangement = (typeof workArrangements)[number];
export type EmploymentType = "Full-time" | "Contract" | "Interim";

export type Opportunity = {
  id: string;
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
