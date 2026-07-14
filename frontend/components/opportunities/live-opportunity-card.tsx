import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";

export function LiveOpportunityCard({ opportunity }: { opportunity: LiveOpportunityViewModel }) {
  return <article className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-6">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><StatusBadge tone="info">{opportunity.status}</StatusBadge>{opportunity.atlasAction && <StatusBadge tone="success">Atlas: {opportunity.atlasAction}</StatusBadge>}</div>
        <p className="mt-5 text-sm text-blue-300"><Link href="/companies/current" className="hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{opportunity.companyName}</Link></p>
        <h2 className="mt-1 text-xl font-semibold text-white">{opportunity.title}</h2>
        <p className="mt-2 text-sm text-slate-400">{opportunity.location} · {opportunity.workModel}</p>
        <p className="mt-4 text-xs text-slate-500">Source: {opportunity.source}</p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-28 rounded-xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs uppercase tracking-[.14em] text-slate-500">Match score</p>
          <p className="mt-2 text-2xl font-semibold text-white">{opportunity.matchScore === undefined ? "Pending" : `${opportunity.matchScore}%`}</p>
          <p className="mt-1 text-xs text-slate-500">{opportunity.matchScore === undefined ? "Not enough evidence" : "Confirmed context"}</p>
        </div>
        <Link href="/opportunities/current" className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{opportunity.decisionComplete ? "Review decision context" : opportunity.atlasAction ? "Review Atlas recommendation" : "Review opportunity"}</Link>
      </div>
    </div>
  </article>;
}
