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
