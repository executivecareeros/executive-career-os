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
import { demoExecutiveBrief, demoTasks } from "@/data/productivity";
import { ExecutiveHealthStrip } from "@/components/dashboard/executive-health-strip";
import { StatusBadge } from "@/components/status-badge";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import type { BetaWorkflowView } from "@/lib/beta/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { executiveDecisionLabel } from "@/lib/live-opportunity";

export default async function Home() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") return <ExecutiveBriefing />;
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
      <div className="mt-6"><ExecutiveHealthStrip /></div>
      <SectionCard className="mt-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Executive Memory</h2><p className="mt-2 text-sm text-slate-400">Evidence-based observations from confirmed fictional demonstration history.</p></div><SecondaryButton href="/memory">Open memory timeline</SecondaryButton></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><StatCard label="Confirmed memories" value={demoAtlasMemories.filter(m=>m.status==="Confirmed").length}/><StatCard label="Patterns" value={demoAtlasMemories.filter(m=>m.status==="Active").length}/><StatCard label="Unknown areas" value="3"/><StatCard label="Recent learnings" value={demoAtlasMemories.length}/><StatCard label="Atlas confidence" value={demoAtlasMemories[0]?.confidence??"Low"}/></div></SectionCard>
      <SectionCard className="mt-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Executive Briefing</h2><p className="mt-2 text-sm text-slate-400">Today&apos;s deterministic priorities, signals, and reasoning changes.</p></div><SecondaryButton href="/reasoning">Open reasoning</SecondaryButton></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Top priority" value={demoReasoningOutput.recommendation.priority}/><StatCard label="Today&apos;s signals" value={demoExecutiveSignals.length}/><StatCard label="New observations" value={demoAtlasMemories.length}/><StatCard label="Reasoning updates" value="1"/><StatCard label="Confidence" value={demoReasoningOutput.confidence}/></div></SectionCard>
      <SectionCard className="mt-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Today&apos;s Brief</h2><p className="mt-2 text-sm text-slate-400">Deterministic preparation and action summary.</p></div><SecondaryButton href="/productivity">Open productivity</SecondaryButton></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Tasks" value={demoTasks.filter(t=>t.status!=="Completed").length}/><StatCard label="Interviews" value="1"/><StatCard label="Negotiations" value="1"/><StatCard label="Priorities" value={demoExecutiveBrief.topPriorities.length}/><StatCard label="Questions" value={demoExecutiveBrief.outstandingQuestions.length}/></div></SectionCard>
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

const display = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value : fallback;

async function ExecutiveBriefing() {
  const resolved = await resolveAuthenticatedRepositoryContext();
  let view: BetaWorkflowView | undefined;
  if (resolved) {
    try {
      view = await new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken), resolved.context).load();
    } catch {
      view = undefined;
    }
  }

  if (!view) return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10"><PageHeader eyebrow="Your private career office" title="Build the context Atlas needs" description="Begin with one confirmed role. Your career direction, opportunities, and decisions will remain connected from that point forward." actions={<PrimaryButton href="/beta-workflow">Begin</PrimaryButton>}/><div className="mt-8"><DashboardSection title="Your first step" description="A small amount of confirmed context is enough to begin." emptyTitle="Confirm your professional history" emptyDescription="Add one role manually or review a CV or resume draft. Nothing enters your Career Memory until you confirm it." action={<PrimaryButton href="/beta-workflow#professional-history">Add career context</PrimaryButton>}/></div></div>;

  const recommendation = view.reasoning?.output.recommendation;
  const questions = view.reasoning?.output.questions ?? [];
  const decisionComplete = Boolean(view.state.finalizedDecisionId);
  const executiveDecision = executiveDecisionLabel(view.selectedDecisionAction);
  const opportunityTitle = display(view.opportunity?.title, "No opportunity selected");
  const companyName = display(view.opportunity?.companyName, "Company not recorded");
  const currentStep = view.state.currentStep === "Complete" ? "Journey complete" : view.state.currentStep;
  const lastCompleted = view.state.completedSteps.at(-1) ?? "Workspace created";
  const primaryHref = decisionComplete ? "/archive" : view.opportunity ? "/opportunities/current" : "/beta-workflow";
  const primaryLabel = decisionComplete ? "Open Career Ledger" : view.opportunity ? "Review opportunity" : "Continue your decision";

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader eyebrow="Today’s Executive Brief" title={decisionComplete ? `You chose to ${executiveDecision ?? "act"}. Here is what deserves attention.` : "One clear next step for your career decision."} description={decisionComplete ? "Atlas has connected your decision to the confirmed evidence, unresolved questions, and follow-up from this opportunity." : `You are currently at ${currentStep}. Atlas will not move ahead without confirmed context.`} actions={<><SecondaryButton href="/productivity">Open today’s brief</SecondaryButton><PrimaryButton href={primaryHref}>{primaryLabel}</PrimaryButton></>} />

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="atlas-kicker">Latest confirmed update</p><StatusBadge tone="success">Current</StatusBadge></div>
          <h2 className="mt-3 text-2xl font-semibold">{lastCompleted} is now part of your Career Memory</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">This brief is based on your latest saved workspace state. Atlas does not fill missing updates with assumptions.</p>
        </SectionCard>
        <SectionCard>
          <p className="atlas-kicker">Needs attention</p>
          <p className="mt-3 text-4xl font-semibold text-white">{questions.length}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">material questions could change the recommendation.</p>
          <div className="mt-5"><SecondaryButton href="/assistant">Review questions</SecondaryButton></div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <SectionCard>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="atlas-kicker">Opportunity in focus</p><h2 className="mt-3 text-xl font-semibold">{opportunityTitle}</h2><p className="mt-2 text-sm text-slate-400">{companyName} · {display(view.opportunity?.location, "Location not confirmed")}</p></div><StatusBadge tone={decisionComplete ? "success" : "info"}>{decisionComplete ? `${executiveDecision ?? "Decision"} preserved` : currentStep}</StatusBadge></div>
          <div className="mt-6"><SecondaryButton href={view.opportunity ? "/opportunities/current" : "/opportunities"}>{view.opportunity ? "Review opportunity" : "Open Opportunity Universe"}</SecondaryButton></div>
        </SectionCard>
        <SectionCard>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="atlas-kicker">{decisionComplete ? "Atlas after your decision" : "Atlas recommends"}</p><h2 className="mt-3 text-xl font-semibold">{decisionComplete ? `${executiveDecision ?? "Decision"} is now the active course` : recommendation?.action ?? "More context required"}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{decisionComplete ? `Atlas retains its ${view.reasoning?.output.confidence ?? "recorded"}-confidence assessment while respecting the decision you made.` : recommendation ? `${view.reasoning?.output.confidence} confidence. The recommendation changes when the evidence changes.` : "Atlas is waiting for enough confirmed evidence to offer a recommendation."}</p></div>{recommendation && <StatusBadge tone="info">{decisionComplete ? "Decision reflected" : recommendation.priority}</StatusBadge>}</div>
          <div className="mt-6"><PrimaryButton href={recommendation ? "/assistant" : "/beta-workflow#assessment"}>{recommendation ? "See what could change" : "Complete Atlas assessment"}</PrimaryButton></div>
        </SectionCard>
      </div>

      <SectionCard className="mt-5">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="atlas-kicker">Your next conversation</p><h2 className="mt-3 text-xl font-semibold">Questions worth resolving before you act</h2><p className="mt-2 text-sm text-slate-400">Atlas prioritizes uncertainty so you can spend time on the conversations that matter.</p></div><SecondaryButton href="/tasks">Open follow-up</SecondaryButton></div>
        {questions.length ? <ol className="mt-6 grid gap-3 md:grid-cols-3">{questions.slice(0,3).map((question, index) => <li key={question.id} className="rounded-xl border border-white/10 bg-slate-950/45 p-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-300">{index + 1} · {question.priority}</p><p className="mt-2 text-sm leading-6 text-slate-200">{question.question}</p></li>)}</ol> : <p className="mt-6 text-sm text-slate-400">No unresolved question is available yet. Continue the guided decision to give Atlas more context.</p>}
      </SectionCard>
      {decisionComplete && <SectionCard className="mt-5"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="atlas-kicker">Decision continuity</p><h2 className="mt-3 text-xl font-semibold">Your evidence, decision, and next action remain connected</h2><p className="mt-2 text-sm leading-6 text-slate-400">Review the permanent record, then return here whenever you need the current priority.</p></div><div className="flex shrink-0 flex-wrap gap-3"><SecondaryButton href="/opportunities/current">Review opportunity</SecondaryButton><PrimaryButton href="/archive">Open Career Ledger</PrimaryButton></div></div></SectionCard>}
    </div>
  );
}
