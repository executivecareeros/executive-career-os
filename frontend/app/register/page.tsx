import Link from "next/link";
import { AuthField, AuthFrame, FormMessage, SubmitButton } from "@/components/auth/auth-frame";
import { registerAction } from "../auth-actions";

export default async function Register({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const invite = q.invite?.trim();
  const invitedEmail = q.email?.trim().toLowerCase();
  return <AuthFrame locale="en" eyebrow="Create your private account" title={invite ? "Join ORENDALIS" : "Start your executive search."} description="Create your account. Then upload your CV or go straight to job search." footer={<>Already have an account? <Link className="text-[#52758a]" href="/login">Sign in</Link></>}>
    <FormMessage message={q.error}/><form action={registerAction} className="space-y-5">{invite && <input type="hidden" name="inviteToken" value={invite}/>}<AuthField label="Email address" name="email" type="email" autoComplete="email" defaultValue={invitedEmail} readOnly={Boolean(invite && invitedEmail)}/><AuthField label="Password" name="password" type="password" autoComplete="new-password"/><p className="text-xs text-[#747a80]">Use at least 8 characters. You will verify your email before continuing.</p><SubmitButton>Create account</SubmitButton></form>
  </AuthFrame>;
}
