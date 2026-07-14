import { OpportunitiesWorkspace } from "@/components/opportunities/opportunities-workspace";
import { OpportunityUniverseEmpty } from "@/components/opportunities/opportunity-universe-empty";
import { opportunities } from "@/data/opportunities";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toLiveOpportunity } from "@/lib/live-opportunity";
import { LiveOpportunityUniverse } from "@/components/opportunities/live-opportunity-universe";
import type { LiveOpportunityViewModel } from "@/lib/live-opportunity";
import { redirect } from "next/navigation";
import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";

export default async function OpportunitiesPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase") {
    const resolved = await resolveAuthenticatedRepositoryContext();
    if (!resolved) redirect("/login?next=/opportunities");
    let opportunity: LiveOpportunityViewModel | undefined;
    let unavailable = false;
    try {
      const view = await new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken), resolved.context).load();
      opportunity = toLiveOpportunity(view);
    } catch {
      unavailable = true;
    }
    if (unavailable) return <LiveWorkspaceEmptyState eyebrow="Executive Opportunity Universe" title="Your opportunities are temporarily unavailable" description="Orendalis could not safely load your private opportunity context." emptyTitle="Your records remain unchanged" emptyDescription="No empty state or recommendation is being inferred from this interruption. Return to Today and try again when the connection is available." actionHref="/" actionLabel="Return to Today" />;
    return opportunity ? <LiveOpportunityUniverse opportunity={opportunity} /> : <OpportunityUniverseEmpty />;
  }
  return <OpportunitiesWorkspace opportunities={opportunities} />;
}
