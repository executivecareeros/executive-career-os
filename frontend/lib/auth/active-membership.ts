import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActiveWorkspaceMembership = {
  id: string;
  workspace_id: string;
  executive_identity_id: string;
  role: "Owner" | "Executive" | "Assistant" | "Coach" | "Search Consultant" | "Administrator" | "Viewer";
};

export async function resolveActiveMembership(
  accessToken: string,
  authUserId: string,
  requiredRole?: ActiveWorkspaceMembership["role"],
): Promise<ActiveWorkspaceMembership | undefined> {
  const client = createServerSupabaseClient(accessToken);
  const identity = await client.request<Array<{ id: string }>>(
    `executive_identities?select=id&auth_user_id=eq.${encodeURIComponent(authUserId)}&status=eq.Active&limit=1`,
  );
  const executiveIdentityId = identity.data?.[0]?.id;
  if (!executiveIdentityId) return undefined;

  const roleFilter = requiredRole ? `&role=eq.${encodeURIComponent(requiredRole)}` : "";
  const membership = await client.request<ActiveWorkspaceMembership[]>(
    `workspace_memberships?select=id,role,workspace_id,executive_identity_id&executive_identity_id=eq.${encodeURIComponent(executiveIdentityId)}&status=eq.Active&archived_at=is.null${roleFilter}&limit=1`,
  );
  return membership.data?.[0];
}
