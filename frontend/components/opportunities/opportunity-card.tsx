import Link from "next/link";
import { assessOpportunity } from "@/lib/opportunity-assessment";
import type { Opportunity } from "@/types/opportunity";
import { OpportunityPriorityBadge } from "./opportunity-priority-badge";
import { OpportunityStatusBadge } from "./opportunity-status-badge";
import { RecommendationBadge } from "./recommendation-badge";
import { ScoreIndicator } from "./score-indicator";
import { getCompanyByOpportunityId } from "@/data/companies";

export function OpportunityCard({ opportunity, view }: { opportunity: Opportunity; view: "grid" | "list" }) {
  const assessment = assessOpportunity(opportunity);
  const companyId = opportunity.companyId ?? getCompanyByOpportunityId(opportunity.id)?.id;
  return (
    <article className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 ${view === "list" ? "xl:grid xl:grid-cols-[1.2fr_1fr_auto] xl:items-center xl:gap-8" : ""}`}>
      <div>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-xs font-semibold text-slate-300" aria-hidden="true">{opportunity.companyInitials}</div>
          <div className="min-w-0">
            <p className="text-sm text-slate-400"><Link href={companyId ? `/companies/${companyId}` : "/companies"} className="text-blue-300 hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{opportunity.companyName}</Link></p>
            <h2 className="mt-1 text-lg font-semibold text-white">{opportunity.jobTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">{opportunity.location} · {opportunity.workArrangement} · {opportunity.industry}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><OpportunityStatusBadge status={opportunity.status} /><OpportunityPriorityBadge priority={opportunity.priority} /></div>
        <p className="mt-4 text-sm leading-6 text-slate-400">{opportunity.decisionRationale}</p><p className="mt-3 text-xs text-slate-500">Source: {opportunity.source}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:mt-0">
        <ScoreIndicator compact label="Overall Match" score={opportunity.overallScore} />
        <ScoreIndicator compact label="Evidence Confidence" score={opportunity.confidenceScore} />
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <RecommendationBadge recommendation={assessment.recommendation} />
          <span className="text-xs text-slate-500">Published {new Date(`${opportunity.publishedAt}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>
      <div className="mt-6 xl:mt-0 xl:text-right">
        <Link href={`/opportunities/${opportunity.id}`} className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Review opportunity</Link>
      </div>
    </article>
  );
}
