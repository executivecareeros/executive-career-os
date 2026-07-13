import "server-only";
import type { SupabaseDataClient } from "@/lib/supabase/client";

export type InvitationStatus = "Pending" | "Accepted" | "Expired" | "Revoked";
export interface ManagedInvitation {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  revokedAt?: string;
  createdBy: string;
}

interface InvitationRow { invitation_id:string;invited_email:string;intended_role:string;invitation_status:InvitationStatus;created_at:string;expires_at:string;accepted_at:string|null;revoked_at:string|null;created_by:string }
interface CreatedRow { invitation_id:string;invite_token:string }
interface IdentityRow { id:string;profile:Record<string,unknown> }

function creatorName(profile: Record<string,unknown> | undefined) {
  const preferred = profile?.preferredName ?? profile?.displayName ?? profile?.name;
  return typeof preferred === "string" && preferred.trim() ? preferred : "Founder";
}

export class FounderInvitationService {
  constructor(private readonly client:SupabaseDataClient,private readonly workspaceId:string){}

  async list():Promise<ManagedInvitation[]> {
    const response=await this.client.request<InvitationRow[]>("rpc/list_beta_invitations",{method:"POST",body:JSON.stringify({target_workspace:this.workspaceId})});
    if(response.error)throw new Error(response.error.message);
    const rows=response.data??[];
    const creatorIds=[...new Set(rows.map(row=>row.created_by))];
    const identities=creatorIds.length?await this.client.request<IdentityRow[]>(`executive_identities?select=id,profile&id=in.(${creatorIds.join(",")})`):{data:[] as IdentityRow[],status:200};
    const names=new Map((identities.data??[]).map(row=>[row.id,creatorName(row.profile)]));
    return rows.map(row=>({id:row.invitation_id,email:row.invited_email,role:row.intended_role,status:row.invitation_status,createdAt:row.created_at,expiresAt:row.expires_at,acceptedAt:row.accepted_at??undefined,revokedAt:row.revoked_at??undefined,createdBy:names.get(row.created_by)??"Founder"}));
  }

  async create(email:string,expiresAt:string){
    const response=await this.client.request<CreatedRow[]>("rpc/create_beta_invitation",{method:"POST",body:JSON.stringify({target_workspace:this.workspaceId,target_email:email,target_role:"Executive",expiry:expiresAt})});
    if(response.error)throw new Error(response.error.message);
    const created=response.data?.[0];if(!created)throw new Error("Invitation was not created.");
    return {id:created.invitation_id,token:created.invite_token};
  }

  async revoke(id:string){
    const response=await this.client.request<string>("rpc/revoke_beta_invitation",{method:"POST",body:JSON.stringify({target_invitation:id})});
    if(response.error)throw new Error(response.error.message);
  }
}
