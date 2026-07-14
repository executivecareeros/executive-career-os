import { notFound, redirect } from "next/navigation";
import { LiveOpportunityDetail } from "@/components/opportunities/live-opportunity-detail";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { toLiveOpportunity } from "@/lib/live-opportunity";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CurrentOpportunityPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") notFound();
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/opportunities/current");
  const view = await new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken), resolved.context).load();
  const opportunity = toLiveOpportunity(view);
  if (!opportunity) redirect("/opportunities");
  return <LiveOpportunityDetail opportunity={opportunity} />;
}
