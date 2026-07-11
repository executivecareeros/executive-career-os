"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { clearSession, storeSession } from "@/lib/auth/cookies";
import { currentSession } from "@/lib/auth/session";
import { supabaseAuth } from "@/lib/auth/supabase-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseOnboardingRepository } from "@/lib/repositories/supabase/onboarding-repository";

function value(form: FormData, key: string) { return String(form.get(key) ?? "").trim(); }
async function origin() { const h = await headers(); return h.get("origin") ?? "http://localhost:3000"; }

export async function loginAction(form: FormData) {
  try { const session = await supabaseAuth.signIn(value(form,"email"),value(form,"password")); await storeSession(session,form.get("remember")==="on"); } catch (error) { redirect(`/login?error=${encodeURIComponent(error instanceof Error?error.message:"Unable to sign in")}`); }
  redirect("/welcome");
}
export async function registerAction(form: FormData) {
  const password=value(form,"password"); if(password.length<8) redirect("/register?error=Password%20must%20contain%20at%20least%208%20characters");
  try { const session=await supabaseAuth.signUp(value(form,"email"),password,`${await origin()}/login?verified=1`); if(session.access_token) await storeSession(session,true); else redirect("/login?verification=sent"); } catch(error){redirect(`/register?error=${encodeURIComponent(error instanceof Error?error.message:"Unable to register")}`);} redirect("/welcome");
}
export async function forgotPasswordAction(form:FormData){try{await supabaseAuth.recover(value(form,"email"),`${await origin()}/reset-password`);}catch{}redirect("/forgot-password?sent=1");}
export async function resetPasswordAction(form:FormData){const session=await currentSession();if(!session)redirect("/login?error=Password%20reset%20session%20expired");await supabaseAuth.updatePassword(session.accessToken,value(form,"password"));redirect("/login?reset=1");}
export async function logoutAction(){const session=await currentSession();if(session)await supabaseAuth.logout(session.accessToken).catch(()=>undefined);await clearSession();redirect("/login");}
export async function onboardingAction(form:FormData){const session=await currentSession();if(!session)redirect("/login?error=Your%20session%20expired");const payload={preferredName:value(form,"preferredName"),currentRole:value(form,"currentRole"),currentEmployer:value(form,"currentEmployer")||undefined,country:value(form,"country"),preferredLanguage:value(form,"preferredLanguage"),timezone:value(form,"timezone"),careerAmbition:value(form,"careerAmbition"),atlasPromiseAccepted:form.get("atlasPromiseAccepted")==="on"};const response=await new SupabaseOnboardingRepository(createServerSupabaseClient(session.accessToken)).provision(payload);if(!response.ok)redirect(`/onboarding?error=${encodeURIComponent(response.message)}`);redirect("/welcome?ready=1");}
