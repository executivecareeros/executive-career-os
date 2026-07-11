export type AgentStatus = "idle" | "scheduled" | "running" | "completed" | "failed" | "paused";
export type AgentPriority = "critical" | "high" | "medium" | "low";
export type AgentKind = "career" | "opportunity" | "company" | "application" | "market";

export type AgentTask<TPayload = unknown> = {
  id: string;
  agent: AgentKind;
  type: string;
  priority: AgentPriority;
  payload: TPayload;
  createdAt: string;
  scheduledFor?: string;
};

export type AgentRecommendation = {
  id: string;
  agent: AgentKind;
  priority: AgentPriority;
  title: string;
  rationale: string;
  action?: string;
  createdAt: string;
};

export type AgentResult<TData = unknown> = {
  taskId: string;
  agent: AgentKind;
  status: Extract<AgentStatus, "completed" | "failed">;
  data?: TData;
  recommendations: AgentRecommendation[];
  summary: string;
  startedAt: string;
  completedAt: string;
  error?: string;
};

export type AgentMemory<TValue = unknown> = {
  key: string;
  namespace: AgentKind;
  value: TValue;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
};

export type AgentHistoryQuery = { entityType: string; entityId: string; correlationId?: string };
export type AgentHistoricalDecision = { ledgerEntryId: string; recommendation: string; reason: string; confidence: number; occurredAt: string; evidenceReferences: string[] };
export interface AgentHistoryAccess {
  readEntityHistory(query: AgentHistoryQuery): Promise<ReadonlyArray<import("@/types/career-ledger").CareerLedgerEntry>>;
  appendLedgerEvent(entry: import("@/types/career-ledger").CareerLedgerEntry): Promise<void>;
  retrieveCompensationHistory(entityId: string): Promise<ReadonlyArray<import("@/types/compensation").CompensationRecord>>;
  retrieveLifecycleDates(applicationId: string): Promise<import("@/types/application").RecruitmentLifecycleDates | undefined>;
  retrievePriorDecisions(entityId: string): Promise<ReadonlyArray<AgentHistoricalDecision>>;
}

export type AgentContext = {
  runId: string;
  requestedBy: "scheduler" | "manual" | "agent";
  now: string;
  memory: ReadonlyArray<AgentMemory>;
  correlationId?: string;
  causationId?: string;
  agentId?: string;
  confidence?: number;
  evidenceReferences?: ReadonlyArray<string>;
  history?: AgentHistoryAccess;
  blueprint?: {
    blueprintId: string;
    revisionId: string;
    completenessState: import("@/types/executive-blueprint").BlueprintCompletenessState;
    decisionPriorities: ReadonlyArray<import("@/types/executive-blueprint").DecisionPriority>;
    constraints: ReadonlyArray<import("@/types/executive-blueprint").CareerConstraint>;
    exclusions: ReadonlyArray<import("@/types/executive-blueprint").StructuredPreference>;
    conflicts: ReadonlyArray<import("@/types/executive-blueprint").BlueprintConflict>;
    confidence: number;
    evidenceReferences: ReadonlyArray<string>;
    lastConfirmedAt: string;
  };
};

export type AgentLog = {
  id: string;
  agent: AgentKind;
  runId: string;
  level: "debug" | "info" | "warning" | "error";
  message: string;
  timestamp: string;
  metadata?: Readonly<Record<string, string | number | boolean>>;
};

export interface Agent<TPayload = unknown, TAnalysis = unknown, TSummary = string> {
  readonly kind: AgentKind;
  readonly status: AgentStatus;
  run(task: AgentTask<TPayload>, context: AgentContext): Promise<AgentResult<TAnalysis>>;
  analyze(payload: TPayload, context: AgentContext): Promise<TAnalysis>;
  recommend(analysis: TAnalysis, context: AgentContext): Promise<AgentRecommendation[]>;
  summarize(analysis: TAnalysis, context: AgentContext): Promise<TSummary>;
}
