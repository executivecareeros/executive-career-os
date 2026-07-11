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
import { companies } from "@/data/companies";
import { CompanyCard } from "@/components/companies/company-card";
import { HistoricalIntelligence } from "@/components/dashboard/historical-intelligence";
import { demoExecutiveBlueprint } from "@/data/executive-blueprint";
import { assessBlueprintCompleteness } from "@/lib/blueprint-completeness";
import { identifyBlueprintConflicts } from "@/lib/blueprint-conflicts";
import { demoAtlasMemories } from "@/data/atlas-memory";
import { demoExecutiveSignals, demoReasoningOutput } from "@/data/atlas-reasoning";

export default function Home() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") return <FirstExecutiveSetup />;
  const qualified = opportunities.filter((item) => item.status === "Qualified").length;
  const ready = opportunities.filter((item) => item.status === "Ready to Apply").length;
  const topOpportunity = [...opportunities].sort((a, b) => b.overallScore - a.overallScore)[0];
  const pipelineStages = ["Discovered", "Evaluating", "Qualified", "Ready to Apply", "Applied", "Interview"] as const;
  const monitoredCompanies = companies.filter((company) => company.monitoringStatus !== "Not Monitored" && company.monitoringStatus !== "Paused");
  const topCompany = [...companies].sort((a, b) => b.strategicRelevanceScore - a.strategicRelevanceScore)[0];
  const blueprintCompleteness = assessBlueprintCompleteness(demoExecutiveBlueprint);
  const blueprintConflicts = identifyBlueprintConflicts(demoExecutiveBlueprint);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader eyebrow="Good afternoon, Cüneyt" title="Executive dashboard" description="Your command center for executive career intelligence, relationships, and search momentum." actions={<><SecondaryButton href="/reports">View reports</SecondaryButton><PrimaryButton href="/opportunities">Explore opportunities</PrimaryButton></>} />
      <div className="mt-6"><DemoDataBanner /></div>
      <SectionCard className="mt-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Executive Memory</h2><p className="mt-2 text-sm text-slate-400">Evidence-based observations from confirmed fictional demonstration history.</p></div><SecondaryButton href="/memory">Open memory timeline</SecondaryButton></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><StatCard label="Confirmed memories" value={demoAtlasMemories.filter(m=>m.status==="Confirmed").length}/><StatCard label="Patterns" value={demoAtlasMemories.filter(m=>m.status==="Active").length}/><StatCard label="Unknown areas" value="3"/><StatCard label="Recent learnings" value={demoAtlasMemories.length}/><StatCard label="Atlas confidence" value={demoAtlasMemories[0]?.confidence??"Low"}/></div></SectionCard>
      <SectionCard className="mt-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Executive Briefing</h2><p className="mt-2 text-sm text-slate-400">Today&apos;s deterministic priorities, signals, and reasoning changes.</p></div><SecondaryButton href="/reasoning">Open reasoning</SecondaryButton></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Top priority" value={demoReasoningOutput.recommendation.priority}/><StatCard label="Today&apos;s signals" value={demoExecutiveSignals.length}/><StatCard label="New observations" value={demoAtlasMemories.length}/><StatCard label="Reasoning updates" value="1"/><StatCard label="Confidence" value={demoReasoningOutput.confidence}/></div></SectionCard>
      <div className="grid gap-6 py-8 xl:grid-cols-2">
        <SectionCard className="xl:col-span-2"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Executive Blueprint</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">{demoExecutiveBlueprint.vision.threeYearObjective}</p></div><SecondaryButton href="/blueprint">Open Blueprint</SecondaryButton></div><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Completeness" value={`${blueprintCompleteness.score}%`} note={blueprintCompleteness.state}/><StatCard label="Unresolved conflicts" value={blueprintConflicts.length}/><StatCard label="Last revision" value={`#${demoExecutiveBlueprint.revisionNumber}`}/><StatCard label="Next review" value={demoExecutiveBlueprint.nextReviewAt}/><StatCard label="Decision ready" value={blueprintCompleteness.state==="Decision Ready"?"Yes":"Not yet"}/></div><p className="mt-5 text-sm text-slate-400">Top priorities: {demoExecutiveBlueprint.decisionPriorities.slice(0,3).map(p=>p.factor).join(" · ")}</p></SectionCard>
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
        <SectionCard className="xl:col-span-2"><h2 className="text-xl font-semibold">Company Intelligence</h2><p className="mt-2 text-sm text-slate-400">Shared demonstration-company monitoring summary.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Monitored companies" value={monitoredCompanies.length}/><StatCard label="High priority" value={companies.filter(c=>c.priority==="Critical"||c.priority==="High").length}/><StatCard label="Hiring signals" value={companies.filter(c=>c.hiringSignals.length).length}/><StatCard label="Upcoming reviews" value={companies.filter(c=>c.nextReviewAt).length}/></div><div className="mt-6"><CompanyCard company={topCompany} view="list"/></div></SectionCard>
        <HistoricalIntelligence />
        <DashboardSection className="xl:col-span-2" title="Quick Actions" description="Move directly to the workspaces that support your next career decision." emptyTitle="Choose your next workspace" emptyDescription="Start with opportunities, review target companies, or manage applications." action={<><PrimaryButton href="/opportunities">Explore opportunities</PrimaryButton><SecondaryButton href="/companies">Review companies</SecondaryButton><SecondaryButton href="/applications">View applications</SecondaryButton></>} />
      </div>
    </div>
  );
}

function FirstExecutiveSetup(){return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10"><PageHeader eyebrow="Your private professional home" title="Begin your first Executive Brief" description="Bring in verified professional history to begin your Career Ledger and prepare Blueprint suggestions." actions={<PrimaryButton href="/import">Import professional history</PrimaryButton>}/><div className="grid gap-6 py-8 lg:grid-cols-2"><DashboardSection title="Today&apos;s Executive Brief" description="Your brief will distinguish confirmed facts, suggestions, missing information, and unresolved conflicts." emptyTitle="Professional history not yet confirmed" emptyDescription="Review an import before anything is added to your permanent Career Memory." action={<PrimaryButton href="/import">Start secure import</PrimaryButton>}/><SectionCard><h2 className="text-xl font-semibold">Setup status</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><StatCard label="History import" value="Not started"/><StatCard label="Career Ledger events" value="0"/><StatCard label="Blueprint completeness" value="0%"/><StatCard label="Unresolved conflicts" value="0"/></div><p className="mt-5 text-sm text-slate-400">Compensation preferences remain unset. No demo opportunity or application metrics are shown in an authenticated Workspace.</p></SectionCard></div></div>}
