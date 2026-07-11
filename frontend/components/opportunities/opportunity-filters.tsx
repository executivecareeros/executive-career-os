import { SearchInput } from "@/components/search-input";
import { SecondaryButton } from "@/components/secondary-button";
import { opportunityPriorities, opportunityStatuses, workArrangements, type OpportunityFiltersState } from "@/types/opportunity";

const controlClass = "mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20";

type Props = { filters: OpportunityFiltersState; industries: string[]; countries: string[]; activeCount: number; onChange: (next: OpportunityFiltersState) => void; onClear: () => void };

export function OpportunityFilters({ filters, industries, countries, activeCount, onChange, onClear }: Props) {
  const update = <K extends keyof OpportunityFiltersState>(key: K, value: OpportunityFiltersState[K]) => onChange({ ...filters, [key]: value });
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5" aria-labelledby="filters-heading">
      <div className="flex items-center justify-between gap-4"><h2 id="filters-heading" className="font-semibold">Filters <span className="text-sm font-normal text-slate-500">({activeCount} active)</span></h2><SecondaryButton onClick={onClear} disabled={activeCount === 0}>Clear all filters</SecondaryButton></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SearchInput label="Keyword" value={filters.keyword} onChange={(event) => update("keyword", event.target.value)} placeholder="Company, title, location…" />
        <Select label="Status" value={filters.status} onChange={(value) => update("status", value as OpportunityFiltersState["status"])} options={opportunityStatuses} />
        <Select label="Industry" value={filters.industry} onChange={(value) => update("industry", value)} options={industries} />
        <Select label="Country" value={filters.country} onChange={(value) => update("country", value)} options={countries} />
        <Select label="Work arrangement" value={filters.workArrangement} onChange={(value) => update("workArrangement", value as OpportunityFiltersState["workArrangement"])} options={workArrangements} />
        <Select label="Priority" value={filters.priority} onChange={(value) => update("priority", value as OpportunityFiltersState["priority"])} options={opportunityPriorities} />
        <Range label="Minimum Executive Fit" value={filters.minimumExecutiveFitScore} onChange={(value) => update("minimumExecutiveFitScore", value)} />
        <Range label="Minimum Strategic Score" value={filters.minimumStrategicScore} onChange={(value) => update("minimumStrategicScore", value)} />
      </div>
    </section>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="text-sm text-slate-400">{label}<select className={controlClass} value={value} onChange={(event) => onChange(event.target.value)}><option value="">All</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function Range({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="text-sm text-slate-400">{label}: <span className="text-white">{value}</span><input className="mt-4 w-full accent-blue-400" type="range" min="0" max="100" step="10" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
