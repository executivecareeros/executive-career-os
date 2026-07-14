import type { BetaWorkflowView } from "@/lib/beta/types";

const text = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim() : fallback;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const list = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];

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
  roleSummary: string;
  companySummary: string;
  knownFacts: string[];
  unverifiedClaims: string[];
  constraints: string[];
  why: string[];
  questions: string[];
  timeline: Array<{ label: string; detail: string }>;
};

export function toLiveOpportunity(view: BetaWorkflowView): LiveOpportunityViewModel | undefined {
  if (!view.opportunity || !view.state.activeOpportunityId) return undefined;
  const reasoning = view.reasoning?.output;
  const decisionComplete = Boolean(view.state.finalizedDecisionId);
  const title = text(view.opportunity.title, "Role title not confirmed");
  const companyName = text(view.opportunity.companyName, "Company not confirmed");
  const knownFacts = list(view.opportunity.knownFacts);
  const why = reasoning?.why.filter(Boolean) ?? [];
  return {
    id: view.state.activeOpportunityId,
    title,
    companyName,
    location: text(view.opportunity.location, "Location not confirmed"),
    workModel: text(view.opportunity.workModel, "Work model not confirmed"),
    source: text(view.opportunity.source, "Source not confirmed"),
    status: decisionComplete ? "Decision preserved" : reasoning ? "Atlas reviewed" : "Awaiting Atlas review",
    matchScore: number(view.opportunity.overallScore),
    atlasAction: reasoning?.recommendation.action,
    atlasConfidence: reasoning?.confidence,
    decisionComplete,
    roleSummary: text(view.opportunity.notes, knownFacts.length ? knownFacts.join(" ") : "Role context is still being confirmed."),
    companySummary: `Company intelligence for ${companyName} will grow only from confirmed opportunity evidence and future approved sources.`,
    knownFacts,
    unverifiedClaims: list(view.opportunity.unverifiedClaims),
    constraints: list(view.opportunity.constraints),
    why,
    questions: reasoning?.questions.map((question) => question.question) ?? [],
    timeline: [
      { label: "Opportunity recorded", detail: "Added to your private Opportunity Universe" },
      ...(reasoning ? [{ label: "Atlas assessment", detail: `${reasoning.confidence} confidence` }] : []),
      ...(decisionComplete ? [{ label: "Decision preserved", detail: "Recorded in your decision journey" }] : []),
    ],
  };
}
