import "server-only";
import { randomUUID } from "node:crypto";
import { currentSession } from "./session";
import { resolveActiveMembership, type ActiveWorkspaceMembership } from "./active-membership";
import type { RepositoryContext } from "@/lib/repositories/types";

export async function resolveAuthenticatedRepositoryContext(options?:{requiredRole?:ActiveWorkspaceMembership["role"]}): Promise<{ context: RepositoryContext; accessToken: string } | undefined> {
  const session = await currentSession(); if (!session) return undefined;
  const row = await resolveActiveMembership(session.accessToken, session.user.id, options?.requiredRole);
  if (!row) return undefined;
  const requestId = randomUUID();
  return { accessToken: session.accessToken, context: { requestId, actorId: row.executive_identity_id, correlationId: requestId, timestamp: new Date().toISOString(), workspace: { workspaceId: row.workspace_id, executiveId: row.executive_identity_id, membershipId: row.id, role: row.role, permissionScope: [], language: "en", timezone: "UTC", capabilities: [], requestId, isDemo: false } } };
}
