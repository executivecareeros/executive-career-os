import type { ExecutiveOpportunityIntelligence } from "@/lib/opportunity-intelligence";
import type { DecisionAssessment, DecisionGateResult, DecisionSignal } from "./executive-decision-intelligence.ts";
import type { WorkspaceEvidence } from "./atlas-decision-workspace.ts";

const hash = (value: string) => {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return (result >>> 0).toString(36);
};

const evidenceId = (label: string, source: string) => `product-evidence:${hash(`${label}|${source}`)}`;
const gate = (name: DecisionGateResult["gate"], passed: boolean, explanation: string): DecisionGateResult => ({ gate: name, passed, explanation });

export function buildProductOpportunityAssessment(
  intelligence: ExecutiveOpportunityIntelligence,
  observedAt: string,
  reviewedWorkspaceEvidence: readonly WorkspaceEvidence[] = [],
): DecisionAssessment {
  const supported = intelligence.evidence.filter((item) => item.certainty !== "Unknown");
  const supportingEvidence: DecisionAssessment["supportingEvidence"] = [
    ...supported.map((item) => ({
      evidenceId: evidenceId(item.label, item.source),
      source: item.source,
      observedAt,
      confidence: {
        score: item.certainty === "Confirmed" ? 90 : 65,
        rating: item.certainty === "Confirmed" ? "Very High" as const : "Moderate" as const,
        basis: `${item.certainty} product evidence: ${item.label}`,
      },
    })),
    ...reviewedWorkspaceEvidence.map((item) => ({
      evidenceId: item.id,
      source: item.reference,
      observedAt: item.reviewedAt ?? item.addedAt,
      confidence: { score: 75, rating: "High" as const, basis: `Evidence reviewed by ${item.reviewedBy ?? "the executive"}.` },
    })),
  ];
  const citedIds = supportingEvidence.map((item) => item.evidenceId);
  const signals = (values: readonly string[], direction: DecisionSignal["direction"], prefix: string): DecisionSignal[] =>
    values.map((statement, index) => ({ id: `${prefix}:${hash(`${statement}|${index}`)}`, direction, statement, evidenceIds: citedIds }));
  const confidenceSupported = intelligence.atlasConfidence.score >= 45;
  const decisionSupported = intelligence.recommendation !== "Research" && intelligence.recommendation !== "Deprioritize";
  const gates: DecisionGateResult[] = [
    gate("Decision Quality", decisionSupported, decisionSupported ? "The current evidence supports a bounded next-step recommendation." : "Decision-critical gaps or conflicts require investigation."),
    gate("Explainability", true, "The review exposes evidence, strengths, concerns, and Unknowns separately."),
    gate("Evidence", supportingEvidence.length > 0, supportingEvidence.length ? "Every decision signal cites product or reviewed workspace evidence." : "No traceable evidence is available."),
    gate("Confidence", confidenceSupported, confidenceSupported ? "The deterministic confidence floor is met." : "Confidence remains below the recommendation threshold."),
    gate("Executive Trust", true, "Unknowns remain visible and Atlas performs no executive action."),
  ];
  const recommendationEligible = gates.every((item) => item.passed);
  return {
    version: "orion-decision-intelligence-v1",
    domain: "Opportunity Intelligence",
    focusEntityId: intelligence.opportunityId,
    state: recommendationEligible ? "Decision Support Available" : "Insufficient Evidence",
    summary: intelligence.guidance,
    supportingEvidence,
    confidence: { level: intelligence.atlasConfidence.level, score: intelligence.atlasConfidence.score, method: intelligence.atlasConfidence.explanation },
    knownFacts: supported.map((item) => `${item.label}: ${item.value}`),
    unknowns: intelligence.missingInformation,
    alternativeInterpretations: intelligence.concerns.length ? ["The identified concerns may materially change the opportunity assessment when verified."] : [],
    reasonsFor: signals(intelligence.strengths, "For", "strength"),
    reasonsAgainst: signals(intelligence.concerns, "Against", "concern"),
    context: signals(reviewedWorkspaceEvidence.map((item) => item.statement), "Context", "workspace"),
    suggestedNextActions: intelligence.missingInformation.length ? intelligence.missingInformation.map((item) => `Verify ${item.toLowerCase()}.`) : ["Review the evidence before recording an executive decision."],
    gates,
    recommendationEligible,
  };
}
