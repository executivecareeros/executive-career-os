import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyControlCenter } from "@/components/company-control/company-control-center";
import { currentSession } from "@/lib/auth/session";
import { isSupabaseMode } from "@/lib/auth/configuration";
import { createCompanySnapshot } from "@/lib/company-intelligence";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Company Control Center", description: "Founder-only internal Orendalis operating dashboard." };

export default async function CompanyControlPage() {
  let betaTriage;
  if (isSupabaseMode()) {
    const session = await currentSession();
    const founderEmail = process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase();
    if (!session || !founderEmail || session.user.email?.toLowerCase() !== founderEmail) notFound();
    const resolved=await resolveAuthenticatedRepositoryContext();
    if(resolved)betaTriage=await new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken),resolved.context).founderTriage();
  }
  return <CompanyControlCenter snapshot={createCompanySnapshot()} betaTriage={betaTriage} />;
}
