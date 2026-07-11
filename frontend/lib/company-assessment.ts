import type { Company, CompanyAssessment } from "@/types/company";
export function assessCompany(company: Company): CompanyAssessment {
  const rationale = [`Company Quality is ${company.companyQualityScore}/100, Strategic Relevance is ${company.strategicRelevanceScore}/100, and Hiring Momentum is ${company.hiringMomentumScore}/100.`, `Relationship strength is ${company.relationshipScore}/100.`];
  if (company.strategicExclusions.length) return { recommendation: "Do Not Pursue", rationale: [...rationale, "A strategic exclusion is present."] };
  if (company.knownRisks.length >= 3) return { recommendation: "Low Priority", rationale: [...rationale, "Three or more known risks constrain the target case."] };
  if (company.companyQualityScore >= 85 && company.strategicRelevanceScore >= 85 && company.hiringMomentumScore >= 70) return { recommendation: "Priority Target", rationale: [...rationale, "Quality, relevance, and momentum clear the priority-target thresholds."] };
  if (company.companyQualityScore >= 75 && company.strategicRelevanceScore >= 75) return { recommendation: "Strong Target", rationale: [...rationale, "Quality and relevance clear the strong-target thresholds."] };
  if (company.strategicRelevanceScore >= 60 || company.hiringMomentumScore >= 60) return { recommendation: "Monitor", rationale: [...rationale, "Relevance or momentum supports continued monitoring."] };
  return { recommendation: "Low Priority", rationale: [...rationale, "Current scores do not clear monitoring thresholds."] };
}
