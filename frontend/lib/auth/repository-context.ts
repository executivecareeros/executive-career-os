import "server-only";
import { randomUUID } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { currentSession } from "./session";
import type { RepositoryContext } from "@/lib/repositories/types";

interface ContextRow { id: string; workspace_id: string; executive_identity_id: string; role: "Owner"|"Executive"|"Assistant"|"Coach"|"Search Consultant"|"Administrator"|"Viewer" }
export async function resolveAuthenticatedRepositoryContext(): Promise<{ context: RepositoryContext; accessToken: string } | undefined> {
  const session = await currentSession(); if (!session) return undefined;
  const client = createServerSupabaseClient(session.accessToken);
  const response = await client.request<ContextRow[]>("workspace_memberships?select=id,role,workspace_id,executive_identity_id&status=eq.Active&archived_at=is.null&limit=1");
  const row = response.data?.[0]; if (!row) return undefined;
  const requestId = randomUUID();
  return { accessToken: session.accessToken, context: { requestId, actorId: row.executive_identity_id, correlationId: requestId, timestamp: new Date().toISOString(), workspace: { workspaceId: row.workspace_id, executiveId: row.executive_identity_id, membershipId: row.id, role: row.role, permissionScope: [], language: "en", timezone: "UTC", capabilities: [], requestId, isDemo: true } } };
}
