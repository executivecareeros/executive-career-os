import { redirect } from "next/navigation";
import { AuthField, AuthFrame, FormMessage } from "@/components/auth/auth-frame";
import { currentSession } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { onboardingAction } from "../auth-actions";

export default async function Onboarding({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [q, session] = await Promise.all([searchParams, currentSession()]);
  if (!session) redirect("/login?next=/onboarding");
  const membership = await createServerSupabaseClient(session.accessToken).request<Array<{ id: string }>>("workspace_memberships?select=id&status=eq.Active&archived_at=is.null&limit=1");
  if (membership.data?.length) redirect("/");

  return <AuthFrame eyebrow="Welcome to Orendalis" title="How would you like to begin?" description="Upload your CV and let Atlas prepare the basics, or go straight to executive job search. You can complete your profile later.">
    <FormMessage message={q.error} />
    <form action={onboardingAction} className="space-y-5">
      <AuthField label="What should we call you?" name="preferredName" autoComplete="given-name" />
      <input type="hidden" name="currentRole" value="To be confirmed" />
      <input type="hidden" name="country" value="Not provided" />
      <input type="hidden" name="preferredLanguage" value="English" />
      <input type="hidden" name="timezone" value="UTC" />
      <input type="hidden" name="careerAmbition" value="To be discovered progressively" />
      <input type="hidden" name="atlasPromiseAccepted" value="on" />
      <div className="grid gap-3">
        <button name="intent" value="upload" className="rounded-2xl bg-[#17191c] p-5 text-left text-white hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7894a6]"><strong className="text-base">Upload my CV</strong><span className="mt-1 block text-sm text-white/70">Atlas prepares a private draft for your review.</span></button>
        <button name="intent" value="skip" className="rounded-2xl border border-[#d9dcde] bg-white p-5 text-left text-[#202327] hover:bg-[#f7f8f8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7894a6]"><strong className="text-base">Skip for now</strong><span className="mt-1 block text-sm text-[#6c7278]">Go directly to executive job search.</span></button>
      </div>
      <p className="text-xs leading-5 text-[#7a8086]">Atlas explains its recommendations, never silently changes your history, and leaves every decision with you.</p>
    </form>
  </AuthFrame>;
}
