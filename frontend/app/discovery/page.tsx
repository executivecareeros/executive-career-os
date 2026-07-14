import { DemoDataBanner } from "@/components/opportunities/demo-data-banner";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { SourceCard } from "@/components/discovery/source-card";
import { RunHistoryTable } from "@/components/discovery/run-history-table";
import { StatusBadge } from "@/components/status-badge";
import { demoDiscoveryHealth, demoDiscoveryRuns, demoDiscoverySchedule, demoDiscoverySettings, demoDiscoveryStatistics, demoReliability } from "@/data/discovery-dashboard";
import { discoverySources } from "@/lib/discovery";

export default function DiscoveryPage() {
  const lastRun = demoDiscoveryRuns[0];
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
    <PageHeader title="Opportunity Discovery" description="A source-agnostic control plane for finding, normalizing, and tracing executive opportunities." />
    <div className="mt-6"><DemoDataBanner /></div>
    <SectionCard className="mt-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="atlas-kicker">Coverage engine</p><h2 className="mt-3 text-xl font-semibold">One opportunity universe, continuously reconciled</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Approved providers enter a priority-aware collection queue, pass one validation and normalization pipeline, and reconcile into one canonical opportunity. Source attribution, freshness, lifecycle, quality, retries, and failures remain visible before Atlas evaluates the evidence.</p></div><StatusBadge tone="success">Engine ready</StatusBadge></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Schedule","Priority and refresh policy"],["Normalize","One Opportunity object"],["Reconcile","Cross-source duplicates"],["Observe","Health, freshness and quality"]].map(([title,detail])=><div key={title} className="rounded-xl border border-white/10 bg-slate-950/40 p-4"><p className="font-medium text-white">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>)}</div><p className="mt-4 text-xs text-slate-500">Greenhouse public employer boards are the first approved read-only source. Additional providers remain disabled until separately approved.</p></SectionCard>
    <section className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4" aria-label="Discovery statistics">
      <MetricCard label="Available sources" value={discoverySources.length} />
      <MetricCard label="Mock opportunities" value={demoDiscoveryStatistics.opportunitiesFound} />
      <MetricCard label="Discovery confidence" value={`${demoDiscoveryStatistics.averageConfidence}%`} />
      <MetricCard label="Last discovery run" value={lastRun.id} />
    </section>

    <SectionCard><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold">Provider coverage</h2><p className="mt-2 text-sm text-slate-400">Greenhouse, Lever, and Ashby are production-capable through public employer boards. Other providers remain extension points and never collect data until approved and registered.</p></div><StatusBadge tone="info">3 production connectors</StatusBadge></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{discoverySources.map((source) => <SourceCard key={source.id} source={source} health={demoDiscoveryHealth.find((item) => item.source === source.id)} />)}</div></SectionCard>

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <SectionCard><h2 className="text-xl font-semibold">Discovery Schedule</h2><div className="mt-4 space-y-3">{demoDiscoverySchedule.map((schedule) => <article key={schedule.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/40 p-4"><div><p className="font-medium capitalize text-white">{schedule.source}</p><p className="mt-1 text-sm text-slate-500">{schedule.nextRunAt ? `Next preview: ${new Date(schedule.nextRunAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : "Runs only when requested"}</p></div><StatusBadge tone={schedule.enabled ? "success" : "neutral"}>{schedule.frequency}</StatusBadge></article>)}</div></SectionCard>
      <SectionCard><h2 className="text-xl font-semibold">Source Reliability</h2><div className="mt-4 space-y-3">{demoReliability.map(({ source, reliability }) => <article key={source} className="rounded-xl border border-white/10 bg-slate-950/40 p-4"><div className="flex items-center justify-between gap-4"><p className="font-medium text-white">{source}</p><StatusBadge tone={reliability.score >= 75 ? "success" : "warning"}>{reliability.rating} · {reliability.score}%</StatusBadge></div><p className="mt-2 text-sm text-slate-500">{reliability.rationale}</p></article>)}</div></SectionCard>
    </div>

    <SectionCard className="mt-6"><h2 className="text-xl font-semibold">Discovery Run History</h2><p className="mt-2 text-sm text-slate-400">Demonstration records show the audit shape for future discovery activity.</p><div className="mt-4"><RunHistoryTable runs={demoDiscoveryRuns} /></div></SectionCard>

    <SectionCard className="mt-6"><h2 className="text-xl font-semibold">Discovery Settings</h2><p className="mt-2 text-sm text-slate-400">Per-source controls are previews only and cannot be changed in this sprint.</p><div className="mt-5 grid gap-4 lg:grid-cols-3">{demoDiscoverySettings.map((setting) => <article key={setting.source} className="rounded-xl border border-white/10 bg-slate-950/40 p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-medium capitalize text-white">{setting.source}</h3><StatusBadge tone={setting.enabled ? "success" : "neutral"}>{setting.enabled ? "Enabled" : "Disabled"}</StatusBadge></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Priority</dt><dd className="mt-1 text-slate-200">{setting.priority}</dd></div><div><dt className="text-slate-500">Maximum</dt><dd className="mt-1 text-slate-200">{setting.maximumResults}</dd></div><div><dt className="text-slate-500">Countries</dt><dd className="mt-1 text-slate-200">{setting.filters.countries.join(", ") || "Any"}</dd></div><div><dt className="text-slate-500">Languages</dt><dd className="mt-1 text-slate-200">{setting.filters.languages.join(", ") || "Any"}</dd></div></dl></article>)}</div></SectionCard>

    <p className="mt-6 text-xs text-slate-600">Coverage controls are workspace-isolated. Provider activation, automated scheduling, and production deployment remain explicit operational gates.</p>
  </div>;
}
