import type { SupabaseDataClient } from "@/lib/supabase/client";
import type { RepositoryContext } from "@/lib/repositories";
import { founderGeographicProfileFixture, type ExecutiveGeographicProfile, unknownGeographicProfile } from "@/lib/opportunity-geography";

type Row = { id: string; payload: Record<string, unknown>; version: number };

function isProfile(value: unknown): value is ExecutiveGeographicProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<ExecutiveGeographicProfile>;
  return Boolean(profile.homeCountry && profile.currentCountry && profile.citizenships && profile.workAuthorizations && profile.preferredCountries && profile.excludedCountries);
}

export async function loadExecutiveGeographicProfile(client: SupabaseDataClient, context: RepositoryContext) {
  const workspaceId = context.workspace!.workspaceId, executiveId = context.workspace!.executiveId;
  const response = await client.request<Row[]>(`executive_geographic_profiles?select=id,payload,version&workspace_id=eq.${workspaceId}&executive_identity_id=eq.${executiveId}&limit=1`);
  if (response.error) {
    if (/does not exist|schema cache/i.test(response.error.message)) return unknownGeographicProfile();
    throw new Error(response.error.message);
  }
  return isProfile(response.data?.[0]?.payload) ? response.data[0].payload : unknownGeographicProfile();
}

export async function confirmFounderGeographicProfile(client: SupabaseDataClient, context: RepositoryContext, confirmedAt = new Date().toISOString()) {
  const workspaceId = context.workspace!.workspaceId, executiveId = context.workspace!.executiveId;
  const existing = await client.request<Row[]>(`executive_geographic_profiles?select=id,payload,version&workspace_id=eq.${workspaceId}&executive_identity_id=eq.${executiveId}&limit=1`);
  if (existing.error) throw new Error(existing.error.message);
  const payload = founderGeographicProfileFixture(confirmedAt), row = existing.data?.[0];
  if (row) {
    const updated = await client.request(`executive_geographic_profiles?id=eq.${row.id}&version=eq.${row.version}`, { method: "PATCH", body: JSON.stringify({ payload, version: row.version + 1, updated_at: confirmedAt }) });
    if (updated.error) throw new Error(updated.error.message);
  } else {
    const inserted = await client.request("executive_geographic_profiles", { method: "POST", body: JSON.stringify({ workspace_id: workspaceId, executive_identity_id: executiveId, payload, created_by: executiveId }) });
    if (inserted.error) throw new Error(inserted.error.message);
  }
  return payload;
}
