import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type FounderBootstrapStatus = "READY" | "COMPLETE" | "CLOSED" | "CONFIGURATION_MISSING" | "EMAIL_VERIFICATION_REQUIRED" | "UNAUTHORIZED" | "AUTHENTICATION_REQUIRED";

interface StatusRow { status: FounderBootstrapStatus; email_verified: boolean; bootstrap_complete: boolean }
interface ResultRow { status: "COMPLETE" | "ALREADY_BOOTSTRAPPED" | "CLOSED" | "AUTHENTICATION_REQUIRED" | "CONFIGURATION_MISSING" | "EMAIL_VERIFICATION_REQUIRED" | "UNAUTHORIZED" | "ATLAS_PROMISE_REQUIRED" | "FRESH_STATE_REQUIRED"; identity_id: string|null; workspace_id: string|null; membership_id: string|null }

export async function founderBootstrapStatus(accessToken: string): Promise<StatusRow> {
  const response = await createServerSupabaseClient(accessToken).request<StatusRow[]>("rpc/get_initial_founder_bootstrap_status", { method: "POST", body: "{}" });
  if (response.error || !response.data?.[0]) throw new Error("Founder bootstrap status is temporarily unavailable.");
  return response.data[0];
}

export async function bootstrapFounder(accessToken: string, atlasPromiseAccepted: boolean): Promise<ResultRow> {
  const response = await createServerSupabaseClient(accessToken).request<ResultRow[]>("rpc/bootstrap_initial_founder", { method: "POST", body: JSON.stringify({ atlas_promise_accepted: atlasPromiseAccepted }) });
  if (response.error || !response.data?.[0]) throw new Error(response.error?.message ?? "Founder bootstrap could not be completed.");
  return response.data[0];
}
