"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";
import { LiveOpportunityCard } from "./live-opportunity-card";

type UniverseView = "Recommended" | "Discover" | "Search";
const views: Array<{ name: UniverseView; description: string }> = [
  { name: "Recommended", description: "Atlas priorities supported by your confirmed context" },
  { name: "Discover", description: "Every opportunity currently in your private universe" },
  { name: "Search", description: "Find a known role, company, location, or source" },
];

export function LiveOpportunityUniverse({ opportunity }: { opportunity: LiveOpportunityViewModel }) {
  const [view, setView] = useState<UniverseView>(opportunity.atlasAction ? "Recommended" : "Discover");
  const [query, setQuery] = useState("");
  const matches = useMemo(() => `${opportunity.companyName} ${opportunity.title} ${opportunity.location} ${opportunity.source}`.toLowerCase().includes(query.trim().toLowerCase()), [opportunity, query]);
  const visible = view === "Recommended" ? Boolean(opportunity.atlasAction) : view === "Search" ? matches : true;
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
    <PageHeader eyebrow="Executive Opportunity Universe" title="The opportunities that deserve your attention" description="Discover across sources, search your full universe, and let Atlas explain—not conceal—why an opportunity is recommended." />
    <nav className="mt-8 grid overflow-hidden rounded-2xl border border-white/10 bg-white/[.03] md:grid-cols-3" aria-label="Opportunity views">
      {views.map((item) => <button key={item.name} type="button" onClick={() => setView(item.name)} aria-current={view === item.name ? "page" : undefined} className={`min-h-28 border-b border-white/10 p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 md:border-b-0 md:border-r ${view === item.name ? "bg-white/[.08]" : "hover:bg-white/[.04]"}`}><span className={`font-semibold ${view === item.name ? "text-white" : "text-slate-300"}`}>{item.name}</span><span className="mt-2 block text-xs leading-5 text-slate-500">{item.description}</span></button>)}
    </nav>
    {view === "Search" && <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-5"><h2 className="font-semibold">Search your opportunity universe</h2><p className="mt-2 text-sm text-slate-400">Search by company, role, location, or source. Executive filters will expand as verified sources add structured fields.</p><div className="mt-5 max-w-xl"><SearchInput label="Search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company, role, location, or source" /></div></section>}
    <div className="mt-6">
      {visible ? <LiveOpportunityCard opportunity={opportunity} /> : <EmptyState eyebrow={view} title={view === "Recommended" ? "No recommendation yet" : "No opportunity matches this search"} description={view === "Recommended" ? "Atlas is waiting for enough confirmed evidence. The opportunity remains available in Discover." : "Try a company, role, location, or source already recorded in your universe."} />}
    </div>
  </div>;
}
