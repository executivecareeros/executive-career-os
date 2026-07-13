export type CompanyDepartment =
  | "Executive Office"
  | "Product"
  | "Engineering"
  | "Infrastructure"
  | "Security"
  | "Sales"
  | "Marketing"
  | "Customer Success"
  | "Customer Support"
  | "Finance"
  | "Legal and Compliance"
  | "People and Organization"
  | "Operations"
  | "Partnerships"
  | "Brand and Communications";

export type CompanyHealth = "Healthy" | "Watch" | "At Risk" | "Critical" | "Unknown" | "Not Connected" | "Not Applicable";
export type DataClassification = "Public" | "Internal" | "Confidential" | "Restricted";
export type MetricValueKind = "Measured" | "Estimated" | "Manually Entered" | "Unavailable";
export type MetricDirection = "Improving" | "Stable" | "Declining" | "New" | "Unknown";
export type MetricUnit = "Count" | "Percent" | "Currency" | "Duration" | "Boolean" | "Score" | "Text";
export type CompanyPriority = "Immediate" | "Today" | "This Week" | "Monitor" | "Future" | "No Action";
export type ActionStatus = "Open" | "Blocked" | "Awaiting Response" | "In Progress" | "Completed" | "Deferred";
export type ConnectionState = "Connected" | "Partially Connected" | "Not Connected" | "Error" | "Not Applicable";
export type AuthorizationState = "Authorized" | "Approval Required" | "Not Authorized" | "Not Required";
export type Confidence = "Very Low" | "Low" | "Medium" | "High" | "Very High";

export interface MetricFreshness {
  state: "Current" | "Aging" | "Stale" | "Unknown" | "Not Connected";
  measuredAt?: string;
  expectedFrequency: "Real Time" | "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Manual" | "Unknown";
  ageInHours?: number;
  maximumAgeInHours?: number;
}

export interface MetricSource {
  id: string;
  name: string;
  type: "Repository" | "Operational Document" | "Provider" | "Manual Entry" | "Derived";
  reference: string;
  connectionState: ConnectionState;
}

export interface MetricThreshold {
  warning?: number;
  critical?: number;
  direction: "Above Is Worse" | "Below Is Worse";
}

export interface MetricTarget {
  value?: number;
  label?: string;
  dueAt?: string;
}

export interface MetricTrend {
  direction: MetricDirection;
  change?: number;
  period?: string;
}

export interface MetricDefinition {
  id: string;
  canonicalKey: string;
  name: string;
  department: CompanyDepartment;
  description: string;
  unit: MetricUnit;
  calculation: string;
  numerator?: string;
  denominator?: string;
  sourceId: string;
  frequency: MetricFreshness["expectedFrequency"];
  owner: string;
  target?: MetricTarget;
  threshold?: MetricThreshold;
  dataClassification: DataClassification;
  displayRules: string;
}

export interface MetricObservation {
  id: string;
  metricId: string;
  value?: number | string | boolean;
  previousValue?: number | string | boolean;
  status: CompanyHealth;
  direction: MetricDirection;
  period: string;
  measuredAt?: string;
  source: MetricSource;
  sourceReference: string;
  freshness: MetricFreshness;
  confidence: Confidence;
  valueKind: MetricValueKind;
  owner: string;
  notes?: string;
  demoStatus: "Factual" | "Demonstration" | "Not Connected";
}

export interface CompanyMetric {
  definition: MetricDefinition;
  observation: MetricObservation;
}

export interface DepartmentHealth {
  department: CompanyDepartment;
  health: CompanyHealth;
  accountableOwner: string;
  mostImportantMetric?: CompanyMetric;
  openActions: number;
  currentRisks: number;
  overdueItems: number;
  latestMeaningfulChange: string;
  freshness: MetricFreshness;
  connectionState: ConnectionState;
  href: string;
}

export interface OperationalAlert {
  id: string;
  title: string;
  department: CompanyDepartment;
  severity: "Information" | "Warning" | "High" | "Critical";
  evidence: string[];
  sourceReference: string;
  status: "Open" | "Acknowledged" | "Resolved" | "Suppressed";
  correlationId: string;
}

export interface FounderAction {
  id: string;
  title: string;
  department: CompanyDepartment;
  urgency: CompanyPriority;
  importance: "Low" | "Medium" | "High" | "Critical";
  dueDate?: string;
  reason: string;
  evidence: string[];
  blocker?: string;
  recommendedNextStep: string;
  owner: string;
  sourceLink: string;
  status: ActionStatus;
  approvalRequired: boolean;
}

export type FounderPriority = FounderAction;

export interface CompanyTask extends FounderAction {
  taskType: "One Time" | "Recurring" | "Follow Up" | "Approval";
  relatedEntityId?: string;
}

export interface CompanyDeadline {
  id: string;
  title: string;
  department: CompanyDepartment;
  dueAt: string;
  type: "Renewal" | "Legal" | "Support" | "Product" | "Beta" | "Operational";
  status: "Upcoming" | "Due Today" | "Overdue" | "Completed";
  sourceReference: string;
}

export interface CompanyRisk {
  id: string;
  title: string;
  category: "Business" | "Technical" | "Operational" | "Security" | "Legal" | "Financial" | "Vendor" | "Single Founder";
  likelihood: "Low" | "Medium" | "High" | "Critical";
  impact: "Low" | "Medium" | "High" | "Critical";
  mitigation: string;
  owner: string;
  status: "Open" | "Monitoring" | "Mitigating" | "Accepted" | "Closed";
  sourceReference: string;
}

export interface CompanyDecision {
  id: string;
  title: string;
  owner: string;
  status: "Draft" | "Founder Review" | "Approved" | "Rejected" | "Deferred";
  dueAt?: string;
  evidence: string[];
  sourceReference: string;
}

export interface CompanyObjective { id: string; title: string; owner: string; status: CompanyHealth; targetAt?: string; sourceReference: string; }
export interface CompanyMilestone { id: string; title: string; achievedAt?: string; status: "Planned" | "In Progress" | "Achieved" | "Blocked"; sourceReference: string; }
export interface CompanyIncident { id: string; title: string; severity: OperationalAlert["severity"]; status: "Open" | "Contained" | "Resolved"; openedAt: string; sourceReference: string; }

export interface VendorHealth {
  id: string;
  provider: string;
  status: CompanyHealth;
  lastVerified?: string;
  sourceReference: string;
  owner: string;
  recoveryReadiness: CompanyHealth;
  openIssue?: string;
  nextAction: string;
}

export interface IntegrationHealth extends VendorHealth {
  connectionState: ConnectionState;
  authorizationState: AuthorizationState;
}

export interface SupportCase {
  id: string;
  provider: string;
  subject: string;
  openedAt: string;
  status: string;
  owner: string;
  nextAction: string;
  lastUpdatedAt: string;
  blocker?: string;
  escalationState: string;
  sourceReference: string;
}

export interface BriefingEvidence { id: string; statement: string; sourceReference: string; confidence: Confidence; }
export interface BriefingSection { id: string; title: string; summary: string; evidence: BriefingEvidence[]; status: CompanyHealth; }
export interface RecommendedFounderAction { action: FounderAction; expectedOutcome: string; downsideOfDelay: string; }
export interface DailyBrief { id: string; title: string; generatedAt: string; status: "Demonstration Briefing" | "Live Briefing"; sections: BriefingSection[]; recommendations: RecommendedFounderAction[]; unknowns: string[]; }

export interface CompanyScorecard { generatedAt: string; overallHealth: CompanyHealth; departments: DepartmentHealth[]; metrics: CompanyMetric[]; }
export interface BetaOperationalStatus {
  stagingReadiness: CompanyHealth;
  productionReadiness: CompanyHealth;
  activeDesignPartners?: number;
  invitationsSent?: number;
  invitationsAccepted?: number;
  onboardingCompleted?: number;
  assessmentsCompleted?: number;
  feedbackWaiting?: number;
  criticalBugs?: number;
  privacyRequests?: number;
  supportCases: number;
  betaHealth: CompanyHealth;
  dataState: "Factual" | "Unavailable" | "Not Connected";
  summary: string;
  sourceReference: string;
}
export interface CompanySnapshot { generatedAt: string; environment: string; betaStage: string; health: CompanyScorecard; beta: BetaOperationalStatus; actions: FounderAction[]; alerts: OperationalAlert[]; deadlines: CompanyDeadline[]; risks: CompanyRisk[]; vendors: VendorHealth[]; supportCases: SupportCase[]; brief: DailyBrief; }
export interface BoardSnapshot { generatedAt: string; companyHealth: CompanyHealth; criticalRisks: CompanyRisk[]; decisions: CompanyDecision[]; objectives: CompanyObjective[]; milestones: CompanyMilestone[]; }

export interface CompanyDataSource {
  id: string;
  name: string;
  provider: string;
  connectionState: ConnectionState;
  authorizationState: AuthorizationState;
  lastSynchronization?: string;
  freshness: MetricFreshness;
  scopes: string[];
  owner: string;
  health: CompanyHealth;
  error?: string;
  recordsImported?: number;
  nextScheduledUpdate?: string;
  sourceReference: string;
}

export type CompanyAccessRole = "Founder" | "Company Executive" | "Department Leader" | "Board Member" | "Adviser" | "Auditor" | "Read-Only Viewer";
export type SensitiveArea = "Company Overview" | "Finance" | "User Identities" | "Support Messages" | "Legal Records" | "Security Incidents" | "Compensation" | "Private Customer Information";
export interface CompanyPermission { role: CompanyAccessRole; area: SensitiveArea; access: "None" | "Aggregate" | "Read" | "Manage"; approvalRequired: boolean; }

export interface CompanyAuditRecord {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  source: string;
  previousState?: string;
  newState?: string;
  reason: string;
  approval?: string;
  correlationId: string;
  auditReference: string;
}
