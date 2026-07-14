import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";

export function LiveCompanyProfile({ opportunity }: { opportunity: LiveOpportunityViewModel }) {
  return <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-10">
    <Link href="/opportunities/current" className="text-sm text-slate-400 hover:text-white">← Back to opportunity</Link>
    <div className="mt-6"><PageHeader eyebrow="Company Intelligence" title={opportunity.companyName} description="A company profile grounded in confirmed opportunity evidence. Unknowns remain visible until approved sources or executive research add support." /></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <SectionCard><p className="atlas-kicker">Company summary</p><p className="mt-3 text-sm leading-6 text-slate-300">{opportunity.companySummary}</p></SectionCard>
      <SectionCard><p className="atlas-kicker">Current opportunity</p><h2 className="mt-3 text-xl font-semibold">{opportunity.title}</h2><p className="mt-2 text-sm text-slate-400">{opportunity.location} · {opportunity.workModel}</p><Link href="/opportunities/current" className="mt-5 inline-flex text-sm font-medium text-blue-300 hover:text-blue-200">Review opportunity →</Link></SectionCard>
      <SectionCard><p className="atlas-kicker">Known from the source</p>{opportunity.knownFacts.length ? <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">{opportunity.knownFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul> : <p className="mt-3 text-sm text-slate-400">No confirmed company facts are available from this opportunity yet.</p>}</SectionCard>
      <SectionCard><p className="atlas-kicker">Intelligence still needed</p><p className="mt-3 text-sm leading-6 text-slate-400">Leadership, ownership, scale, market position, culture, and current company signals remain unconfirmed. Orendalis will not present assumptions as intelligence.</p></SectionCard>
    </div>
  </div>;
}
