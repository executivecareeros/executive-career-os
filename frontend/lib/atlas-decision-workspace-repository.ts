import "server-only";
import type { AtlasDecisionWorkspace } from "@/lib/discovery/atlas-decision-workspace";
import type { SupabaseDataClient } from "@/lib/supabase/client";

type WorkspaceEventRow = { sequence_number: number; event_type: string; payload: AtlasDecisionWorkspace; occurred_at: string };

export type PersistedAtlasWorkspace = {
  workspace: AtlasDecisionWorkspace;
  sequence: number;
  lastEventType: string;
  persistedAt: string;
};

export async function loadAtlasDecisionWorkspace(client: SupabaseDataClient, workspaceId: string, opportunityRowId: string): Promise<PersistedAtlasWorkspace | undefined> {
  const response = await client.request<WorkspaceEventRow[]>(`atlas_decision_workspace_events?select=sequence_number,event_type,payload,occurred_at&workspace_id=eq.${workspaceId}&opportunity_id=eq.${opportunityRowId}&order=sequence_number.desc&limit=1`);
  if (response.error) throw new Error("The private Atlas workspace could not be loaded safely.");
  const row = response.data?.[0];
  return row ? { workspace: { ...row.payload, decisions: row.payload.decisions ?? [] }, sequence: row.sequence_number, lastEventType: row.event_type, persistedAt: row.occurred_at } : undefined;
}

export async function appendAtlasDecisionWorkspace(client: SupabaseDataClient, input: { workspaceId: string; opportunityRowId: string; canonicalOpportunityId: string; expectedSequence: number; eventType: string; workspace: AtlasDecisionWorkspace; occurredAt: string }) {
  const response = await client.request<{ sequence?: number; status?: string }>("rpc/append_atlas_decision_workspace_event", {
    method: "POST",
    body: JSON.stringify({ request: input }),
  });
  if (response.error) throw new Error(response.error.message || "The Atlas workspace change could not be saved.");
  return response.data;
}
