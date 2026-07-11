import { DashboardSection } from "@/components/dashboard-section";
import { DemoDataBanner } from "@/components/opportunities/demo-data-banner";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { MetricCard } from "@/components/metric-card";
import { opportunities } from "@/data/opportunities";

export default function Home() {
  const qualified = opportunities.filter((item) => item.status === "Qualified").length;
  const ready = opportunities.filter((item) => item.status === "Ready to Apply").length;
  const topOpportunity = [...opportunities].sort((a, b) => b.overallScore - a.overallScore)[0];
  const pipelineStages = ["Discovered", "Evaluating", "Qualified", "Ready to Apply", "Applied", "Interview"] as const;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader eyebrow="Good afternoon, Cüneyt" title="Executive dashboard" description="Your command center for executive career intelligence, relationships, and search momentum." actions={<><SecondaryButton href="/reports">View reports</SecondaryButton><PrimaryButton href="/opportunities">Explore opportunities</PrimaryButton></>} />
      <div className="mt-6"><DemoDataBanner /></div>
      <div className="grid gap-6 py-8 xl:grid-cols-2">
        <DashboardSection title="Today&apos;s Executive Brief" description="A focused view of the intelligence that needs your attention today." emptyTitle="No verified brief available" emptyDescription="A brief will appear when connected intelligence sources are available." />
        <SectionCard>
          <h2 className="text-xl font-semibold">Executive Metrics</h2><p className="mt-2 text-sm text-slate-400">Counts derived from the shared local demonstration dataset.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3"><StatCard label="Total opportunities" value={opportunities.length} /><StatCard label="Qualified" value={qualified} /><StatCard label="Ready to apply" value={ready} /></div>
        </SectionCard>
        <DashboardSection title="Recent Activity" description="The latest meaningful changes across opportunities, relationships, and applications." emptyTitle="No persisted activity" emptyDescription="Demo changes are temporary, so no activity history is recorded." />
        <SectionCard>
          <h2 className="text-xl font-semibold">Top-ranked opportunity</h2><p className="mt-2 text-sm text-slate-400">Highest overall score in the demonstration dataset.</p>
          <div className="mt-6"><OpportunityCard opportunity={topOpportunity} view="grid" /></div>
        </SectionCard>
        <SectionCard className="xl:col-span-2">
          <h2 className="text-xl font-semibold">Opportunity Pipeline</h2><p className="mt-2 text-sm text-slate-400">Demo opportunities by workflow stage.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{pipelineStages.map((stage) => <MetricCard key={stage} label={stage} value={opportunities.filter((item) => item.status === stage).length} />)}</div>
        </SectionCard>
        <DashboardSection className="xl:col-span-2" title="Quick Actions" description="Move directly to the workspaces that support your next career decision." emptyTitle="Choose your next workspace" emptyDescription="Start with opportunities, review target companies, or manage applications." action={<><PrimaryButton href="/opportunities">Explore opportunities</PrimaryButton><SecondaryButton href="/companies">Review companies</SecondaryButton><SecondaryButton href="/applications">View applications</SecondaryButton></>} />
      </div>
    </div>
  );
}
