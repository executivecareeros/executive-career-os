import { ActivityCard } from "@/components/activity-card";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";

const metrics = [
  { label: "New Opportunities", value: "0", note: "Today" },
  { label: "Qualified Roles", value: "0", note: "AI screened" },
  { label: "Applications", value: "0", note: "This week" },
  { label: "Interviews", value: "0", note: "Active" },
];

const pipeline = [
  { label: "Discovered", value: 0 },
  { label: "Scored", value: 0 },
  { label: "Ready", value: 0 },
  { label: "Applied", value: 0 },
  { label: "Interview", value: 0 },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Good afternoon, Cüneyt"
        title="Executive dashboard"
        description="Track opportunities, applications, companies, and AI recommendations from one place."
        actions={
          <>
            <SecondaryButton href="/reports">View report</SecondaryButton>
            <PrimaryButton href="/opportunities">Run career agent</PrimaryButton>
          </>
        }
      />

      <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4" aria-label="Career metrics">
        {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SectionCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Today&apos;s executive brief</p>
              <h2 className="mt-2 text-2xl font-semibold">Your search is ready to begin.</h2>
            </div>
            <StatusBadge tone="info">AI brief</StatusBadge>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <ActivityCard title="Market signal" description="No market data yet. The first search run will identify active sectors and regions." />
            <ActivityCard title="Recommended focus" description="Prioritize senior commercial roles in broadcast, telecom, enterprise software, and AI." />
            <ActivityCard title="Next action" description="Connect the opportunity database and run the first scoring workflow." />
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="text-sm font-normal text-slate-400">Top opportunity</h2>
          <div className="mt-8 flex min-h-52 items-center justify-center rounded-xl border border-dashed border-white/15">
            <p className="max-w-xs text-center text-sm leading-6 text-slate-500">The strongest opportunity will appear here after the first AI scoring run.</p>
          </div>
        </SectionCard>
      </div>

      <SectionCard className="mt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-400">Opportunity pipeline</p>
            <h2 className="mt-2 text-2xl font-semibold">Executive application flow</h2>
          </div>
          <p className="text-sm text-slate-500">Discover → Score → Prepare → Apply → Interview</p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {pipeline.map((stage) => <MetricCard key={stage.label} {...stage} />)}
        </div>
      </SectionCard>
    </div>
  );
}
