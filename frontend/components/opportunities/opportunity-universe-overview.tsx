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
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.3fr_.7fr] lg:p-8">
        <div>
          <p className="atlas-kicker">Executive Opportunity Universe</p>
          <h2 id="universe-heading" className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">One universe. A sharper executive shortlist.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Orendalis brings attributable opportunities into one view. Your Blueprint qualifies them; Atlas explains which deserve attention. Coverage is always shown, never implied.</p>
        </div>
        <div className="rounded-xl border border-blue-300/20 bg-blue-400/[.07] p-5">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-300">Atlas entry point</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">Review recommendations, unresolved questions, and what could change the ranking.</p>
          <Link href="/assistant" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Open Atlas guidance</Link>
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
      <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-500 sm:px-6">Current coverage: {sourceCount} {sourceCount === 1 ? "source" : "sources"}. Source attribution remains attached to every opportunity.</p>
    </section>
  );
}
