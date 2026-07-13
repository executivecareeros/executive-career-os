import { redirect } from "next/navigation";
import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import type { BetaWorkflowView } from "@/lib/beta/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const modules = {
  workspace: ["Your Workspace", "Your private professional home is active.", "Begin with confirmed career context"],
  atlas: ["Atlas", "Evidence-led decision support grounded only in your confirmed records.", "Atlas is waiting for your first opportunity context"],
  companies: ["Companies", "Research and compare companies connected to your career decisions.", "No confirmed companies yet"],
  applications: ["Applications", "Track applications that you choose to pursue.", "No applications yet"],
  compensation: ["Compensation", "Preserve confirmed compensation evidence and negotiation history.", "No compensation records yet"],
  discovery: ["Discovery", "Review opportunities from connected, attributable sources.", "No discovery sources are active"],
  knowledge: ["Knowledge", "Preserve verified observations without inventing conclusions.", "No confirmed observations yet"],
  memory: ["Executive Memory", "Atlas remembers only evidence you confirm.", "No confirmed memories yet"],
  repositories: ["Repository Health", "Operational data access remains isolated from executive career content.", "No repository diagnostics are available here"],
  interview: ["Interview Preparation", "Prepare from confirmed company, role, and career evidence.", "No upcoming interview context yet"],
  negotiation: ["Negotiation Planner", "Compare confirmed offer terms, targets, and trade-offs.", "No active negotiation yet"],
  decisions: ["Decision Workspace", "Compare opportunities using confirmed evidence and explicit trade-offs.", "No decisions ready to compare"],
  notes: ["Executive Notes", "Keep structured notes linked to confirmed career context.", "No notes yet"],
  ledger: ["Career Ledger", "Your permanent record of confirmed career events and decisions.", "No executive decisions recorded yet"],
  blueprint: ["Executive Blueprint", "Define the direction, preferences, and constraints Atlas must respect.", "Your Blueprint has not been confirmed yet"],
  opportunities: ["Opportunities", "Assess opportunities against your confirmed Blueprint.", "No confirmed opportunities yet"],
  tasks: ["Tasks and Follow Ups", "Keep the actions supporting your career decisions visible and accountable.", "No confirmed tasks yet"],
  today: ["Today", "A focused view of confirmed priorities, preparation, and follow ups.", "Your brief will begin with confirmed context"],
} as const;

type ModuleKey = keyof typeof modules;

const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;

function ConfirmedWorkspaceModule({ module, view }: { module: ModuleKey; view: BetaWorkflowView }) {
  const [title, description] = modules[module];
  const complete = new Set(view.state.completedSteps);
  const opportunityTitle = text(view.opportunity?.title, "Confirmed opportunity");
  const companyName = text(view.opportunity?.companyName, "Company not recorded");
  const vision = text(view.blueprint?.careerVision, "Career vision confirmed");
  const recommendation = view.reasoning?.output.recommendation;
  const confidence = view.reasoning?.output.confidence;
  const decisionComplete = Boolean(view.state.finalizedDecisionId);

  let heading = "Confirmed Workspace context";
  let summary = `${view.historyCount} professional-history record${view.historyCount === 1 ? "" : "s"} confirmed.`;
  let details: string[] = [`${complete.size} guided stages complete`];

  if (module === "blueprint" && view.blueprint) {
    heading = vision;
    summary = "This is the active executive-confirmed Blueprint used by Atlas.";
    details = [
      text(view.blueprint.leadershipLevel, "Leadership level not recorded"),
      `${Array.isArray(view.blueprint.preferredIndustries) ? view.blueprint.preferredIndustries.length : 0} preferred industries`,
      `${Array.isArray(view.blueprint.preferredCountries) ? view.blueprint.preferredCountries.length : 0} preferred countries`,
    ];
  } else if (module === "opportunities" && view.opportunity) {
    heading = opportunityTitle;
    summary = `${companyName} · ${text(view.opportunity.location, "Location not recorded")}`;
    details = [text(view.opportunity.workModel, "Work model not recorded"), "Executive-entered and confirmed", decisionComplete ? "Decision finalized" : "Decision in progress"];
  } else if (module === "atlas" && recommendation) {
    heading = `Atlas recommends: ${recommendation.action}`;
    summary = `${confidence} confidence based only on confirmed Workspace evidence.`;
    details = [`${view.reasoning?.output.evidence.length ?? 0} evidence records used`, `${view.reasoning?.output.questions.length ?? 0} open questions`, `${view.reasoning?.output.tradeoffs.length ?? 0} evidence-supported trade-offs`];
  } else if (module === "ledger" && decisionComplete) {
    heading = "First executive decision preserved";
    summary = `${opportunityTitle} at ${companyName} is recorded with its evidence and Atlas snapshot.`;
    details = ["Immutable decision recorded", "Career Ledger entry created", "Replay protection active"];
  } else if (module === "tasks" && decisionComplete) {
    heading = `Follow up on ${opportunityTitle}`;
    summary = "A follow-up task was created atomically with the finalized decision.";
    details = ["Linked to the confirmed opportunity", "Linked to the preserved decision", "No demonstration tasks shown"];
  } else if (module === "today" && decisionComplete) {
    heading = recommendation ? `${recommendation.action} on ${opportunityTitle}` : `Review ${opportunityTitle}`;
    summary = "Your current brief reflects only the completed founder journey.";
    details = ["Decision preserved", "Follow-up created", `${view.reasoning?.output.questions.length ?? 0} outstanding questions`];
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader eyebrow="Your private Career Memory" title={title} description={description} />
      <SectionCard className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300">Confirmed context</p>
            <h2 className="mt-3 text-xl font-semibold">{heading}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{summary}</p>
          </div>
          <StatusBadge tone="success">Workspace only</StatusBadge>
        </div>
        <ul className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
          {details.map((detail) => <li className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3" key={detail}>{detail}</li>)}
        </ul>
        <p className="mt-5 text-xs leading-5 text-slate-500">Demonstration datasets remain isolated from this staging Workspace.</p>
        <div className="mt-6"><PrimaryButton href="/beta-workflow">Review guided journey</PrimaryButton></div>
      </SectionCard>
    </div>
  );
}

export default async function LiveModulePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const key = query.module && query.module in modules ? query.module as ModuleKey : "workspace";
  const [title, description, emptyTitle] = modules[key];
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect(`/login?next=/${key}`);
  const repository = new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken), resolved.context);
  let view: BetaWorkflowView | undefined;
  try {
    view = await repository.load();
  } catch {
    view = undefined;
  }
  const hasRelevantContext = Boolean(view && (
    view.historyCount > 0 ||
    Boolean(view.blueprint) ||
    Boolean(view.opportunity) ||
    Boolean(view.reasoning) ||
    Boolean(view.state.finalizedDecisionId)
  ));
  if (view && hasRelevantContext) return <ConfirmedWorkspaceModule module={key} view={view} />;
  return <LiveWorkspaceEmptyState title={title} description={description} emptyTitle={emptyTitle} emptyDescription="Complete the guided founder journey to add the first confirmed record. Demonstration data is isolated from this staging Workspace." actionHref="/beta-workflow" actionLabel="Continue your guided journey" />;
}
