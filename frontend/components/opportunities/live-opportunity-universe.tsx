"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SecondaryButton } from "@/components/secondary-button";
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
    <PageHeader eyebrow="Executive Opportunity Universe" title="The opportunities that deserve your attention" description="Discover across sources, search your full universe, and let Atlas explain—not conceal—why an opportunity is recommended." actions={<SecondaryButton href="/">Return to Today</SecondaryButton>} />
    <nav className="mt-8 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]" aria-label="Opportunity views">
      {views.map((item) => <button key={item.name} type="button" onClick={() => setView(item.name)} aria-current={view === item.name ? "page" : undefined} className={`min-h-16 border-r border-white/10 px-3 py-4 text-center transition last:border-r-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 sm:min-h-24 sm:p-5 sm:text-left ${view === item.name ? "bg-white/[.08] shadow-[inset_0_-2px_0_rgba(147,197,253,.8)]" : "hover:bg-white/[.04]"}`}><span className={`text-sm font-semibold sm:text-base ${view === item.name ? "text-white" : "text-slate-300"}`}>{item.name}</span><span className="mt-2 hidden text-xs leading-5 text-slate-500 sm:block">{item.description}</span></button>)}
    </nav>
    {view === "Search" && <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-5"><h2 className="font-semibold">Search your opportunity universe</h2><p className="mt-2 text-sm text-slate-400">Find a role already in your private universe by company, position, location, or source.</p><div className="mt-5 max-w-xl"><SearchInput label="Search opportunities" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a company, position, location, or source" /></div></section>}
    <div className="mt-6">
      {visible ? <LiveOpportunityCard opportunity={opportunity} /> : <EmptyState eyebrow={view} title={view === "Recommended" ? "No recommendation yet" : "No opportunity matches this search"} description={view === "Recommended" ? "Atlas is waiting for enough confirmed evidence. The opportunity remains available in Discover." : "Try a company, position, location, or source already recorded in your universe."} action={view === "Recommended" ? <SecondaryButton onClick={() => setView("Discover")}>Browse all opportunities</SecondaryButton> : <SecondaryButton onClick={() => setQuery("")}>Clear search</SecondaryButton>} />}
    </div>
  </div>;
}
