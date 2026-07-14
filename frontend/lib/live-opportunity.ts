import type { BetaWorkflowView } from "@/lib/beta/types";

const text = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim() : fallback;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const list = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
const reasonLanguage: Record<string, string> = {
  COMPENSATION_BELOW_MINIMUM: "Compensation is below your confirmed minimum",
  TRAVEL_ABOVE_CEILING: "Required travel exceeds your confirmed limit",
  STRATEGIC_FIT_HIGH: "The role shows strong strategic alignment with your Blueprint",
};
const explainReason = (reason: string) => reasonLanguage[reason] ?? reason.replaceAll("_", " ").toLowerCase().replace(/^./, letter => letter.toUpperCase());

export type LiveOpportunityViewModel = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  workModel: string;
  source: string;
  status: string;
  matchScore?: number;
  atlasAction?: string;
  atlasConfidence?: string;
  decisionComplete: boolean;
  executiveDecision?: string;
  roleSummary: string;
  companySummary: string;
  knownFacts: string[];
  unverifiedClaims: string[];
  constraints: string[];
  why: string[];
  questions: string[];
  timeline: Array<{ label: string; detail: string }>;
};

export function executiveDecisionLabel(action?: string) {
  return ({ Apply: "Pursue", Monitor: "Watch", Reject: "Skip" } as Record<string, string>)[action ?? ""] ?? action;
}

export function toLiveOpportunity(view: BetaWorkflowView): LiveOpportunityViewModel | undefined {
  if (!view.opportunity || !view.state.activeOpportunityId) return undefined;
  const reasoning = view.reasoning?.output;
  const decisionComplete = Boolean(view.state.finalizedDecisionId);
  const title = text(view.opportunity.title, "Role title not confirmed");
  const companyName = text(view.opportunity.companyName, "Company not confirmed");
  const knownFacts = list(view.opportunity.knownFacts);
  const questions = reasoning?.questions.map((question) => question.question) ?? [];
  const why = reasoning?.why.filter(Boolean).map(explainReason) ?? [];
  if (reasoning && !why.length) why.push(questions.length ? `Atlas is cautious because ${questions.length} material question${questions.length === 1 ? "" : "s"} remain unresolved` : "The confirmed evidence supports this course without a material rule conflict");
  return {
    id: view.state.activeOpportunityId,
    title,
    companyName,
    location: text(view.opportunity.location, "Location not confirmed"),
    workModel: text(view.opportunity.workModel, "Work model not confirmed"),
    source: text(view.opportunity.source, "Source not confirmed"),
    status: decisionComplete ? `${executiveDecisionLabel(view.selectedDecisionAction) ?? "Decision"} preserved` : reasoning ? "Atlas reviewed" : "Awaiting Atlas review",
    matchScore: number(view.opportunity.overallScore),
    atlasAction: reasoning?.recommendation.action,
    atlasConfidence: reasoning?.confidence,
    decisionComplete,
    executiveDecision: executiveDecisionLabel(view.selectedDecisionAction),
    roleSummary: text(view.opportunity.notes, knownFacts.length ? knownFacts.join(" ") : "Role context is still being confirmed."),
    companySummary: `This briefing currently contains only evidence confirmed for ${companyName}. Leadership, ownership, scale, and market signals remain explicitly unknown until supported by an approved source.`,
    knownFacts,
    unverifiedClaims: list(view.opportunity.unverifiedClaims),
    constraints: list(view.opportunity.constraints),
    why,
    questions,
    timeline: [
      { label: "Opportunity recorded", detail: "Added to your private Opportunity Universe" },
      ...(reasoning ? [{ label: "Atlas assessment", detail: `${reasoning.confidence} confidence` }] : []),
      ...(decisionComplete ? [{ label: "Decision preserved", detail: "Recorded in your decision journey" }] : []),
    ],
  };
}
