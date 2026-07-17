import type {
  AtlasKnowledgeView,
  KnowledgeConfidence,
  KnowledgeEntityKind,
  KnowledgeRelationshipKind,
} from "./employment-knowledge-graph.ts";

export const executiveDecisionIntelligenceVersion = "orion-decision-intelligence-v1" as const;

export const decisionDomainIds = [
  "Opportunity Intelligence",
  "Employer Intelligence",
  "Compensation Intelligence",
  "Career Progression Intelligence",
  "Market Intelligence",
  "Executive Fit Intelligence",
] as const;
export type DecisionDomainId = (typeof decisionDomainIds)[number];
export type DecisionConfidenceLevel = "Very High" | "High" | "Moderate" | "Low" | "Unknown";

export type DecisionDomainDefinition = {
  id: DecisionDomainId;
  purpose: string;
  decisionQuestion: string;
  inputs: readonly string[];
  requiredEntityKinds: readonly KnowledgeEntityKind[];
  requiredRelationshipKinds: readonly KnowledgeRelationshipKind[];
  requiredContext: readonly string[];
  evidenceRequirements: readonly string[];
  outputs: readonly string[];
  unknownConditions: readonly string[];
  explainability: string;
  reusePotential: readonly string[];
};

export const decisionDomainRegistry: readonly DecisionDomainDefinition[] = [
  {
    id: "Opportunity Intelligence",
    purpose: "Help an executive decide whether an observed opportunity deserves further attention.",
    decisionQuestion: "Is this opportunity sufficiently understood to justify the next investigation step?",
    inputs: ["Canonical opportunity", "Employer relationship", "Role", "Location", "Source evidence"],
    requiredEntityKinds: ["Opportunity", "Employer", "ExecutiveRole"],
    requiredRelationshipKinds: ["EMPLOYER_OWNS_OPPORTUNITY", "OPPORTUNITY_HAS_ROLE"],
    requiredContext: [],
    evidenceRequirements: ["Observed opportunity", "Observed employer", "Observed role", "Source provenance"],
    outputs: ["Evidence summary", "Reasons for and against", "Unknowns", "Next investigation action"],
    unknownConditions: ["Employer identity unresolved", "Role or location unsupported", "Source provenance absent"],
    explainability: "Cites every opportunity, employer, role, and conflict observation used.",
    reusePotential: ["Opportunity detail", "Ranked opportunities", "Application decision"],
  },
  {
    id: "Employer Intelligence",
    purpose: "Help an executive decide how much employer research is justified before engagement.",
    decisionQuestion: "Is the employer identity and observed hiring context sufficiently established?",
    inputs: ["Canonical employer", "Identity history", "Observed opportunities", "Industry evidence"],
    requiredEntityKinds: ["Employer", "Opportunity"],
    requiredRelationshipKinds: ["EMPLOYER_OWNS_OPPORTUNITY"],
    requiredContext: [],
    evidenceRequirements: ["Employer identity evidence", "Observed opportunity relationship", "Identity conflict state"],
    outputs: ["Employer evidence summary", "Identity confidence", "Known gaps", "Research action"],
    unknownConditions: ["Official employer identity unverified", "Industry absent", "Conflicting employer evidence"],
    explainability: "Separates source-scoped identity from verified employer facts.",
    reusePotential: ["Company profile", "Opportunity review", "Employer outreach"],
  },
  {
    id: "Compensation Intelligence",
    purpose: "Help an executive judge whether observed compensation supports continued evaluation.",
    decisionQuestion: "What compensation is explicitly known, and what must be clarified?",
    inputs: ["Observed compensation", "Currency", "Opportunity relationship"],
    requiredEntityKinds: ["Opportunity", "Compensation"],
    requiredRelationshipKinds: ["OPPORTUNITY_OFFERS_COMPENSATION"],
    requiredContext: [],
    evidenceRequirements: ["Observed compensation bound", "Currency", "Opportunity relationship"],
    outputs: ["Observed range", "Confidence", "Missing terms", "Clarification action"],
    unknownConditions: ["No compensation published", "Currency absent", "Variable compensation or equity absent"],
    explainability: "Never estimates a range from title, employer, or geography.",
    reusePotential: ["Opportunity review", "Negotiation preparation", "Market comparison"],
  },
  {
    id: "Career Progression Intelligence",
    purpose: "Help an executive compare a prospective move with an evidenced career sequence.",
    decisionQuestion: "Does the move represent progression, continuity, or an evidenced trade-off?",
    inputs: ["Verified career sequence", "Prospective role", "Leadership scope evidence"],
    requiredEntityKinds: ["ExecutiveRole", "Opportunity"],
    requiredRelationshipKinds: ["OPPORTUNITY_HAS_ROLE"],
    requiredContext: ["verified-career-sequence"],
    evidenceRequirements: ["Ordered career-role evidence", "Scope evidence", "Prospective role evidence"],
    outputs: ["Progression evidence", "Trade-offs", "Unknowns", "Reflection action"],
    unknownConditions: ["Career sequence absent", "Leadership scope absent", "Role comparability unsupported"],
    explainability: "Shows the observed role sequence and never infers seniority from titles alone.",
    reusePotential: ["Blueprint", "Career Ledger", "Opportunity decision"],
  },
  {
    id: "Market Intelligence",
    purpose: "Help an executive understand evidenced opportunity patterns without mistaking inventory for the whole market.",
    decisionQuestion: "What patterns are supported by the observed market sample?",
    inputs: ["Canonical opportunities", "Canonical employers", "Industries", "Defined market scope"],
    requiredEntityKinds: ["Opportunity", "Employer", "Industry"],
    requiredRelationshipKinds: ["EMPLOYER_OWNS_OPPORTUNITY", "EMPLOYER_BELONGS_TO_INDUSTRY"],
    requiredContext: ["representative-market-scope"],
    evidenceRequirements: ["Multiple independent employers", "Defined market scope", "Observation window", "Coverage limitations"],
    outputs: ["Observed pattern", "Sample limitations", "Confidence", "Research action"],
    unknownConditions: ["Sample scope undefined", "Provider bias unmeasured", "Insufficient independent employers"],
    explainability: "Reports observed counts and scope; never generalizes beyond measured coverage.",
    reusePotential: ["Market briefing", "Company discovery", "Career direction"],
  },
  {
    id: "Executive Fit Intelligence",
    purpose: "Help an executive compare evidenced opportunity requirements with confirmed personal context.",
    decisionQuestion: "Which evidenced alignments and gaps matter to this executive?",
    inputs: ["Confirmed executive profile", "Opportunity requirements", "Location", "Skills", "Explicit comparison signals"],
    requiredEntityKinds: ["Opportunity", "ExecutiveRole", "Skill", "Location"],
    requiredRelationshipKinds: ["OPPORTUNITY_HAS_ROLE", "OPPORTUNITY_REQUIRES_SKILL", "OPPORTUNITY_LOCATED_IN"],
    requiredContext: ["confirmed-executive-profile"],
    evidenceRequirements: ["Confirmed executive evidence", "Observed requirements", "Explicit comparison signals"],
    outputs: ["Alignments", "Gaps", "Eligibility unknowns", "Next action"],
    unknownConditions: ["Executive context unconfirmed", "Requirements absent", "Eligibility unspecified"],
    explainability: "Every alignment or gap cites both the opportunity and confirmed executive evidence.",
    reusePotential: ["Ranked opportunities", "Atlas explanation", "Application decision"],
  },
] as const;

export type DecisionSignal = {
  id: string;
  direction: "For" | "Against" | "Context";
  statement: string;
  evidenceIds: readonly string[];
  alternativeInterpretation?: string;
};

export type DecisionGateResult = {
  gate: "Decision Quality" | "Explainability" | "Evidence" | "Confidence" | "Executive Trust";
  passed: boolean;
  explanation: string;
};

export type DecisionAssessment = {
  version: typeof executiveDecisionIntelligenceVersion;
  domain: DecisionDomainId;
  focusEntityId: string | null;
  state: "Decision Support Available" | "Insufficient Evidence";
  summary: string;
  supportingEvidence: readonly { evidenceId: string; source: string; observedAt: string; confidence: KnowledgeConfidence }[];
  confidence: { level: DecisionConfidenceLevel; score: number | null; method: string };
  knownFacts: readonly string[];
  unknowns: readonly string[];
  alternativeInterpretations: readonly string[];
  reasonsFor: readonly DecisionSignal[];
  reasonsAgainst: readonly DecisionSignal[];
  context: readonly DecisionSignal[];
  suggestedNextActions: readonly string[];
  gates: readonly DecisionGateResult[];
  recommendationEligible: boolean;
};

const unique = <T>(values: readonly T[]) => [...new Set(values)];
const relationTouches = (relationship: AtlasKnowledgeView["relationships"][number], entityIds: ReadonlySet<string>) => entityIds.has(relationship.fromEntityId) || entityIds.has(relationship.toEntityId);

function collectNeighborhood(graph: AtlasKnowledgeView, focusEntityId: string | null) {
  if (!focusEntityId) return { entities: graph.entities, relationships: graph.relationships };
  const directRelationships = graph.relationships.filter((relationship) => relationship.fromEntityId === focusEntityId || relationship.toEntityId === focusEntityId);
  const entityIds = new Set([focusEntityId, ...directRelationships.flatMap((relationship) => [relationship.fromEntityId, relationship.toEntityId])]);
  const relationships = graph.relationships.filter((relationship) => relationTouches(relationship, entityIds));
  for (const relationship of relationships) {
    entityIds.add(relationship.fromEntityId);
    entityIds.add(relationship.toEntityId);
  }
  return { entities: graph.entities.filter((entity) => entityIds.has(entity.id)), relationships };
}

function calculateConfidence(input: { evidence: DecisionAssessment["supportingEvidence"]; missingRequirements: readonly string[]; conflicts: number }) {
  if (!input.evidence.length) return { level: "Unknown" as const, score: null, method: "No cited evidence; confidence remains Unknown." };
  const weakestEvidence = Math.min(...input.evidence.map((item) => item.confidence.score));
  const independentSources = new Set(input.evidence.map((item) => item.source)).size;
  if (input.missingRequirements.length) return { level: "Low" as const, score: Math.min(49, weakestEvidence), method: `Required evidence is incomplete (${input.missingRequirements.join(", ")}); confidence cannot exceed Low.` };
  if (input.conflicts) return { level: "Low" as const, score: Math.min(49, weakestEvidence), method: `${input.conflicts} unresolved conflict(s) exist; confidence cannot exceed Low.` };
  if (weakestEvidence >= 90 && independentSources >= 2) return { level: "Very High" as const, score: weakestEvidence, method: "All requirements are met by at least two independent sources; score equals the weakest cited evidence." };
  if (weakestEvidence >= 75) return { level: "High" as const, score: weakestEvidence, method: "All requirements are met; score equals the weakest cited evidence." };
  return { level: "Moderate" as const, score: weakestEvidence, method: "All requirements are present, but source confidence does not support High confidence." };
}

export function assessExecutiveDecision(graph: AtlasKnowledgeView, input: { domain: DecisionDomainId; focusEntityId?: string; contextKeys?: readonly string[]; signals?: readonly DecisionSignal[] }): DecisionAssessment {
  const definition = decisionDomainRegistry.find((candidate) => candidate.id === input.domain);
  if (!definition) throw new Error(`Unknown decision domain: ${input.domain}`);
  const focusEntityId = input.focusEntityId ?? null;
  if (focusEntityId && !graph.entities.some((entity) => entity.id === focusEntityId)) throw new Error("Decision focus entity is not present in the knowledge graph");
  const neighborhood = collectNeighborhood(graph, focusEntityId);
  const missingEntityKinds = definition.requiredEntityKinds.filter((kind) => !neighborhood.entities.some((entity) => entity.kind === kind)).map((kind) => `${kind} evidence`);
  const missingRelationshipKinds = definition.requiredRelationshipKinds.filter((kind) => !neighborhood.relationships.some((relationship) => relationship.kind === kind)).map((kind) => `${kind} relationship`);
  const contextKeys = new Set(input.contextKeys ?? []);
  const missingContext = definition.requiredContext.filter((key) => !contextKeys.has(key)).map((key) => `${key} context`);
  const validEvidenceIds = new Set(graph.evidence.map((evidence) => evidence.id));
  const signals = input.signals ?? [];
  if (signals.some((signal) => !signal.evidenceIds.length || signal.evidenceIds.some((id) => !validEvidenceIds.has(id)))) throw new Error("Every decision signal must cite existing graph evidence");
  const neighborhoodEvidenceIds = unique(neighborhood.entities.flatMap((entity) => entity.evidenceIds).filter((id) => validEvidenceIds.has(id)));
  const signalEvidenceIds = signals.flatMap((signal) => signal.evidenceIds);
  const citedEvidenceIds = unique([...neighborhoodEvidenceIds, ...signalEvidenceIds]);
  const supportingEvidence = citedEvidenceIds.map((id) => graph.evidence.find((evidence) => evidence.id === id)!).map((evidence) => ({ evidenceId: evidence.id, source: evidence.dataSourceId, observedAt: evidence.observedAt, confidence: evidence.confidence }));
  const relevantEntityIds = new Set(neighborhood.entities.map((entity) => entity.id));
  const conflicts = graph.assertions.filter((assertion) => relevantEntityIds.has(assertion.entityId) && assertion.state === "Conflicted");
  const unknownAssertions = graph.assertions.filter((assertion) => relevantEntityIds.has(assertion.entityId) && assertion.state === "Unknown");
  const missingRequirements = [...missingEntityKinds, ...missingRelationshipKinds, ...missingContext];
  const assessmentConfidence = calculateConfidence({ evidence: supportingEvidence, missingRequirements, conflicts: conflicts.length });
  const knownFacts = neighborhood.entities.filter((entity) => !["Evidence", "Connector", "DataSource"].includes(entity.kind)).map((entity) => `${entity.kind}: ${entity.label}`);
  const unknowns = unique([
    ...missingRequirements,
    ...unknownAssertions.map((assertion) => `${assertion.field} is Unknown`),
    ...conflicts.map((assertion) => `${assertion.field} has conflicting evidence`),
  ]);
  const reasonsFor = signals.filter((signal) => signal.direction === "For");
  const reasonsAgainst = signals.filter((signal) => signal.direction === "Against");
  const context = signals.filter((signal) => signal.direction === "Context");
  const evidenceBacked = Boolean(supportingEvidence.length) && signals.every((signal) => signal.evidenceIds.length > 0);
  const recommendationEligible = missingRequirements.length === 0 && evidenceBacked && assessmentConfidence.level !== "Unknown";
  const gates: DecisionGateResult[] = [
    { gate: "Decision Quality", passed: recommendationEligible, explanation: recommendationEligible ? `The ${definition.decisionQuestion.toLowerCase()} question has its required evidence.` : "Required evidence is incomplete; no recommendation is issued." },
    { gate: "Explainability", passed: true, explanation: definition.explainability },
    { gate: "Evidence", passed: evidenceBacked, explanation: evidenceBacked ? `${supportingEvidence.length} graph evidence record(s) are cited.` : "No sufficient graph evidence is available." },
    { gate: "Confidence", passed: assessmentConfidence.level !== "Unknown", explanation: assessmentConfidence.method },
    { gate: "Executive Trust", passed: true, explanation: `${unknowns.length} unknown or conflicting condition(s) are disclosed and no certainty is invented.` },
  ];
  const suggestedNextActions = recommendationEligible
    ? reasonsAgainst.length ? ["Resolve the evidenced concern before committing to the opportunity.", "Verify every remaining Unknown with the employer or recruiter."] : ["Review the cited evidence and verify every remaining Unknown before acting."]
    : [unknowns.length ? `Collect evidence for: ${unknowns.slice(0, 3).join("; ")}.` : "Collect additional independent evidence before requesting a recommendation."];
  return {
    version: executiveDecisionIntelligenceVersion,
    domain: definition.id,
    focusEntityId,
    state: recommendationEligible ? "Decision Support Available" : "Insufficient Evidence",
    summary: recommendationEligible ? `${definition.id} has sufficient evidence for structured decision support.` : `${definition.id} remains insufficiently evidenced; Orion will not recommend a decision.`,
    supportingEvidence,
    confidence: assessmentConfidence,
    knownFacts,
    unknowns,
    alternativeInterpretations: unique(signals.flatMap((signal) => signal.alternativeInterpretation ? [signal.alternativeInterpretation] : [])),
    reasonsFor,
    reasonsAgainst,
    context,
    suggestedNextActions,
    gates,
    recommendationEligible,
  };
}

export type AtlasDecisionAdvice = {
  summary: string;
  supportingEvidence: DecisionAssessment["supportingEvidence"];
  confidence: DecisionAssessment["confidence"];
  unknowns: readonly string[];
  alternativeInterpretations: readonly string[];
  reasonsFor: readonly string[];
  reasonsAgainst: readonly string[];
  suggestedNextActions: readonly string[];
  recommendation: "Review evidence" | "Do not recommend";
};

export function adviseExecutiveDecision(assessment: DecisionAssessment): AtlasDecisionAdvice {
  const allGatesPass = assessment.gates.every((gate) => gate.passed);
  return {
    summary: assessment.summary,
    supportingEvidence: assessment.supportingEvidence,
    confidence: assessment.confidence,
    unknowns: assessment.unknowns,
    alternativeInterpretations: assessment.alternativeInterpretations,
    reasonsFor: assessment.reasonsFor.map((signal) => signal.statement),
    reasonsAgainst: assessment.reasonsAgainst.map((signal) => signal.statement),
    suggestedNextActions: assessment.suggestedNextActions,
    recommendation: assessment.recommendationEligible && allGatesPass ? "Review evidence" : "Do not recommend",
  };
}

export function measureDecisionIntelligence(assessments: readonly DecisionAssessment[]) {
  const percentage = (count: number, total: number) => total ? Math.round(count / total * 1000) / 10 : 0;
  const coveredDomains = new Set(assessments.map((assessment) => assessment.domain));
  const decisionsWithEvidence = assessments.filter((assessment) => assessment.supportingEvidence.length && assessment.supportingEvidence.every((evidence) => evidence.evidenceId));
  const decisionsWithConfidence = assessments.filter((assessment) => assessment.confidence.level !== "Unknown" || assessment.state === "Insufficient Evidence");
  const explained = assessments.filter((assessment) => assessment.summary && assessment.unknowns && assessment.suggestedNextActions.length && assessment.gates.length === 5);
  const trustReady = assessments.filter((assessment) => assessment.gates.find((gate) => gate.gate === "Executive Trust")?.passed && (!assessment.recommendationEligible || assessment.gates.every((gate) => gate.passed)));
  return {
    decisionModelCoverage: percentage(coveredDomains.size, decisionDomainIds.length),
    explainabilityCoverage: percentage(explained.length, assessments.length),
    evidenceTraceability: percentage(decisionsWithEvidence.length, assessments.length),
    confidenceCoverage: percentage(decisionsWithConfidence.length, assessments.length),
    executiveTrustReadiness: percentage(trustReady.length, assessments.length),
    futureIntelligenceLeverage: coveredDomains.size === decisionDomainIds.length ? "High" : coveredDomains.size >= 3 ? "Moderate" : "Foundational",
  };
}
