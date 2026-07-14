"use client";

import { useState } from "react";
import Link from "next/link";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { assessOpportunity } from "@/lib/opportunity-assessment";
import type { Opportunity, OpportunityStatus } from "@/types/opportunity";
import type { Company } from "@/types/company";
import { getApplicationsByOpportunity } from "@/data/applications";
import { compensationForEntity } from "@/data/compensation";
import { ledgerForEntity } from "@/data/career-ledger";
import { CompensationTimeline } from "@/components/compensation/compensation-timeline";
import { LedgerHistoryPanel } from "@/components/archive/ledger-history-panel";
import { DemoDataBanner } from "./demo-data-banner";
import { OpportunityDetailSection } from "./opportunity-detail-section";
import { OpportunityPriorityBadge } from "./opportunity-priority-badge";
import { OpportunityStatusBadge } from "./opportunity-status-badge";
import { RecommendationBadge } from "./recommendation-badge";
import { ScoreIndicator } from "./score-indicator";
import { OpportunityBlueprintAlignment } from "@/components/blueprint/opportunity-alignment";

export function OpportunityDetail({ opportunity, company }: { opportunity: Opportunity; company?: Company }) {
  const [status, setStatus] = useState<OpportunityStatus>(opportunity.status);
  const [notes, setNotes] = useState(opportunity.notes);
  const assessment = assessOpportunity(opportunity);
  const linkedApplications = getApplicationsByOpportunity(opportunity.id);
  const compensation = opportunity.salaryMin && opportunity.salaryMax && opportunity.salaryCurrency ? `${opportunity.salaryCurrency} ${opportunity.salaryMin.toLocaleString("en-GB")}–${opportunity.salaryMax.toLocaleString("en-GB")}` : "Not disclosed in demo data";
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <Link href="/opportunities" className="text-sm text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">← Back to opportunities</Link>
      {company && <Link href={`/companies/${company.id}`} className="ml-4 text-sm text-blue-300 hover:text-blue-200">Open company intelligence →</Link>}
      <header className="mt-6 border-b border-white/10 pb-8">
        <div className="mb-4 text-sm text-slate-400">{linkedApplications.length ? <Link href={`/applications/${linkedApplications[0].id}`} className="text-blue-300">Application exists: {linkedApplications[0].stage} →</Link> : <span>No application exists · Create application (placeholder)</span>}</div>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-semibold text-slate-300">{opportunity.companyInitials}</div><div><p className="text-sm text-slate-400">{opportunity.companyName}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{opportunity.jobTitle}</h1><p className="mt-3 text-slate-400">{opportunity.location} · {opportunity.workArrangement} · {opportunity.employmentType}</p></div></div>
          <div className="flex flex-wrap gap-2"><OpportunityStatusBadge status={status} /><OpportunityPriorityBadge priority={opportunity.priority} /></div>
        </div>
      </header>
      <div className="mt-6"><DemoDataBanner /></div>
      <section className="mt-6 grid gap-5 md:grid-cols-3" aria-label="Score overview"><ScoreIndicator label="Executive Fit Score" score={opportunity.executiveFitScore} /><ScoreIndicator label="Strategic Opportunity Score" score={opportunity.strategicOpportunityScore} /><ScoreIndicator label="Overall Score" score={opportunity.overallScore} /></section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <OpportunityBlueprintAlignment opportunity={opportunity} />
          {company && <OpportunityDetailSection title="Company summary"><p>{company.description}</p><p className="mt-3"><strong className="text-slate-200">Why it matters:</strong> {company.marketPosition}. Current strategic priorities include {company.strategicPriorities.join(", ")}.</p></OpportunityDetailSection>}
          <OpportunityDetailSection title="Why Atlas recommends it"><RecommendationBadge recommendation={assessment.recommendation} /><ul className="mt-4 list-disc space-y-2 pl-5">{assessment.rationale.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-4">{opportunity.decisionRationale}</p></OpportunityDetailSection>
          <OpportunityDetailSection title="Role summary"><p>{opportunity.summary}</p></OpportunityDetailSection>
          <OpportunityDetailSection title="Fit explanation"><ListGroup title="Matching strengths" items={opportunity.matchingStrengths} /><ListGroup title="Missing requirements" items={opportunity.missingRequirements} /><ListGroup title="Risk flags" items={opportunity.riskFlags} empty="No risk flags identified in this demo assessment." /></OpportunityDetailSection>
          <OpportunityDetailSection title="Role requirements"><ListGroup title="Key responsibilities" items={opportunity.keyResponsibilities} /><ListGroup title="Required skills" items={opportunity.requiredSkills} /><ListGroup title="Preferred skills" items={opportunity.preferredSkills} /></OpportunityDetailSection>
          <OpportunityDetailSection title="CV and cover-letter positioning"><p><strong className="text-slate-200">Recommended CV profile:</strong> {opportunity.recommendedCVProfile}</p><p className="mt-3"><strong className="text-slate-200">Cover letter:</strong> {opportunity.coverLetterRecommended ? "Recommended for this demonstration scenario." : "Not currently recommended for this demonstration scenario."}</p></OpportunityDetailSection>
          <OpportunityDetailSection title="Compensation history"><CompensationTimeline records={compensationForEntity(opportunity.id)} title="Opportunity Compensation Timeline" /></OpportunityDetailSection>
          <OpportunityDetailSection title="Career history"><LedgerHistoryPanel entries={ledgerForEntity(opportunity.id)} title="Linked Career Ledger events" /></OpportunityDetailSection>
        </div>
        <div className="space-y-6">
          <OpportunityDetailSection title="Opportunity details"><dl><Definition label="Industry" value={opportunity.industry} /><Definition label="Company size" value={opportunity.companySize} /><Definition label="Compensation" value={compensation} /><Definition label="Travel" value={opportunity.travelRequirement} /><Definition label="Application deadline" value={opportunity.applicationDeadline ?? "Not disclosed"} /><Definition label="Source" value={opportunity.source} /></dl><p className="mt-4 text-xs text-slate-500">Source link placeholder — no live listing is connected.</p></OpportunityDetailSection>
          <OpportunityDetailSection title="Opportunity timeline"><ol className="space-y-4"><li className="border-l border-blue-300/30 pl-4"><p className="font-medium text-slate-200">Discovered</p><p className="mt-1 text-sm">{opportunity.discoveredAt} · {opportunity.source}</p></li><li className="border-l border-blue-300/30 pl-4"><p className="font-medium text-slate-200">Current status</p><p className="mt-1 text-sm">{status}</p></li>{opportunity.applicationDeadline && <li className="border-l border-blue-300/30 pl-4"><p className="font-medium text-slate-200">Application deadline</p><p className="mt-1 text-sm">{opportunity.applicationDeadline}</p></li>}</ol></OpportunityDetailSection>
          <OpportunityDetailSection title="Executive actions"><p className="mb-4">Choose the next evidence-based step for this opportunity.</p><div className="flex flex-wrap gap-2"><PrimaryButton href="/assistant">Review with Atlas</PrimaryButton><SecondaryButton onClick={() => setStatus("Qualified")}>Mark qualified</SecondaryButton><SecondaryButton onClick={() => setStatus("Ready to Apply")}>Ready to apply</SecondaryButton><SecondaryButton onClick={() => setStatus("Archived")}>Archive</SecondaryButton><SecondaryButton onClick={() => setStatus("Rejected")}>Reject</SecondaryButton></div></OpportunityDetailSection>
          <OpportunityDetailSection title="Notes"><label className="block"><span className="sr-only">Opportunity notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={7} placeholder="Add temporary demo notes…" className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 p-3 text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-blue-400" /></label><p className="mt-2 text-xs text-slate-500">Notes are temporary and are not persisted.</p></OpportunityDetailSection>
        </div>
      </div>
    </div>
  );
}

function ListGroup({ title, items, empty }: { title: string; items: string[]; empty?: string }) { return <div className="mt-4 first:mt-0"><h3 className="font-medium text-slate-200">{title}</h3>{items.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2">{empty}</p>}</div>; }
function Definition({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-white/5 py-2"><dt className="text-slate-500">{label}</dt><dd className="text-right text-slate-300">{value}</dd></div>; }
