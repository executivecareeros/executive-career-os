"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SecondaryButton } from "@/components/secondary-button";
import { SearchInput } from "@/components/search-input";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";
import { LiveOpportunityCard } from "./live-opportunity-card";
import type { Opportunity } from "@/types/opportunity";
import { assessOpportunityFreshness } from "@/lib/opportunity-universe";

type UniverseView = "Recommended" | "Discover" | "Search";
const views: Array<{ name: UniverseView; description: string }> = [
  { name: "Recommended", description: "Atlas priorities supported by your confirmed context" },
  { name: "Discover", description: "Every opportunity currently in your private universe" },
  { name: "Search", description: "Find a known role, company, location, or source" },
];

export function LiveOpportunityUniverse({ opportunity, collected, collectionNotice, collectionMessage, imported, found, collectionAction }: { opportunity?: LiveOpportunityViewModel; collected: Opportunity[]; collectionNotice?: string; collectionMessage?: string; imported?: string; found?: string; collectionAction: (formData: FormData) => void | Promise<void> }) {
  const [view, setView] = useState<UniverseView>(opportunity?.atlasAction ? "Recommended" : "Discover");
  const [query, setQuery] = useState("");
  const matchesLive = useMemo(() => opportunity ? `${opportunity.companyName} ${opportunity.title} ${opportunity.location} ${opportunity.source}`.toLowerCase().includes(query.trim().toLowerCase()) : false, [opportunity, query]);
  const collectedVisible = useMemo(() => collected.filter((item) => view !== "Recommended" && (view !== "Search" || `${item.companyName} ${item.jobTitle} ${item.location} ${item.source}`.toLowerCase().includes(query.trim().toLowerCase()))), [collected, query, view]);
  const visibleLive = opportunity && (view === "Recommended" ? Boolean(opportunity.atlasAction) : view === "Search" ? matchesLive : true);
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
    <PageHeader eyebrow="Executive Opportunity Universe" title="The opportunities that deserve your attention" description="Discover across sources, search your full universe, and let Atlas explain—not conceal—why an opportunity is recommended." actions={<SecondaryButton href="/">Return to Today</SecondaryButton>} />
    <nav className="mt-8 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]" aria-label="Opportunity views">
      {views.map((item) => <button key={item.name} type="button" onClick={() => setView(item.name)} aria-current={view === item.name ? "page" : undefined} className={`min-h-16 border-r border-white/10 px-3 py-4 text-center transition last:border-r-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 sm:min-h-24 sm:p-5 sm:text-left ${view === item.name ? "bg-white/[.08] shadow-[inset_0_-2px_0_rgba(147,197,253,.8)]" : "hover:bg-white/[.04]"}`}><span className={`text-sm font-semibold sm:text-base ${view === item.name ? "text-white" : "text-slate-300"}`}>{item.name}</span><span className="mt-2 hidden text-xs leading-5 text-slate-500 sm:block">{item.description}</span></button>)}
    </nav>
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="atlas-kicker">Opportunity coverage</p><h2 className="mt-2 font-semibold text-white">Add an employer&apos;s published opportunities</h2><p className="mt-2 max-w-2xl text-sm text-slate-400">Paste a company careers URL. Orendalis identifies an approved source, preserves its evidence, and updates one canonical opportunity when the same role is observed again.</p></div><form action={collectionAction} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="greenhouse-board">Company careers URL</label><input id="greenhouse-board" name="board" required placeholder="Company careers URL" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-400"/><button className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200">Refresh roles</button></form></div>{collectionNotice && <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${collectionNotice === "complete" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-rose-400/20 bg-rose-400/10 text-rose-200"}`} role="status">{collectionNotice === "complete" ? `${found ?? "0"} published roles observed; ${imported ?? "0"} new or changed opportunities preserved.` : collectionMessage ?? "The careers source could not be refreshed."}</p>}</section>
    {view === "Search" && <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-5"><h2 className="font-semibold">Search your opportunity universe</h2><p className="mt-2 text-sm text-slate-400">Find a role already in your private universe by company, position, location, or source.</p><div className="mt-5 max-w-xl"><SearchInput label="Search opportunities" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a company, position, location, or source" /></div></section>}
    <div className="mt-6">
      {opportunity && visibleLive && <LiveOpportunityCard opportunity={opportunity} />}
      {collectedVisible.length > 0 && <div className="mt-5 grid gap-5 xl:grid-cols-2">{collectedVisible.map((item) => <CollectedOpportunityCard key={item.id} opportunity={item} />)}</div>}
      {!visibleLive && !collectedVisible.length && <EmptyState eyebrow={view} title={view === "Recommended" ? "No recommendation yet" : "No opportunity matches this search"} description={view === "Recommended" ? "Atlas is waiting for enough confirmed evidence. Published opportunities remain available in Discover until your confirmed context supports a recommendation." : "Try a company, position, location, or source already recorded in your universe."} action={view === "Recommended" ? <SecondaryButton onClick={() => setView("Discover")}>Browse all opportunities</SecondaryButton> : <SecondaryButton onClick={() => setQuery("")}>Clear search</SecondaryButton>} />}
    </div>
  </div>;
}

function CollectedOpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const freshness = assessOpportunityFreshness(opportunity);
  return <article className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-6"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-xs font-semibold text-slate-300">{opportunity.companyInitials}</div><div><p className="text-sm text-blue-300">{opportunity.companyName}</p><h2 className="mt-1 text-lg font-semibold text-white">{opportunity.jobTitle}</h2><p className="mt-2 text-sm text-slate-500">{opportunity.location} · {opportunity.workArrangement}</p></div></div><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{opportunity.summary || "The employer has published this role. Open the source to review the confirmed description."}</p><div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{opportunity.sources?.length ?? 1} verified source{(opportunity.sources?.length ?? 1) === 1 ? "" : "s"}</span><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-200">{freshness.status} · observed {freshness.ageHours}h ago</span></div><div className="mt-5 flex flex-wrap gap-3">{opportunity.sourceUrl && <a href={opportunity.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200">Review published role</a>}<span className="self-center text-xs text-slate-500">Atlas recommendation pending confirmed Blueprint fit</span></div></article>;
}
