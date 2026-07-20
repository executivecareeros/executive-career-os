import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { loadLatestCollectedDecision } from "@/lib/live-collected-decision";
import { loadExecutiveProfileState } from "@/lib/profile/executive-profile-state.server";
import type { ExecutiveProfileState } from "@/lib/profile/executive-profile-state";
import type { Locale } from "@/lib/locale";
import type { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";

type Resolved = NonNullable<Awaited<ReturnType<typeof resolveAuthenticatedRepositoryContext>>>;

export async function SimpleExecutiveHome({ resolved, locale }: { resolved: Resolved; locale: Locale }) {
  void locale;
  let update: "quiet" | "recommendation" | "saved" | "active" = "quiet";
  let opportunityTitle = "";
  let companyName = "";
  let opportunityId = "";
  let decisionAction = "";
  let unansweredQuestions = 0;
  const client = createServerSupabaseClient(resolved.accessToken);
  const profileState: ExecutiveProfileState | undefined = await loadExecutiveProfileState(client, resolved.context.workspace!.workspaceId, resolved.context.workspace!.executiveId).catch(() => undefined);
  try {
    const [view, decision] = await Promise.all([
      new SupabaseBetaWorkflowRepository(client, resolved.context).load(),
      loadLatestCollectedDecision(client, resolved.context.workspace!.workspaceId),
    ]);
    opportunityTitle = decision?.title ?? safeText(view.opportunity?.title);
    companyName = decision?.companyName ?? safeText(view.opportunity?.companyName);
    opportunityId = decision?.opportunityId ?? "";
    const action = decision?.action ?? view.selectedDecisionAction;
    decisionAction = safeText(action);
    unansweredQuestions = view.reasoning?.output.questions?.length ?? 0;
    if (action === "Pursue") update = "active";
    else if (action === "Watch") update = "saved";
    else if (view.opportunity && !action) update = "recommendation";
  } catch {
    update = "quiet";
  }

  const hasProfile = profileState?.hasStructuredProfile ?? false;
  const atlas = atlasCopy(update, opportunityTitle, companyName, hasProfile);
  const opportunityInFocus = Boolean(opportunityTitle);
  return <main className="mx-auto max-w-7xl px-5 py-8 text-[#17191c] sm:px-6 lg:px-10">
    <PageHeader eyebrow="Today" title="Your executive briefing." description="See what is confirmed, what deserves attention, and the next career decision worth making." actions={<><SecondaryButton href={hasProfile ? "/workspace" : "/import"}>{hasProfile ? "Review profile" : "Upload CV"}</SecondaryButton><PrimaryButton href="/opportunities">Search jobs</PrimaryButton></>} />

    {profileState?.hasStructuredProfile && <section className="mt-7 flex flex-col gap-4 rounded-2xl border border-[#d8ddd9] bg-[#f6f8f6] p-5 sm:flex-row sm:items-center sm:justify-between" aria-label="Active executive profile">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#55705d]">Active profile</p>
        <h2 className="mt-2 text-lg font-semibold">Your confirmed career profile</h2>
        <p className="mt-1 text-sm leading-6 text-[#626970]">{profileState.confirmedRoleCount} confirmed {profileState.confirmedRoleCount === 1 ? "role" : "roles"} · Atlas {profileState.atlasState.toLowerCase()}</p>
      </div>
      <div className="flex flex-wrap gap-3"><SecondaryButton href="/workspace">View saved profile</SecondaryButton><SecondaryButton href="/import">Update CV</SecondaryButton></div>
    </section>}

    <section className="mt-7" aria-labelledby="briefing-title">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.17em] text-[#55705d]">Executive briefing</p><h2 id="briefing-title" className="mt-2 text-2xl font-semibold">What deserves your attention</h2></div><p className="max-w-xl text-sm leading-6 text-[#697076]">Only confirmed workspace information appears here. Missing context remains explicit.</p></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <BriefCard label="Latest confirmed context" title={hasProfile ? "Career profile ready" : "Career profile not confirmed"} detail={hasProfile ? `${profileState?.confirmedRoleCount ?? 0} confirmed roles are available to Atlas.${profileState?.lastSuccessfulUpdate ? ` Last updated ${formatUpdate(profileState.lastSuccessfulUpdate)}.` : ""}` : "Upload or enter your experience before Atlas evaluates fit."} href={hasProfile ? "/workspace" : "/import"} action={hasProfile ? "Review career memory" : "Add career history"}/>
        <BriefCard label="Needs attention" title={unansweredQuestions ? `${unansweredQuestions} material ${unansweredQuestions === 1 ? "question" : "questions"}` : opportunityInFocus && !decisionAction ? "One decision is waiting" : "No recorded urgent action"} detail={unansweredQuestions ? "Resolving these questions could change the current Atlas assessment." : opportunityInFocus && !decisionAction ? "Review the opportunity evidence, then choose Pursue, Watch, or Skip." : "Orendalis has no confirmed urgent action to place ahead of your search."} href={unansweredQuestions ? "/assistant" : opportunityInFocus ? opportunityHref(opportunityId) : "/opportunities"} action={unansweredQuestions ? "Review questions" : opportunityInFocus ? "Continue decision" : "Explore opportunities"}/>
        <BriefCard label="Opportunity in focus" title={opportunityInFocus ? opportunityTitle : "No opportunity in focus"} detail={opportunityInFocus ? companyName || "Company information is not yet confirmed." : "Search the Opportunity Universe or wait for an evidence-backed Atlas recommendation."} href={opportunityInFocus ? opportunityHref(opportunityId) : "/opportunities"} action={opportunityInFocus ? "Review opportunity" : "Search opportunities"}/>
        <BriefCard label="Atlas perspective" title={atlas.title} detail={atlas.detail} href={atlas.href} action={atlas.action}/>
        <BriefCard label="Decision continuity" title={decisionAction ? `${decisionAction} decision preserved` : opportunityInFocus ? "Decision not yet recorded" : "No decision pending"} detail={decisionAction ? "The decision remains connected to its evidence and next action." : opportunityInFocus ? "Your evidence remains available while you decide." : "Your next decision will appear here without replacing prior history."} href={decisionAction ? "/archive" : opportunityInFocus ? opportunityHref(opportunityId) : "/opportunities"} action={decisionAction ? "Open Career Ledger" : opportunityInFocus ? "Make a decision" : "Find an opportunity"}/>
      </div>
    </section>

    <form action="/opportunities" className="mt-7 flex max-w-4xl flex-col gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 shadow-sm sm:flex-row">
      <label className="sr-only" htmlFor="home-job-search">Search executive jobs</label>
      <input id="home-job-search" name="q" type="search" placeholder="Search by role, company, or location" className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#d9dcde] bg-white px-4 text-[#17191c] placeholder:text-[#92999f]"/>
      <button className="rounded-xl bg-[#17191c] px-6 py-3 text-sm font-semibold text-white hover:bg-black">Search jobs</button>
    </form>

    <section className="mt-7 rounded-2xl border border-[#dfd2c1] bg-[#eee2d2] p-5 sm:p-6" aria-labelledby="atlas-update-title">
      <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#835c34]">Atlas advisor</p>
      <h2 id="atlas-update-title" className="mt-2 text-xl font-semibold">{atlas.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f686e]">{atlas.detail}</p>
      <div className="mt-4"><PrimaryButton href={atlas.href}>{atlas.action}</PrimaryButton></div>
    </section>

  </main>;
}

function BriefCard({ label, title, detail, href, action }: { label: string; title: string; detail: string; href: string; action: string }) {
  return <article className="flex min-h-56 flex-col rounded-2xl border border-[#e3e5e6] bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#55705d]">{label}</p><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-[#697076]">{detail}</p><div className="mt-5"><SecondaryButton href={href}>{action}</SecondaryButton></div></article>;
}

function atlasCopy(state: "quiet" | "recommendation" | "saved" | "active", title: string, company: string, hasProfile: boolean) {
  const role = title ? `${title}${company ? ` · ${company}` : ""}` : "";
  if (state === "active") return { title: "Your next step is ready for an active opportunity.", detail: role || "Review the company and prepare your application.", href: "/applications", action: "See next step" };
  if (state === "saved") return { title: "Your saved opportunity is ready to revisit.", detail: role || "Important source changes will remain visible without rewriting your decision history.", href: "/opportunities", action: "Review saved job" };
  if (state === "recommendation") return { title: "I found an opportunity worth reviewing.", detail: role || "I’ll show why it may fit and what to check before applying.", href: "/opportunities", action: "See what Atlas found" };
  return { title: "No strong new match is confirmed yet.", detail: hasProfile ? "Atlas is evaluating the Opportunity Universe against your saved profile without inventing missing fit." : "Search all jobs now, or upload your CV for more relevant recommendations.", href: "/opportunities", action: "Search all jobs" };
}

function safeText(value: unknown) { return typeof value === "string" ? value : ""; }
function opportunityHref(id: string) { return id ? `/opportunities/${encodeURIComponent(id)}` : "/opportunities/current"; }
function formatUpdate(value: string) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? "on an unknown date" : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date); }
