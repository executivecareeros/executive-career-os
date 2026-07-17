import type { Opportunity } from "@/types/opportunity";

export const discoverySourceKinds = ["linkedin", "indeed", "glassdoor", "stepstone", "wellfound", "greenhouse", "lever", "workday", "sap-successfactors", "smartrecruiters", "ashby", "icims", "recruitee", "personio", "workable", "corporate-career-site", "executive-search-firm", "manual-import", "csv-import", "rss-feed"] as const;
export type KnownDiscoverySourceKind = (typeof discoverySourceKinds)[number];
/** Open provider identifier. The catalog is illustrative; new compliant providers do not require a domain-model change. */
export type DiscoverySourceKind = KnownDiscoverySourceKind | (string & {});

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
  /** Stable cross-provider company identity when the provider can supply or resolve one. */
  canonicalKey?: string;
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
  blueprintContext?: {
    revisionId: string;
    rolePreferences: readonly string[];
    salaryExpectation?: number;
    travelMaximumPercent?: number;
    workArrangements: readonly string[];
    companySizes: readonly string[];
    ownershipTypes: readonly string[];
    nonNegotiablePrincipleIds: readonly string[];
  };
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

export interface ProviderCollectionRequest {
  runId: string;
  requestedAt: string;
  maximumResults: number;
  cursor?: string;
  filters: DiscoveryFilter;
}

export interface ProviderCollectionBatch {
  providerId: DiscoverySourceKind;
  collectedAt: string;
  jobs: readonly DiscoveryJob[];
  nextCursor?: string;
  sourceRevision?: string;
  /** True only when this batch represents the provider's complete active inventory for the requested scope. */
  completeSnapshot?: boolean;
}

/** Collection-only provider boundary. Providers never create domain Opportunities directly. */
export interface OpportunityProvider {
  readonly id: DiscoverySourceKind;
  readonly source: DiscoverySource;
  readonly reliability: SourceReliability;
  collect(request: ProviderCollectionRequest): Promise<ProviderCollectionBatch>;
  health(): Promise<DiscoveryHealth>;
}

export type ProviderAccessModel = "official-api" | "public-feed" | "authorized-import" | "manual";
export type ProviderReviewStatus = "approved" | "evaluation" | "disabled";
export type ProviderEvaluationRating = "low" | "moderate" | "high" | "unknown";
export type ProviderFounderGateReason = "paid-licensing" | "contract-acceptance" | "provider-terms-acceptance" | "legal-compliance-uncertainty" | "material-personal-data-change" | "material-infrastructure-cost" | "fundamental-architecture-change" | "commercial-commitment-change";
export interface OpportunityProviderEvaluation {
  executiveCoverage: ProviderEvaluationRating;
  executiveRelevance: ProviderEvaluationRating;
  dataQuality: ProviderEvaluationRating;
  freshness: ProviderEvaluationRating;
  legalCompliance: ProviderEvaluationRating;
  reliability: ProviderEvaluationRating;
  scalability: ProviderEvaluationRating;
  engineeringEfficiency: ProviderEvaluationRating;
  accessModel: ProviderAccessModel;
  reviewStatus: ProviderReviewStatus;
  founderGateReasons: readonly ProviderFounderGateReason[];
  reviewedAt: string;
}

/** Plug-in descriptor used to discover and construct providers without branching in the coverage engine. */
export interface OpportunityProviderAdapter {
  readonly id: DiscoverySourceKind;
  readonly name: string;
  readonly evaluation: OpportunityProviderEvaluation;
  supports(locator: URL): boolean;
  create(locator: string): OpportunityProvider;
}

export type IngestionDisposition = "inserted" | "updated" | "duplicate" | "rejected" | "deactivated";
export interface IngestionItemResult {
  sourceId: string;
  disposition: IngestionDisposition;
  opportunityId?: string;
  warnings: readonly string[];
  error?: DiscoveryError;
}

export interface OpportunityIngestionSink {
  list(): Promise<readonly Opportunity[]>;
  upsert(opportunity: Opportunity): Promise<void>;
}

export type IngestionMonitorEvent =
  | { type: "run-started"; runId: string; providerId: DiscoverySourceKind; occurredAt: string }
  | { type: "item-processed"; runId: string; providerId: DiscoverySourceKind; occurredAt: string; sourceId: string; disposition: IngestionDisposition }
  | { type: "run-completed"; runId: string; providerId: DiscoverySourceKind; occurredAt: string; status: DiscoveryRunStatus; imported: number; ignored: number }
  | { type: "run-failed"; runId: string; providerId: DiscoverySourceKind; occurredAt: string; errorCode: string; retryable: boolean };

export interface IngestionMonitor {
  record(event: IngestionMonitorEvent): void | Promise<void>;
}

export interface OpportunityRefreshPolicy {
  cadenceMinutes?: number;
  staleAfterHours: number;
  maximumAttempts: number;
  retryDelayMinutes: number;
}

export interface OpportunityIngestionOutcome {
  run: DiscoveryRun;
  items: readonly IngestionItemResult[];
  nextRefreshAt?: string;
  nextRetryAt?: string;
}

export type CoverageQueueStatus = "queued" | "running" | "completed" | "retrying" | "failed";
export interface OpportunityProviderRegistration {
  providerId: DiscoverySourceKind;
  priority: number;
  enabled: boolean;
  maximumResults: number;
  schedule?: DiscoverySchedule;
}
export interface CoverageQueueItem {
  id: string;
  providerId: DiscoverySourceKind;
  status: CoverageQueueStatus;
  priority: number;
  attempt: number;
  maximumAttempts: number;
  requestedAt: string;
  availableAt: string;
  filters: DiscoveryFilter;
}
export interface CoverageQueueStore {
  list(): Promise<readonly CoverageQueueItem[]>;
  put(item: CoverageQueueItem): Promise<void>;
  remove(id: string): Promise<void>;
}
export interface OpportunityCoverageMetrics {
  registeredProviders: number;
  healthyProviders: number;
  queuedRuns: number;
  completedRuns: number;
  failedRuns: number;
  opportunitiesObserved: number;
  opportunitiesImported: number;
  activeSourceRecords: number;
  activeCanonicalOpportunities: number;
  newToday: number;
  updatedToday: number;
  deactivatedToday: number;
  staleOpportunities: number;
  duplicateObservations: number;
  rejectedObservations: number;
  qualityRate: number;
  freshnessRate: number;
  calculatedAt: string;
}
export interface OpportunityCoverageSnapshot {
  providers: readonly OpportunityProviderRegistration[];
  queue: readonly CoverageQueueItem[];
  metrics: OpportunityCoverageMetrics;
}
