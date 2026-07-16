import Link from "next/link";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { StatusBadge } from "@/components/status-badge";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";
import { OpportunityDetailSection } from "./opportunity-detail-section";

export function LiveOpportunityDetail({ opportunity }: { opportunity: LiveOpportunityViewModel }) {
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
    <div className="flex flex-wrap gap-4 text-sm"><Link href="/" className="text-slate-400 hover:text-white">← Today</Link><Link href="/opportunities" className="text-slate-400 hover:text-white">Opportunity Universe</Link><Link href="/companies/current" className="text-blue-300 hover:text-blue-200">Company Intelligence →</Link></div>
    <header className="mt-6 border-b border-white/10 pb-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-sm text-blue-300">{opportunity.companyName}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{opportunity.title}</h1><p className="mt-3 text-slate-400">{opportunity.location} · {opportunity.workModel} · Verified opportunity evidence</p></div><div className="flex flex-wrap gap-2"><StatusBadge tone="info">{opportunity.status}</StatusBadge>{opportunity.atlasAction && <StatusBadge tone="success">Atlas: {opportunity.atlasAction}</StatusBadge>}</div></div></header>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <div className="space-y-6">
        <OpportunityDetailSection title="Company summary"><p>{opportunity.companySummary}</p></OpportunityDetailSection>
        <OpportunityDetailSection title="Role summary"><p>{opportunity.roleSummary}</p></OpportunityDetailSection>
        <OpportunityDetailSection title="Why Atlas recommends it">{opportunity.atlasAction ? <><p><strong className="text-white">{opportunity.atlasAction}</strong> · {opportunity.atlasConfidence} confidence</p><List items={opportunity.why} empty="Atlas has not recorded a concise reason code. Review the confirmed evidence and open questions below." /></> : <p>Atlas has not made a recommendation. More confirmed evidence is required.</p>}</OpportunityDetailSection>
        <OpportunityDetailSection title="Match explanation"><List title="Confirmed facts" items={opportunity.knownFacts} empty="No confirmed role facts are recorded yet."/><List title="Constraints" items={opportunity.constraints} empty="No constraints are recorded for this opportunity."/><List title="Unverified claims" items={opportunity.unverifiedClaims} empty="No unverified claims are recorded."/></OpportunityDetailSection>
      </div>
      <div className="space-y-6">
        <OpportunityDetailSection title="Match score"><p className="text-3xl font-semibold text-white">{opportunity.matchScore === undefined ? "Pending" : `${opportunity.matchScore}%`}</p><p className="mt-2">{opportunity.matchScore === undefined ? "ORENDALIS will not invent a score before enough comparable evidence exists." : "Derived from the confirmed decision context."}</p></OpportunityDetailSection>
        <OpportunityDetailSection title="Opportunity timeline"><ol className="space-y-4">{opportunity.timeline.map((event, index) => <li key={`${event.label}-${index}`} className="border-l border-blue-300/30 pl-4"><p className="font-medium text-slate-200">{event.label}</p><p className="mt-1 text-sm text-slate-400">{event.detail}</p></li>)}</ol></OpportunityDetailSection>
        <OpportunityDetailSection title="Your next decision"><p className="mb-4 text-sm text-slate-400">{opportunity.decisionComplete ? `You chose to ${opportunity.executiveDecision ?? "act"}. Atlas will keep this decision connected to the evidence and next action.` : opportunity.atlasAction ? "Review the company context, then choose whether to Pursue, Watch, or Skip this opportunity." : "Review the company context and ask Atlas to assess the evidence before choosing your next action."}</p><div className="flex flex-col gap-3">{opportunity.decisionComplete ? <PrimaryButton href="/archive">Review preserved decision</PrimaryButton> : <PrimaryButton href="/companies/current">Review Company Intelligence</PrimaryButton>}{!opportunity.decisionComplete && <SecondaryButton href="/beta-workflow#assessment">{opportunity.atlasAction ? "Choose Pursue, Watch, or Skip" : "Ask Atlas to assess"}</SecondaryButton>}<SecondaryButton href="/assistant">Review with Atlas</SecondaryButton></div></OpportunityDetailSection>
        <OpportunityDetailSection title="Questions that could change the decision"><List items={opportunity.questions} empty="No open Atlas questions are currently recorded." /></OpportunityDetailSection>
      </div>
    </div>
  </div>;
}

function List({ title, items, empty }: { title?: string; items: string[]; empty: string }) { return <div className="mt-4 first:mt-0">{title && <h3 className="font-medium text-slate-200">{title}</h3>}{items.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-slate-400">{empty}</p>}</div>; }
