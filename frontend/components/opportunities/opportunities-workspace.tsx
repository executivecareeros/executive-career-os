"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SecondaryButton } from "@/components/secondary-button";
import { StatCard } from "@/components/stat-card";
import { countActiveFilters, defaultOpportunityFilters, filterOpportunities, sortOpportunities } from "@/lib/opportunity-filters";
import type { Opportunity, OpportunityFiltersState, OpportunitySort } from "@/types/opportunity";
import { DemoDataBanner } from "./demo-data-banner";
import { OpportunityCard } from "./opportunity-card";
import { OpportunityFilters } from "./opportunity-filters";

const sortOptions: { value: OpportunitySort; label: string }[] = [
  { value: "newest", label: "Newest" }, { value: "overall", label: "Highest overall score" },
  { value: "executiveFit", label: "Highest Executive Fit" }, { value: "strategic", label: "Highest Strategic Opportunity" },
  { value: "company", label: "Company name" }, { value: "deadline", label: "Application deadline" },
];

export function OpportunitiesWorkspace({ opportunities }: { opportunities: Opportunity[] }) {
  const [filters, setFilters] = useState<OpportunityFiltersState>(defaultOpportunityFilters);
  const [sort, setSort] = useState<OpportunitySort>("overall");
  const [view, setView] = useState<"grid" | "list">("list");
  const activeCount = countActiveFilters(filters);
  const visible = useMemo(() => sortOpportunities(filterOpportunities(opportunities, filters), sort), [opportunities, filters, sort]);
  const industries = useMemo(() => [...new Set(opportunities.map((item) => item.industry))].sort(), [opportunities]);
  const countries = useMemo(() => [...new Set(opportunities.map((item) => item.country))].sort(), [opportunities]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader title="Opportunities" description="Discover, assess, and manage executive career opportunities through a transparent decision framework." />
      <div className="mt-6"><DemoDataBanner /></div>
      <section className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4" aria-label="Opportunity metrics">
        <StatCard label="Total opportunities" value={opportunities.length} note="Demo scenarios" />
        <StatCard label="Qualified" value={opportunities.filter((item) => item.status === "Qualified").length} note="Assessment complete" />
        <StatCard label="High priority" value={opportunities.filter((item) => item.priority === "High").length} note="Requires attention" />
        <StatCard label="Applications ready" value={opportunities.filter((item) => item.status === "Ready to Apply").length} note="Demo workflow" />
      </section>
      <OpportunityFilters filters={filters} industries={industries} countries={countries} activeCount={activeCount} onChange={setFilters} onClear={() => setFilters(defaultOpportunityFilters)} />
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-slate-400" aria-live="polite">Showing <strong className="text-white">{visible.length}</strong> of {opportunities.length} opportunities</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-slate-400">Sort by<select className="ml-2 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-400" value={sort} onChange={(event) => setSort(event.target.value as OpportunitySort)}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <div className="flex rounded-lg border border-white/10 p-1" aria-label="Opportunity view">
            <ViewButton active={view === "list"} onClick={() => setView("list")}>List</ViewButton>
            <ViewButton active={view === "grid"} onClick={() => setView("grid")}>Grid</ViewButton>
          </div>
        </div>
      </div>
      {visible.length === 0 ? <EmptyState eyebrow="No matching demo data" title="No opportunities match these filters" description="Adjust or clear the active filters to see demonstration opportunities." action={<SecondaryButton onClick={() => setFilters(defaultOpportunityFilters)}>Clear all filters</SecondaryButton>} /> : <div className={view === "grid" ? "grid gap-5 xl:grid-cols-2" : "space-y-5"}>{visible.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} view={view} />)}</div>}
    </div>
  );
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-md px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}>{children}</button>;
}
