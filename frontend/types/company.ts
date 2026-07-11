export const relationshipStatuses = ["Unknown", "Watching", "Target", "Contacted", "Engaged", "Interviewing", "Alumni", "Do Not Pursue"] as const;
export const monitoringStatuses = ["Not Monitored", "Weekly", "High Priority", "Paused"] as const;
export const companyPriorities = ["Critical", "High", "Medium", "Low"] as const;
export const companySizeCategories = ["Startup", "Growth", "Mid-market", "Enterprise"] as const;
export type RelationshipStatus = (typeof relationshipStatuses)[number];
export type MonitoringStatus = (typeof monitoringStatuses)[number];
export type CompanyPriority = (typeof companyPriorities)[number];
export type CompanySizeCategory = (typeof companySizeCategories)[number];

export type ExecutiveLeader = { name: string; role: string };
export type Company = {
  id: string; name: string; slug: string; initials: string; website?: string; headquarters: string; country: string; regions: string[];
  employeeRange: string; companySizeCategory: CompanySizeCategory; industry: string; subIndustries: string[]; ownershipType: string; fundingStage?: string;
  estimatedRevenueRange?: string; foundedYear?: number; description: string; products: string[]; targetCustomers: string[]; businessModel: string;
  marketPosition: string; growthSignals: string[]; hiringSignals: string[]; internationalExpansionSignals: string[]; strategicPriorities: string[];
  executiveLeadership: ExecutiveLeader[]; cultureSignals: string[]; compensationSignals: string[]; knownRisks: string[]; strategicExclusions: string[];
  opportunityIds: string[]; recruiterIds: string[]; relationshipStatus: RelationshipStatus; relationshipScore: number; companyQualityScore: number;
  strategicRelevanceScore: number; hiringMomentumScore: number; priority: CompanyPriority; monitoringStatus: MonitoringStatus;
  lastReviewedAt: string; nextReviewAt?: string; notes: string; sourceStatus: string; isDemo: true;
};
export type CompanyRecommendation = "Priority Target" | "Strong Target" | "Monitor" | "Low Priority" | "Do Not Pursue";
export type CompanyAssessment = { recommendation: CompanyRecommendation; rationale: string[] };
export type CompanySort = "strategic" | "quality" | "hiring" | "relationship" | "opportunities" | "name" | "reviewed" | "nextReview";
export type CompanyFiltersState = { keyword: string; industry: string; country: string; companySize: CompanySizeCategory | ""; priority: CompanyPriority | ""; relationshipStatus: RelationshipStatus | ""; monitoringStatus: MonitoringStatus | ""; minimumQuality: number; minimumStrategic: number; minimumHiring: number; activeOpportunitiesOnly: boolean };
