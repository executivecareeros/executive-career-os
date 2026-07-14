import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";
import { ProductivityWorkspace } from "@/components/productivity/productivity-workspace";
import Link from "next/link";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadLatestCollectedDecision } from "@/lib/live-collected-decision";

export default async function TasksPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") { const resolved=await resolveAuthenticatedRepositoryContext();const decision=resolved?await loadLatestCollectedDecision(createServerSupabaseClient(resolved.accessToken),resolved.context.workspace!.workspaceId):undefined;if(!decision)return <LiveWorkspaceEmptyState title="Tasks and Follow Ups" description="Keep the actions supporting your career decisions visible and accountable." emptyTitle="No confirmed tasks yet" emptyDescription="A task will appear after you finalize your first opportunity decision." actionHref="/opportunities" actionLabel="Explore opportunities" />;return <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-10"><p className="text-sm uppercase tracking-[.18em] text-blue-300">Tasks and Follow Ups</p><h1 className="mt-3 text-3xl font-semibold">Your next action is connected to the decision</h1><article className="mt-7 rounded-2xl border border-white/10 bg-white/[.04] p-6"><div className="flex flex-wrap justify-between gap-3"><p className="font-medium">{decision.task.title}</p><span className="text-sm text-blue-300">{decision.task.status} · {decision.task.priority}</span></div><p className="mt-3 text-sm text-slate-400">Created from your {decision.action} decision for {decision.companyName}.</p><Link href={`/opportunities/${encodeURIComponent(decision.opportunityId)}`} className="mt-5 inline-flex text-sm font-medium text-blue-300">Review opportunity →</Link></article></main>}
  return <ProductivityWorkspace view="tasks" />;
}
