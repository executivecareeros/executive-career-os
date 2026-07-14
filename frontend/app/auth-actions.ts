"use server";
import { redirect } from "next/navigation";
import { clearSession, storeSession } from "@/lib/auth/cookies";
import { currentSession } from "@/lib/auth/session";
import { supabaseAuth } from "@/lib/auth/supabase-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseOnboardingRepository } from "@/lib/repositories/supabase/onboarding-repository";
import {applicationOrigin} from "@/lib/auth/application-origin";
import {
  acceptRememberedInvitation,
  inspectInvitation,
  inspectRememberedInvitation,
  rememberInvitation,
} from "@/lib/beta/invitations";

function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}
function safePath(candidate: string) {
  return candidate.startsWith("/") && !candidate.startsWith("//")
    ? candidate
    : undefined;
}
async function origin() {
  return applicationOrigin();
}

export async function loginAction(form: FormData) {
  let hasWorkspace = false;
  try {
    const session = await supabaseAuth.signIn(
      value(form, "email"),
      value(form, "password"),
    );
    await acceptRememberedInvitation(session.access_token);
    await storeSession(session, form.get("remember") === "on");
    const membership = await createServerSupabaseClient(
      session.access_token,
    ).request<Array<{ id: string }>>(
      "workspace_memberships?select=id&status=eq.Active&archived_at=is.null&limit=1",
    );
    hasWorkspace = Boolean(membership.data?.length);
  } catch (error) {
    redirect(
      `/login?error=${encodeURIComponent(error instanceof Error ? error.message : "Unable to sign in")}`,
    );
  }
  redirect(safePath(value(form, "next")) ?? (hasWorkspace ? "/" : "/welcome"));
}
export async function registerAction(form: FormData) {
  const password = value(form, "password"),
    email = value(form, "email"),
    inviteToken = value(form, "inviteToken");
  if (password.length < 8)
    redirect(
      `/register?invite=${encodeURIComponent(inviteToken)}&error=Password%20must%20contain%20at%20least%208%20characters`,
    );
  try {
    const invitation = await inspectInvitation(email, inviteToken);
    if (invitation.invitation_status !== "Pending")
      throw new Error(
        `Invitation is ${invitation.invitation_status.toLowerCase()}.`,
      );
    await rememberInvitation(inviteToken);
    await supabaseAuth.signUp(
      email,
      password,
      `${await origin()}/auth/confirm?next=/onboarding`,
    );
  } catch (error) {
    redirect(
      `/register?invite=${encodeURIComponent(inviteToken)}&error=${encodeURIComponent(error instanceof Error ? error.message : "Unable to register")}`,
    );
  }
  redirect(`/verify-email?email=${encodeURIComponent(email)}&sent=1`);
}
export async function resendVerificationAction(form:FormData){const email=value(form,"email").toLowerCase();let outcome="sent";try{const invitation=await inspectRememberedInvitation(email);if(invitation.invitation_status!=="Pending")outcome=invitation.invitation_status.toLowerCase();else await supabaseAuth.resendVerification(email,`${await origin()}/auth/confirm?next=/onboarding`);}catch{}redirect(`/verify-email?email=${encodeURIComponent(email)}&${outcome}=1`);}
export async function forgotPasswordAction(form: FormData) {
  try {
    await supabaseAuth.recover(
      value(form, "email"),
      `${await origin()}/reset-password`,
    );
  } catch {}
  redirect("/forgot-password?sent=1");
}
export async function resetPasswordAction(form: FormData) {
  const session = await currentSession();
  if (!session) redirect("/login?error=Password%20reset%20session%20expired");
  await supabaseAuth.updatePassword(
    session.accessToken,
    value(form, "password"),
  );
  redirect("/login?reset=1");
}
export async function logoutAction(form: FormData) {
  const session = await currentSession();
  if (session)
    await supabaseAuth.logout(session.accessToken).catch(() => undefined);
  await clearSession();
  const next = safePath(value(form, "next"));
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
}
export async function onboardingAction(form: FormData) {
  const session = await currentSession();
  if (!session) redirect("/login?error=Your%20session%20expired");
  const payload = {
    preferredName: value(form, "preferredName"),
    currentRole: value(form, "currentRole"),
    currentEmployer: value(form, "currentEmployer") || undefined,
    country: value(form, "country"),
    preferredLanguage: value(form, "preferredLanguage"),
    timezone: value(form, "timezone"),
    careerAmbition: value(form, "careerAmbition"),
    atlasPromiseAccepted: form.get("atlasPromiseAccepted") === "on",
  };
  const response = await new SupabaseOnboardingRepository(
    createServerSupabaseClient(session.accessToken),
  ).provision(payload);
  if (!response.ok)
    redirect(`/onboarding?error=${encodeURIComponent(response.message)}`);
  const intent = value(form, "intent");
  redirect(intent === "upload" ? "/import" : "/opportunities");
}
