import type { SupabaseDataClient } from "@/lib/supabase/client";
import type { OnboardingProfile } from "@/lib/auth/types";

export type WorkspaceProvisionResult = { ok: true; workspaceId: string } | { ok: false; message: string };

export class SupabaseOnboardingRepository {
  constructor(private readonly client: SupabaseDataClient) {}
  async provision(profile: OnboardingProfile): Promise<WorkspaceProvisionResult> {
    const response = await this.client.request<string>("rpc/provision_invited_beta_workspace", { method: "POST", body: JSON.stringify({ onboarding: profile }) });
    return response.error ? { ok: false, message: response.error.message } : { ok: true, workspaceId: response.data ?? "" };
  }
}
