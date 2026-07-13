import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyControlCenter } from "@/components/company-control/company-control-center";
import { isSupabaseMode } from "@/lib/auth/configuration";
import { createCompanySnapshot } from "@/lib/company-intelligence";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveFounderAccess } from "@/lib/auth/founder-access";
import { founderBootstrapStatus } from "@/lib/auth/founder-bootstrap";

export const metadata: Metadata = { title: "Company Control Center", description: "Founder-only internal Orendalis operating dashboard." };

export default async function CompanyControlPage() {
  let betaTriage;
  let founderBootstrapComplete=false;
  if (isSupabaseMode()) {
    const resolved=await resolveFounderAccess();
    if (!resolved) notFound();
    if(resolved){betaTriage=await new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken),resolved.context).founderTriage();founderBootstrapComplete=(await founderBootstrapStatus(resolved.accessToken)).status==="COMPLETE";}
  }
  return <CompanyControlCenter snapshot={createCompanySnapshot()} betaTriage={betaTriage} founderBootstrapComplete={founderBootstrapComplete} />;
}
