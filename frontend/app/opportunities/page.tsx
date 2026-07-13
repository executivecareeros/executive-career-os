import { OpportunitiesWorkspace } from "@/components/opportunities/opportunities-workspace";
import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";
import { opportunities } from "@/data/opportunities";

export default function OpportunitiesPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") return <LiveWorkspaceEmptyState title="Opportunities" description="Assess real executive opportunities against your confirmed career context." emptyTitle="No confirmed opportunities yet" emptyDescription="Complete Professional History and the minimum Executive Blueprint, then record the first opportunity you want Atlas to assess." actionHref="/beta-workflow" actionLabel="Continue your first assessment" />;
  return <OpportunitiesWorkspace opportunities={opportunities} />;
}
