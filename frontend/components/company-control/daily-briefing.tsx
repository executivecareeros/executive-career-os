import { SectionCard } from "@/components/section-card";
import type { DailyBrief } from "@/lib/company-intelligence";
import { CompanyStatus } from "./company-status";

export function DailyBriefing({ brief }: { brief: DailyBrief }) {
  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="atlas-kicker">Atlas Chief of Staff · {brief.status}</p><h2 className="mt-3 text-2xl font-semibold text-white">{brief.title}</h2><p className="mt-2 text-sm text-slate-400">Evidence-led guidance from the current repository and operational records.</p></div>
        <p className="text-xs text-slate-500">Generated {new Date(brief.generatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" })}</p>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {brief.sections.map((section) => <article key={section.id} className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-medium text-white">{section.title}</h3><CompanyStatus status={section.status}/></div><p className="mt-3 text-sm leading-6 text-slate-400">{section.summary}</p><p className="mt-3 text-xs text-slate-600">Evidence: {section.evidence[0]?.sourceReference}</p></article>)}
      </div>
      <div className="mt-6 border-t border-white/10 pt-5"><h3 className="font-medium text-white">What Atlas Does Not Know</h3><ul className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">{brief.unknowns.map((unknown) => <li key={unknown} className="flex gap-2"><span aria-hidden="true" className="text-slate-600">—</span>{unknown}</li>)}</ul></div>
    </SectionCard>
  );
}
