import Link from "next/link";
import { AuthField, AuthFrame, FormMessage, SubmitButton } from "@/components/auth/auth-frame";
import { registerAction } from "../auth-actions";

export default async function Register({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const invite = q.invite?.trim();
  const invitedEmail = q.email?.trim().toLowerCase();
  return <AuthFrame locale="en" eyebrow="Invitation-only access" title={invite ? "Accept your invitation" : "Invitation required"} description={invite ? "Create your account. Then upload your CV or go straight to job search." : "A valid ORENDALIS invitation link is required to create an account."} footer={<>Already have an account? <Link className="text-[#52758a]" href="/login">Sign in</Link></>}>
    {invite ? <><FormMessage message={q.error}/><form action={registerAction} className="space-y-5"><input type="hidden" name="inviteToken" value={invite}/><AuthField label="Invited email address" name="email" type="email" autoComplete="email" defaultValue={invitedEmail} readOnly={Boolean(invitedEmail)}/><AuthField label="Password" name="password" type="password" autoComplete="new-password"/><p className="text-xs text-[#747a80]">Use at least 8 characters. You will verify your email before continuing.</p><SubmitButton>Create account</SubmitButton></form></> : <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Registration cannot continue without an ORENDALIS invitation.</p>}
  </AuthFrame>;
}
