import type { Opportunity, OpportunityAssessment } from "@/types/opportunity";

export function assessOpportunity(opportunity: Opportunity): OpportunityAssessment {
  const rationale: string[] = [
    `Executive Fit is ${opportunity.executiveFitScore}/100 and Strategic Opportunity is ${opportunity.strategicOpportunityScore}/100.`,
    `Assessment confidence is ${opportunity.confidenceScore}/100.`,
  ];

  if (opportunity.exclusions.length > 0) {
    rationale.push(`${opportunity.exclusions.length} exclusion criterion is present.`);
    return { recommendation: "Do Not Apply", rationale };
  }

  if (opportunity.riskFlags.length >= 3 || opportunity.confidenceScore < 50) {
    rationale.push("Multiple risks or limited confidence require a cautious decision.");
    return { recommendation: "Review Carefully", rationale };
  }

  if (opportunity.executiveFitScore >= 85 && opportunity.strategicOpportunityScore >= 80 && opportunity.riskFlags.length === 0 && opportunity.confidenceScore >= 75) {
    rationale.push("Both core scores clear the strong-apply thresholds with no identified risk flags.");
    return { recommendation: "Strong Apply", rationale };
  }

  if (opportunity.executiveFitScore >= 70 && opportunity.strategicOpportunityScore >= 65 && opportunity.confidenceScore >= 60) {
    rationale.push("Core scores and confidence clear the apply thresholds.");
    return { recommendation: "Apply", rationale };
  }

  rationale.push("One or more core scores remain below the apply thresholds.");
  return { recommendation: "Review Carefully", rationale };
}
