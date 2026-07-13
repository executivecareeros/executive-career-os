"use server";
import { redirect } from "next/navigation";
import { applicationOrigin } from "@/lib/auth/application-origin";
import { storeSession } from "@/lib/auth/cookies";
import { bootstrapFounder, founderBootstrapStatus } from "@/lib/auth/founder-bootstrap";
import { currentSession } from "@/lib/auth/session";
import { supabaseAuth } from "@/lib/auth/supabase-auth";

function value(form: FormData, key: string) { return String(form.get(key) ?? "").trim(); }
function configuredFounderEmail() { const email=process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase(); if(!email)throw new Error("Founder bootstrap is not configured."); return email; }
function errorPath(message:string){return `/founder-bootstrap?error=${encodeURIComponent(message)}`;}

export async function founderSignUpAction(form: FormData) {
  const email=value(form,"email").toLowerCase(),password=value(form,"password");
  if(password.length<8)redirect(errorPath("Password must contain at least 8 characters."));
  try {
    if(email!==configuredFounderEmail())throw new Error("This account is not authorized for founder initialization.");
    await supabaseAuth.signUp(email,password,`${applicationOrigin()}/auth/confirm?next=/founder-bootstrap`);
  } catch(error) { redirect(errorPath(error instanceof Error?error.message:"Unable to create the founder account.")); }
  redirect(`/verify-email?email=${encodeURIComponent(email)}&sent=1&founder=1`);
}

export async function founderResendVerificationAction(form: FormData) {
  const email=value(form,"email").toLowerCase();
  try { if(email===configuredFounderEmail())await supabaseAuth.resendVerification(email,`${applicationOrigin()}/auth/confirm?next=/founder-bootstrap`); } catch {}
  redirect(`/verify-email?email=${encodeURIComponent(email)}&sent=1&founder=1`);
}

export async function founderSignInAction(form: FormData) {
  try {
    const email=value(form,"email").toLowerCase();
    if(email!==configuredFounderEmail())throw new Error("Unable to sign in to founder initialization.");
    const session=await supabaseAuth.signIn(email,value(form,"password"));
    if(!session.user.email_confirmed_at)throw new Error("Verify the founder email before continuing.");
    await storeSession(session,true);
  } catch(error) { redirect(errorPath(error instanceof Error?error.message:"Unable to sign in.")); }
  redirect("/founder-bootstrap");
}

export async function initializeFounderAction(form: FormData) {
  const session=await currentSession();
  if(!session)redirect("/founder-bootstrap?error=Sign%20in%20with%20the%20verified%20founder%20account.");
  const status=await founderBootstrapStatus(session.accessToken).catch(()=>undefined);
  if(status?.status==="COMPLETE")redirect("/company-control");
  try {
    if(status?.status!=="READY")throw new Error("Founder initialization is not available for this account.");
    if(form.get("atlasPromiseAccepted")!=="on")throw new Error("Accept the Atlas Promise before creating the founder Workspace.");
    const result=await bootstrapFounder(session.accessToken,true);
    if(result.status!=="COMPLETE"&&result.status!=="ALREADY_BOOTSTRAPPED")throw new Error("Founder initialization did not satisfy its protected database preconditions.");
  } catch(error) { redirect(errorPath(error instanceof Error?error.message:"Founder initialization failed.")); }
  redirect("/company-control?bootstrap=complete");
}
