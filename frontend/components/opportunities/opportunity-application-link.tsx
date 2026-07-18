import type { Opportunity } from "@/types/opportunity";

export function OpportunityApplicationLink({ opportunity, className }: { opportunity: Opportunity; className: string }) {
  if (!opportunity.sourceUrl) return null;
  const unverified = opportunity.verificationStatus === "Unverified LinkedIn observation";
  return <a href={opportunity.sourceUrl} target="_blank" rel="noopener noreferrer" className={className}>{unverified ? "Open source listing ↗" : "Apply on employer site ↗"}</a>;
}
