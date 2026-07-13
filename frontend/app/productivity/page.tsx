import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";
import { ProductivityWorkspace } from "@/components/productivity/productivity-workspace";

export default function ProductivityPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") return <LiveWorkspaceEmptyState title="Today" description="A focused view of confirmed priorities, preparation, and follow ups." emptyTitle="Your brief will begin with confirmed context" emptyDescription="Complete the guided opportunity assessment. Orendalis will not create tasks, interviews, or observations you did not confirm." actionHref="/beta-workflow" actionLabel="Continue your first assessment" />;
  return <ProductivityWorkspace />;
}
