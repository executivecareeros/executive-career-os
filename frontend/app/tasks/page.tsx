import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";
import { ProductivityWorkspace } from "@/components/productivity/productivity-workspace";

export default function TasksPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") return <LiveWorkspaceEmptyState title="Tasks and Follow Ups" description="Keep the actions supporting your career decisions visible and accountable." emptyTitle="No confirmed tasks yet" emptyDescription="A task will appear after you finalize your first opportunity decision." actionHref="/beta-workflow" actionLabel="Continue your first assessment" />;
  return <ProductivityWorkspace view="tasks" />;
}
