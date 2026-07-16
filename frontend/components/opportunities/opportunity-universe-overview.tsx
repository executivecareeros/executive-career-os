import Link from "next/link";
export type OpportunityExperienceView = "Recommended" | "Discover" | "Search";

const viewCopy: Record<OpportunityExperienceView, { title: string; description: string }> = {
  Recommended: { title: "Recommended", description: "The small set Atlas believes deserves your attention now." },
  Discover: { title: "Discover", description: "Explore every attributable opportunity currently in your universe." },
  Search: { title: "Search", description: "Find roles by company, title, location, source, fit, and executive status." },
};

export function OpportunityUniverseOverview({ activeView, counts, sourceCount, onViewChange }: {
  activeView: OpportunityExperienceView;
  counts: Record<OpportunityExperienceView, number>;
  sourceCount: number;
  onViewChange: (view: OpportunityExperienceView) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,.96),rgba(15,23,42,.72))]" aria-labelledby="universe-heading">
      <div className="p-5 sm:p-6 lg:p-8">
        <div>
          <p className="atlas-kicker">Executive Opportunity Universe</p>
          <h2 id="universe-heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">One universe. A sharper executive shortlist.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Stop checking separate job sites. ORENDALIS brings attributable opportunities into one view, your Blueprint qualifies them, and Atlas explains which deserve attention.</p>
        </div>
      </div>
      <div className="grid border-t border-white/10 sm:grid-cols-3" role="tablist" aria-label="Opportunity universe views">
        {(Object.keys(viewCopy) as OpportunityExperienceView[]).map((view) => {
          const active = activeView === view;
          return <button key={view} type="button" role="tab" aria-selected={active} onClick={() => onViewChange(view)} className={`min-h-32 border-b border-white/10 p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 sm:border-b-0 sm:border-r ${active ? "bg-white/[.08]" : "hover:bg-white/[.04]"}`}>
            <span className={`text-xs font-semibold uppercase tracking-[.16em] ${active ? "text-blue-300" : "text-slate-500"}`}>{viewCopy[view].title}</span>
            <span className="mt-2 block text-2xl font-semibold text-white">{counts[view]}</span>
            <span className="mt-2 block text-xs leading-5 text-slate-400">{viewCopy[view].description}</span>
          </button>;
        })}
      </div>
      <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-slate-500">Current coverage: {sourceCount} {sourceCount === 1 ? "source" : "sources"}. Source attribution remains attached to every opportunity.</p><Link href="/assistant" className="text-sm font-medium text-blue-300 hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Ask Atlas what could change →</Link></div>
    </section>
  );
}
