import Link from "next/link";
import {
  AuthField,
  AuthFrame,
  FormMessage,
  SubmitButton,
} from "@/components/auth/auth-frame";
import { loginAction } from "../auth-actions";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  return (
    <AuthFrame
      eyebrow="Private access"
      title="Welcome back."
      description="Your private career office is ready. Continue with the decisions, evidence, and questions you left in your care."
      footer={
        <>
          Entering Orendalis for the first time?{" "}
          <Link className="text-blue-300 hover:text-blue-200" href="/register">
            Accept your invitation
          </Link>
        </>
      }
    >
      <FormMessage message={q.error} />
      <FormMessage
        tone="success"
        message={
          q.verification
            ? "Check your email to verify your address."
            : q.reset
              ? "Your password was updated."
              : q.verified
                ? "Email verified. You may now sign in."
                : undefined
        }
      />
      <form action={loginAction} className="space-y-5">
        <input type="hidden" name="next" value={q.next ?? ""} />
        <AuthField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-300">
            <input
              name="remember"
              type="checkbox"
              className="accent-blue-500"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-blue-300">
            Forgot password?
          </Link>
        </div>
        <SubmitButton>Sign in</SubmitButton>
      </form>
    </AuthFrame>
  );
}
