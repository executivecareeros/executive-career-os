import { notFound } from "next/navigation";
import { OpportunityDetail } from "@/components/opportunities/opportunity-detail";
import { getOpportunityById, opportunities } from "@/data/opportunities";
import { getCompanyByOpportunityId } from "@/data/companies";

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({ id: opportunity.id }));
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = getOpportunityById(id);
  if (!opportunity) notFound();
  return <OpportunityDetail opportunity={opportunity} company={getCompanyByOpportunityId(id)} />;
}
