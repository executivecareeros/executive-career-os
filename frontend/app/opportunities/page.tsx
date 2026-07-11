import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SearchInput } from "@/components/search-input";

const inputClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20";

export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader
        title="Opportunities"
        description="Define your search criteria and discover executive roles aligned with your experience, priorities, and target markets."
      />

      <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4" aria-labelledby="opportunity-filters">
        <h2 id="opportunity-filters" className="sr-only">Opportunity filters</h2>
        <SearchInput label="Title" name="title" placeholder="e.g. Chief Commercial Officer" />
        <SearchInput label="Country" name="country" placeholder="Select a target country" />
        <label className="text-sm text-slate-400">
          Industry
          <select className={inputClassName} name="industry" defaultValue="">
            <option value="">All industries</option>
            <option value="broadcast">Broadcast</option>
            <option value="telecom">Telecommunications</option>
            <option value="software">Enterprise software</option>
            <option value="ai">Artificial intelligence</option>
          </select>
        </label>
        <label className="text-sm text-slate-400">
          Status
          <select className={inputClassName} name="status" defaultValue="">
            <option value="">All statuses</option>
            <option value="discovered">Discovered</option>
            <option value="qualified">Qualified</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </section>

      <EmptyState
        eyebrow="No opportunities yet"
        title="Start your first executive opportunity search"
        description="Your matched roles will appear here after a search. Nothing is shown until real opportunities are available."
        action={<PrimaryButton className="px-5 py-3">Run opportunity search</PrimaryButton>}
      />
    </div>
  );
}
