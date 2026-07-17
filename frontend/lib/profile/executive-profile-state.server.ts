import "server-only";
import type{SupabaseDataClient}from"@/lib/supabase/client";
import{deriveExecutiveProfileState,type CvImportSession,type ExecutiveProfileState,type ProfileExperienceEvidence}from"./executive-profile-state";

export async function loadExecutiveProfileState(client:SupabaseDataClient,workspaceId:string,executiveId:string):Promise<ExecutiveProfileState>{
  const[sessions,experiences]=await Promise.all([client.request<CvImportSession[]>(`history_import_sessions?select=id,source_filename,status,stage,summary,created_at,completed_at&workspace_id=eq.${workspaceId}&executive_identity_id=eq.${executiveId}&source_type=eq.Document%20Import&order=created_at.desc`),client.request<ProfileExperienceEvidence[]>(`professional_experiences?select=id,confidence,created_at&workspace_id=eq.${workspaceId}&executive_identity_id=eq.${executiveId}&archived_at=is.null&order=created_at.desc`)]);
  if(sessions.error||experiences.error)throw new Error("EXECUTIVE_PROFILE_STATE_UNAVAILABLE");
  return deriveExecutiveProfileState(sessions.data??[],experiences.data??[]);
}
