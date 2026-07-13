import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";
import { PageHeader } from "@/components/page-header";
import { ReasoningWorkspace } from "@/components/reasoning/reasoning-workspace";

export default function ReasoningPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") {
    return <LiveWorkspaceEmptyState title="Executive Reasoning" description="Atlas compares confirmed evidence, unknowns, conflicts, and trade-offs." emptyTitle="No reasoning snapshot yet" emptyDescription="Complete the guided opportunity context before Atlas produces an explainable assessment." actionHref="/beta-workflow" actionLabel="Continue your first assessment" />;
  }
  return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10"><PageHeader eyebrow="Reproducible · Explainable" title="Executive Reasoning Workspace" description="Compare evidence, conflicts, trade-offs, questions, and decision alternatives across Executive Career OS."/><div className="mt-8"><ReasoningWorkspace/></div><p className="mt-6 text-xs text-slate-600">Fictional demonstration evidence only. No AI, LLM, chat, prediction, or external provider is connected.</p></main>;
}
