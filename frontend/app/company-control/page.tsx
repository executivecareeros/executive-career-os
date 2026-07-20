import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyControlCenter } from "@/components/company-control/company-control-center";
import { isSupabaseMode } from "@/lib/auth/configuration";
import { createCompanySnapshot } from "@/lib/company-intelligence";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveFounderAccess } from "@/lib/auth/founder-access";
import { founderBootstrapStatus } from "@/lib/auth/founder-bootstrap";
import type { ProductLearningDashboard } from "@/lib/product-learning";

export const metadata: Metadata = { title: "Company Control Center", description: "Founder-only internal ORENDALIS operating dashboard." };

export default async function CompanyControlPage() {
  let betaTriage;
  let roomPermanenceRequests: Array<{room_id:string;title:string;short_purpose:string;language_name:string;permanence_reason:string;creator_name:string;requested_at:string;closes_at:string}> = [];
  let founderBootstrapComplete=false;
  let operations: Parameters<typeof CompanyControlCenter>[0]["operations"];
  if (isSupabaseMode()) {
    const resolved=await resolveFounderAccess();
    if (!resolved) notFound();
    if(resolved){
      const client=createServerSupabaseClient(resolved.accessToken);
      const workspaceId=resolved.context.workspace!.workspaceId;
      const [triage,bootstrap,requests,coverage,learning]=await Promise.all([
        new SupabaseBetaWorkflowRepository(client,resolved.context).founderTriage(),
        founderBootstrapStatus(resolved.accessToken),
        client.request<typeof roomPermanenceRequests>("rpc/get_founder_room_permanence_requests",{method:"POST",body:"{}"}),
        client.request<Record<string,unknown>>("rpc/get_operational_coverage_summary",{method:"POST",body:JSON.stringify({target_workspace:workspaceId})}),
        client.request<ProductLearningDashboard>("rpc/get_founder_product_learning_dashboard",{method:"POST",body:JSON.stringify({window_days:30})}),
      ]);
      betaTriage=triage; founderBootstrapComplete=bootstrap.status==="COMPLETE"; roomPermanenceRequests=requests.data??[];
      operations={coverage:coverage.data,coverageError:coverage.error?.message,learning:learning.data,learningError:learning.error?.message,feedbackWaiting:triage.feedback.length,roomDecisions:roomPermanenceRequests.length};
    }
  }
  return <CompanyControlCenter snapshot={createCompanySnapshot()} betaTriage={betaTriage} founderBootstrapComplete={founderBootstrapComplete} roomPermanenceRequests={roomPermanenceRequests} operations={operations} />;
}
