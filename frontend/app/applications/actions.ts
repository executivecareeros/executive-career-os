"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function archiveApplicationAction(formData: FormData) {
  const applicationId = String(formData.get("applicationId") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(applicationId)) throw new Error("The application reference is invalid.");
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/applications");
  const workspaceId = resolved.context.workspace!.workspaceId;
  const now = new Date().toISOString();
  const response = await createServerSupabaseClient(resolved.accessToken).request(`applications?id=eq.${applicationId}&workspace_id=eq.${workspaceId}&archived_at=is.null`, { method: "PATCH", body: JSON.stringify({ archived_at: now, updated_at: now }) });
  if (response.error) throw new Error("The application could not be removed safely.");
  revalidatePath("/applications");
  redirect("/applications?removed=1");
}

export async function hidePursueDecisionAction(formData: FormData) {
  const opportunityId = String(formData.get("opportunityId") ?? "").trim();
  if (!opportunityId.startsWith("discovered-") || opportunityId.length > 300) throw new Error("The decision reference is invalid.");
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/applications");
  const workspaceId = resolved.context.workspace!.workspaceId;
  const client = createServerSupabaseClient(resolved.accessToken);
  const rows = await client.request<Array<{ id: string; payload: Record<string, unknown> }>>(`opportunities?select=id,payload&workspace_id=eq.${workspaceId}&domain_id=eq.${encodeURIComponent(opportunityId)}&archived_at=is.null&limit=1`);
  const row = rows.data?.[0];
  if (rows.error || !row) throw new Error("The decision record could not be found safely.");
  const now = new Date().toISOString();
  const decision = typeof row.payload.executiveDecision === "object" && row.payload.executiveDecision ? row.payload.executiveDecision as Record<string, unknown> : {};
  const payload = { ...row.payload, executiveDecision: { ...decision, hiddenFromApplicationsAt: now } };
  const updated = await client.request(`opportunities?id=eq.${row.id}&workspace_id=eq.${workspaceId}`, { method: "PATCH", body: JSON.stringify({ payload, updated_at: now }) });
  if (updated.error) throw new Error("The decision record could not be removed safely.");
  revalidatePath("/applications");
  redirect("/applications?removed=1");
}
