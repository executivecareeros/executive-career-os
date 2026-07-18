import Link from "next/link";
import { redirect } from "next/navigation";
import { AgentHealthCard } from "@/components/agents/agent-health-card";
import { GuidanceQuestionReview } from "@/components/atlas/guidance-question-review";
import { PlanOverview } from "@/components/entitlements/plan-overview";
import { AtlasMemoryPanel } from "@/components/memory/atlas-memory-panel";
import { DemoDataBanner } from "@/components/opportunities/demo-data-banner";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { agentHealth, agentTasks, mockRecommendations } from "@/data/agent-dashboard";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { loadExecutiveProfileState } from "@/lib/profile/executive-profile-state.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveAtlasHandoffContext } from "@/lib/atlas/page-context";

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") return <LiveAtlas from={from} />;
  const pending = agentTasks.filter(task => task.state === "pending");
  const completed = agentTasks.filter(task => task.state === "completed");

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
      <PageHeader title="Executive Career Agent" description="Deterministic decision intelligence and architecture observability for future career guidance." />
      <div className="mt-6"><DemoDataBanner /></div>
      <div className="mt-6"><AtlasMemoryPanel /></div>
      <section className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Healthy agents" value={agentHealth.filter(item => item.status !== "failed").length} />
        <StatCard label="Pending tasks" value={pending.length} />
        <StatCard label="Completed tasks" value={completed.length} />
        <StatCard label="Memory usage" value={`${agentHealth.reduce((count, item) => count + item.memoryEntries, 0)} entries`} />
      </section>
      <SectionCard>
        <h2 className="text-xl font-semibold">Agent health</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{agentHealth.map(item => <AgentHealthCard key={item.agent} record={item} />)}</div>
      </SectionCard>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard>
          <h2 className="text-xl font-semibold">Task queue and schedule</h2>
          <div className="mt-4 space-y-3">{agentTasks.map(task => <article key={task.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4"><p className="font-medium">{task.title}</p><StatusBadge tone={task.state === "completed" ? "success" : "info"}>{task.state}</StatusBadge></article>)}</div>
        </SectionCard>
        <SectionCard>
          <h2 className="text-xl font-semibold">Current agent recommendations</h2>
          <div className="mt-4 space-y-3">{mockRecommendations.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4"><p className="font-medium">{item.title}</p></article>)}</div>
        </SectionCard>
      </div>
      <div className="mt-6"><PlanOverview compact /></div>
    </div>
  );
}

async function LiveAtlas({ from }: { from?: string }) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/assistant");

  const client = createServerSupabaseClient(resolved.accessToken);
  const workspace = resolved.context.workspace!;
  const [profile, view, guidanceResponse] = await Promise.all([
    loadExecutiveProfileState(client, workspace.workspaceId, workspace.executiveId),
    new SupabaseBetaWorkflowRepository(client, resolved.context).load().catch(() => undefined),
    client.request<Array<{ question_id: string; answer: string }>>(
      `atlas_guidance_responses?workspace_id=eq.${workspace.workspaceId}&executive_identity_id=eq.${workspace.executiveId}&select=question_id,answer`,
    ),
  ]);
  const recommendation = view?.reasoning?.output.recommendation;
  const questions = view?.reasoning?.output.questions ?? [];
  const existingAnswers = new Map((guidanceResponse.data ?? []).map(item => [item.question_id, item.answer]));
  const handoff = resolveAtlasHandoffContext(from);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-10">
      <PageHeader
        eyebrow="Atlas"
        title="Career intelligence, grounded in your evidence"
        description="Atlas distinguishes confirmed facts from unknowns and explains what could change a recommendation."
        actions={<div className="flex flex-wrap gap-3"><Link href="/workspace" className="inline-flex rounded-xl border border-[#d9dcde] bg-white px-5 py-3 text-sm font-semibold text-[#30343a]">Review profile</Link><Link href="/opportunities" className="inline-flex rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white">Ranked opportunities</Link></div>}
      />
      {handoff && <section className="mt-6 rounded-2xl border border-[#cad7ee] bg-[#f5f8ff] p-5"><p className="text-xs font-semibold uppercase tracking-[.17em] text-[#3457d5]">Continuing from {handoff.label}</p><h2 className="mt-2 text-xl font-semibold">{handoff.title}</h2><p className="mt-2 text-sm leading-6 text-[#5f6b7a]">{handoff.summary}</p><div className="mt-4 flex flex-wrap gap-2">{handoff.prompts.map(prompt => <span key={prompt} className="rounded-full border border-[#cfdaf0] bg-white px-3 py-2 text-xs font-medium text-[#35445d]">{prompt}</span>)}</div><Link href={handoff.returnHref} className="mt-4 inline-flex text-sm font-semibold text-[#3457d5]">Return to {handoff.label} →</Link></section>}
      <section className="mt-8 rounded-2xl border border-[#d8ddd9] bg-[#f6f8f6] p-6">
        <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#55705d]">Current context</p>
        <h2 className="mt-3 text-2xl font-semibold">Atlas is {profile.atlasState.toLowerCase()}</h2>
        <p className="mt-3 text-sm leading-6 text-[#626970]">{profile.hasStructuredProfile ? `${profile.confirmedRoleCount} confirmed ${profile.confirmedRoleCount === 1 ? "role is" : "roles are"} available for opportunity analysis.` : "Atlas needs confirmed career history before it can provide personalized guidance."}</p>
      </section>
      {recommendation ? (
        <section className="mt-6 rounded-2xl border border-[#e3e5e6] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#936b3f]">Latest evidence-based guidance</p>
          <h2 className="mt-3 text-2xl font-semibold">{recommendation.action}</h2>
          <p className="mt-3 text-sm leading-6 text-[#626970]">Confidence: {view?.reasoning?.output.confidence}. This guidance changes when confirmed evidence changes.</p>
          {questions.length > 0 && <GuidanceQuestionReview questions={questions.slice(0, 3).map(question => ({ id: question.id, question: question.question, improves: question.improves, existingAnswer: existingAnswers.get(question.id) }))} />}
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-dashed border-[#cfc7bc] bg-[#faf8f4] p-8 text-center">
          <h2 className="text-2xl font-semibold">No recommendation yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#626970]">Atlas will provide guidance after a real opportunity and enough confirmed profile evidence are available. No sample recommendation is shown.</p>
          <div className="mt-6"><Link href="/opportunities" className="inline-flex rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white">Explore opportunities</Link></div>
        </section>
      )}
    </main>
  );
}
