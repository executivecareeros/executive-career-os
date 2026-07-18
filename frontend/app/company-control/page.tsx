import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyControlCenter } from "@/components/company-control/company-control-center";
import { isSupabaseMode } from "@/lib/auth/configuration";
import { createCompanySnapshot } from "@/lib/company-intelligence";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveFounderAccess } from "@/lib/auth/founder-access";
import { founderBootstrapStatus } from "@/lib/auth/founder-bootstrap";

export const metadata: Metadata = { title: "Company Control Center", description: "Founder-only internal ORENDALIS operating dashboard." };

export default async function CompanyControlPage() {
  let betaTriage;
  let roomPermanenceRequests: Array<{room_id:string;title:string;short_purpose:string;language_name:string;permanence_reason:string;creator_name:string;requested_at:string;closes_at:string}> = [];
  let founderBootstrapComplete=false;
  if (isSupabaseMode()) {
    const resolved=await resolveFounderAccess();
    if (!resolved) notFound();
    if(resolved){const client=createServerSupabaseClient(resolved.accessToken);betaTriage=await new SupabaseBetaWorkflowRepository(client,resolved.context).founderTriage();founderBootstrapComplete=(await founderBootstrapStatus(resolved.accessToken)).status==="COMPLETE";const requests=await client.request<typeof roomPermanenceRequests>("rpc/get_founder_room_permanence_requests",{method:"POST",body:"{}"});roomPermanenceRequests=requests.data??[];}
  }
  return <CompanyControlCenter snapshot={createCompanySnapshot()} betaTriage={betaTriage} founderBootstrapComplete={founderBootstrapComplete} roomPermanenceRequests={roomPermanenceRequests} />;
}
