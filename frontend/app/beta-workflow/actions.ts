"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const text=(form:FormData,key:string)=>String(form.get(key)??"").trim();const list=(form:FormData,key:string)=>text(form,key).split("\n").map(value=>value.trim()).filter(Boolean);const number=(form:FormData,key:string)=>{const value=text(form,key);return value===""?undefined:Number(value);};
async function repository(){const resolved=await resolveAuthenticatedRepositoryContext();if(!resolved)redirect("/login?error=Your%20session%20expired");return new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken),resolved.context);}
async function execute(operation:(repo:SupabaseBetaWorkflowRepository)=>Promise<unknown>){try{await operation(await repository());revalidatePath("/beta-workflow");}catch(error){redirect(`/beta-workflow?error=${encodeURIComponent(error instanceof Error?error.message:"The saved step failed")}`);}}
export async function saveHistoryAction(form:FormData){await execute(repo=>repo.saveHistory({organizationName:text(form,"organizationName"),roleTitle:text(form,"roleTitle"),startDate:text(form,"startDate")||undefined,endDate:text(form,"endDate")||undefined,isCurrent:form.get("isCurrent")==="on",notes:text(form,"notes")||undefined}));}
export async function saveBlueprintAction(form:FormData){await execute(repo=>repo.saveBlueprint({careerVision:text(form,"careerVision"),preferredIndustries:list(form,"preferredIndustries"),preferredCountries:list(form,"preferredCountries"),minimumCompensation:number(form,"minimumCompensation"),currency:text(form,"currency")||undefined,maximumTravelPercent:number(form,"maximumTravelPercent"),leadershipLevel:text(form,"leadershipLevel"),constraints:list(form,"constraints")}));}
export async function saveOpportunityAction(form:FormData){await execute(repo=>repo.saveOpportunity({title:text(form,"title"),companyName:text(form,"companyName"),location:text(form,"location"),workModel:text(form,"workModel"),source:text(form,"source"),recruiterContext:text(form,"recruiterContext")||undefined,compensationMin:number(form,"compensationMin"),compensationMax:number(form,"compensationMax"),currency:text(form,"currency")||undefined,constraints:list(form,"constraints"),knownFacts:list(form,"knownFacts"),unverifiedClaims:list(form,"unverifiedClaims"),notes:text(form,"notes")||undefined}));}
export async function runReasoningAction(){await execute(repo=>repo.runReasoning());}
export async function finalizeDecisionAction(form:FormData){await execute(repo=>repo.finalize(text(form,"selectedAction"),text(form,"idempotencyKey")||randomUUID()));}
export async function submitFeedbackAction(form:FormData){await execute(repo=>repo.submitFeedback({route:"/beta-workflow",workflowStep:text(form,"workflowStep"),category:text(form,"category"),severity:text(form,"severity"),description:text(form,"description"),expectedBehavior:text(form,"expectedBehavior")||undefined,consentToFollowUp:form.get("consentToFollowUp")==="on"}));}
export async function submitLifecycleAction(form:FormData){await execute(repo=>repo.requestLifecycle({requestType:text(form,"requestType") as "Export"|"Account Closure"|"Deletion"|"Consent Withdrawal",userNote:text(form,"userNote")||undefined}));}
