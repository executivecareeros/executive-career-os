import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { SectionCard } from "@/components/section-card";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";

export function LiveCompanyProfile({ opportunity }: { opportunity: LiveOpportunityViewModel }) {
  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-10">
    <Link href="/opportunities/current" className="text-sm text-slate-400 hover:text-white">← Back to opportunity</Link>
    <div className="mt-6"><PageHeader eyebrow="Company Intelligence" title={opportunity.companyName} description="Understand the company behind this opportunity before committing your time, reputation, or negotiating position." actions={<><SecondaryButton href="/opportunities/current">Return to opportunity</SecondaryButton><PrimaryButton href={opportunity.decisionComplete ? "/archive" : "/beta-workflow#assessment"}>{opportunity.decisionComplete ? "Open Career Ledger" : "Continue decision"}</PrimaryButton></>} /></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <SectionCard><p className="atlas-kicker">Company summary</p><p className="mt-3 text-sm leading-6 text-slate-300">{opportunity.companySummary}</p></SectionCard>
      <SectionCard><p className="atlas-kicker">Current opportunity</p><h2 className="mt-3 text-xl font-semibold">{opportunity.title}</h2><p className="mt-2 text-sm text-slate-400">{opportunity.location} · {opportunity.workModel}</p><Link href="/opportunities/current" className="mt-5 inline-flex text-sm font-medium text-blue-300 hover:text-blue-200">Review opportunity →</Link></SectionCard>
      <SectionCard><p className="atlas-kicker">Known from the source</p>{opportunity.knownFacts.length ? <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">{opportunity.knownFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul> : <p className="mt-3 text-sm text-slate-400">No confirmed company facts are available from this opportunity yet.</p>}</SectionCard>
      <SectionCard><p className="atlas-kicker">Intelligence still needed</p><p className="mt-3 text-sm leading-6 text-slate-400">Leadership, ownership, scale, market position, culture, and current company signals remain unconfirmed. ORENDALIS will not present assumptions as intelligence.</p></SectionCard>
    </div>
    <SectionCard className="mt-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="atlas-kicker">Next executive decision</p><h2 className="mt-3 text-xl font-semibold">Return to the opportunity with company context in view</h2><p className="mt-2 text-sm text-slate-400">Atlas keeps confirmed company evidence connected to the same decision journey.</p></div><PrimaryButton href="/opportunities/current">Return to opportunity</PrimaryButton></div></SectionCard>
  </div>;
}
