import { notFound, redirect } from "next/navigation";
import { LiveCompanyProfile } from "@/components/companies/live-company-profile";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { toLiveOpportunity } from "@/lib/live-opportunity";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CurrentCompanyPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") notFound();
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/companies/current");
  const view = await new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken), resolved.context).load();
  const opportunity = toLiveOpportunity(view);
  if (!opportunity) redirect("/opportunities");
  return <LiveCompanyProfile opportunity={opportunity} />;
}
