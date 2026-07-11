import type { Opportunity } from "@/types/opportunity";

export const discoverySourceKinds = ["linkedin", "indeed", "glassdoor", "stepstone", "wellfound", "greenhouse", "lever", "workday", "sap-successfactors", "smartrecruiters", "ashby", "icims", "corporate-career-site", "executive-search-firm", "manual-import", "csv-import", "rss-feed"] as const;
export type DiscoverySourceKind = (typeof discoverySourceKinds)[number];

export const sourceReliabilityTypes = ["Official API", "Verified Feed", "Corporate Website", "Executive Search Firm", "Job Board", "Recruiter", "Referral", "Manual Import", "Unknown"] as const;
export type SourceReliabilityType = (typeof sourceReliabilityTypes)[number];
export type ConfidenceRating = "very-low" | "low" | "moderate" | "high" | "very-high";
export type ConnectorStatus = "available" | "connected" | "degraded" | "unavailable" | "disabled";
export type DiscoveryFrequency = "manual" | "hourly" | "daily" | "weekly" | "custom";
export type DiscoveryRunStatus = "scheduled" | "running" | "completed" | "completed-with-warnings" | "failed" | "cancelled";

export interface DiscoverySource {
  id: DiscoverySourceKind;
  name: string;
  category: SourceReliabilityType;
  description: string;
  capabilities: readonly ("jobs" | "companies")[];
}

export interface DiscoveryCompany {
  sourceId: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  country?: string;
}

export interface DiscoveryJob {
  sourceId: string;
  source: DiscoverySourceKind;
  title: string;
  company: DiscoveryCompany;
  location?: string;
  country?: string;
  description?: string;
  originalUrl?: string;
  publishedAt?: string;
  discoveredAt: string;
  employmentType?: string;
  salary?: { minimum?: number; maximum?: number; currency?: string };
  rawMetadata: Readonly<Record<string, unknown>>;
}

export interface DiscoveryEvidence {
  kind: "source-record" | "source-url" | "field-match" | "manual-verification";
  reference: string;
  observedAt: string;
  description?: string;
}

export interface SourceReliability {
  type: SourceReliabilityType;
  rating: ConfidenceRating;
  score: number;
  rationale: string;
  assessedAt: string;
}

export interface OpportunityProvenance {
  source: DiscoverySourceKind;
  connector: string;
  discoveredAt: string;
  originalUrl?: string;
  originalId: string;
  normalizationVersion: string;
  importRunId: string;
  confidence: SourceReliability;
  evidence: readonly DiscoveryEvidence[];
  /** Career Ledger entry that permanently records this import when persistence is enabled. */
  ledgerEntryId?: string;
}

export interface DiscoveryResult {
  job: DiscoveryJob;
  normalizedOpportunity: Opportunity;
  provenance: OpportunityProvenance;
  warnings: readonly string[];
}

export interface DiscoveryError {
  code: string;
  message: string;
  source: DiscoverySourceKind;
  occurredAt: string;
  retryable: boolean;
  details?: Readonly<Record<string, unknown>>;
}

export interface DiscoveryRun {
  id: string;
  source: DiscoverySourceKind;
  status: DiscoveryRunStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  jobsFound: number;
  jobsImported: number;
  jobsIgnored: number;
  errors: readonly DiscoveryError[];
  warnings: readonly string[];
  isDemo: boolean;
}

export interface DiscoverySchedule {
  id: string;
  source: DiscoverySourceKind;
  frequency: DiscoveryFrequency;
  enabled: boolean;
  timezone: string;
  customExpression?: string;
  nextRunAt?: string;
}

export interface DiscoveryHealth {
  source: DiscoverySourceKind;
  status: ConnectorStatus;
  checkedAt: string;
  latencyMs?: number;
  message: string;
}

export interface DiscoveryFilter {
  countries: readonly string[];
  industries: readonly string[];
  executiveLevels: readonly string[];
  languages: readonly string[];
  keywords: readonly string[];
  exclusionKeywords: readonly string[];
  minimumSalary?: number;
}

export interface DiscoveryConfiguration {
  source: DiscoverySourceKind;
  enabled: boolean;
  priority: number;
  maximumResults: number;
  filters: DiscoveryFilter;
}

export interface DiscoveryStatistics {
  totalRuns: number;
  successfulRuns: number;
  opportunitiesFound: number;
  opportunitiesImported: number;
  duplicateRate: number;
  averageConfidence: number;
  lastCalculatedAt: string;
}

export interface ConnectorContext {
  configuration: DiscoveryConfiguration;
  runId: string;
  requestedAt: string;
}

export interface DiscoveryConnector {
  readonly id: DiscoverySourceKind;
  readonly source: DiscoverySource;
  connect(configuration: DiscoveryConfiguration): Promise<DiscoveryHealth>;
  discover(context: ConnectorContext): Promise<readonly DiscoveryJob[]>;
  normalize(job: DiscoveryJob, context: ConnectorContext): Promise<DiscoveryResult>;
  health(): Promise<DiscoveryHealth>;
  disconnect(): Promise<void>;
}

export interface OpportunityNormalizer {
  readonly version: string;
  normalize(job: DiscoveryJob, context: ConnectorContext, reliability: SourceReliability): DiscoveryResult;
}

export interface DiscoveryScheduler {
  schedule(schedule: DiscoverySchedule): Promise<DiscoverySchedule>;
  unschedule(scheduleId: string): Promise<void>;
  list(): Promise<readonly DiscoverySchedule[]>;
  runNow(source: DiscoverySourceKind): Promise<DiscoveryRun>;
}

export interface ExecutiveBlueprintDiscoveryProfile {
  preferredCountries: readonly string[];
  preferredIndustries: readonly string[];
  minimumSalary?: number;
  leadershipLevels: readonly string[];
  travelPreferences: readonly string[];
  languages: readonly string[];
  companySizes: readonly string[];
  ownershipModels: readonly string[];
  executivePrinciples: readonly string[];
}

export interface BlueprintDiscoveryFilterFactory {
  fromBlueprint(blueprint: ExecutiveBlueprintDiscoveryProfile): DiscoveryFilter;
}
