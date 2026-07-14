"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeFilename } from "@/lib/import/file-policy";

const text=(form:FormData,key:string)=>String(form.get(key)??"").trim();const list=(form:FormData,key:string)=>text(form,key).split("\n").map(value=>value.trim()).filter(Boolean);const number=(form:FormData,key:string)=>{const value=text(form,key);return value===""?undefined:Number(value);};
async function repository(){const resolved=await resolveAuthenticatedRepositoryContext();if(!resolved)redirect("/login?error=Your%20session%20expired");return new SupabaseBetaWorkflowRepository(createServerSupabaseClient(resolved.accessToken),resolved.context);}
async function execute(operation:(repo:SupabaseBetaWorkflowRepository)=>Promise<unknown>,nextSection?:string){try{await operation(await repository());revalidatePath("/beta-workflow");}catch(error){redirect(`/beta-workflow?error=${encodeURIComponent(error instanceof Error?error.message:"The saved step failed")}`);}if(nextSection)redirect(`/beta-workflow#${nextSection}`);}
export async function saveHistoryAction(form:FormData){await execute(repo=>repo.saveHistory({organizationName:text(form,"organizationName"),roleTitle:text(form,"roleTitle"),startDate:text(form,"startDate")||undefined,endDate:text(form,"endDate")||undefined,isCurrent:form.get("isCurrent")==="on",notes:text(form,"notes")||undefined}),"blueprint");}
export async function saveHistoryImportAction(form:FormData){
  const organizations=form.getAll("organizationName").map(String),roles=form.getAll("roleTitle").map(String),starts=form.getAll("startDate").map(String),ends=form.getAll("endDate").map(String),current=form.getAll("isCurrent").map(String),decisions=form.getAll("decision").map(String),filename=sanitizeFilename(text(form,"sourceFilename"));
  const lengths=[roles.length,starts.length,ends.length,current.length,decisions.length];
  if(!filename||organizations.length===0||organizations.length>20||lengths.some(length=>length!==organizations.length))redirect("/beta-workflow?error=The%20reviewed%20history%20draft%20is%20invalid");
  const accepted=decisions.map((decision,index)=>({decision,index})).filter(({decision})=>decision==="Accept"||decision==="Edit");
  if(!accepted.length)redirect("/beta-workflow?error=Confirm%20at%20least%20one%20reviewed%20role%20before%20continuing");
  await execute(async repo=>{for(const {index} of accepted){
    const organizationName=organizations[index].trim(),roleTitle=roles[index].trim(),startDate=starts[index]||undefined,endDate=ends[index]||undefined;
    if(!organizationName||!roleTitle||organizationName.length>200||roleTitle.length>200)throw new Error("Every accepted role requires a valid organization and title.");
    if((startDate&&!/^\d{4}-\d{2}$/.test(startDate))||(endDate&&!/^\d{4}-\d{2}$/.test(endDate)))throw new Error("Imported role dates must use year and month.");
    await repo.saveHistory({organizationName,roleTitle,startDate,endDate,isCurrent:current[index]==="true",sourceType:"Document Import",sourceFilename:filename});
  }},"blueprint");
}
export async function saveBlueprintAction(form:FormData){await execute(repo=>repo.saveBlueprint({careerVision:text(form,"careerVision"),preferredIndustries:list(form,"preferredIndustries"),preferredCountries:list(form,"preferredCountries"),minimumCompensation:number(form,"minimumCompensation"),currency:text(form,"currency")||undefined,maximumTravelPercent:number(form,"maximumTravelPercent"),leadershipLevel:text(form,"leadershipLevel"),constraints:list(form,"constraints")}),"opportunity");}
export async function saveOpportunityAction(form:FormData){await execute(repo=>repo.saveOpportunity({title:text(form,"title"),companyName:text(form,"companyName"),location:text(form,"location"),workModel:text(form,"workModel"),source:text(form,"source"),recruiterContext:text(form,"recruiterContext")||undefined,compensationMin:number(form,"compensationMin"),compensationMax:number(form,"compensationMax"),currency:text(form,"currency")||undefined,constraints:list(form,"constraints"),knownFacts:list(form,"knownFacts"),unverifiedClaims:list(form,"unverifiedClaims"),notes:text(form,"notes")||undefined}),"assessment");}
export async function runReasoningAction(){await execute(repo=>repo.runReasoning());}
export async function finalizeDecisionAction(form:FormData){await execute(repo=>repo.finalize(text(form,"selectedAction"),text(form,"idempotencyKey")||randomUUID()),"assessment");}
export async function submitFeedbackAction(form:FormData){await execute(repo=>repo.submitFeedback({route:"/beta-workflow",workflowStep:text(form,"workflowStep"),category:text(form,"category"),severity:text(form,"severity"),description:text(form,"description"),expectedBehavior:text(form,"expectedBehavior")||undefined,consentToFollowUp:form.get("consentToFollowUp")==="on"}));}
export async function submitLifecycleAction(form:FormData){await execute(repo=>repo.requestLifecycle({requestType:text(form,"requestType") as "Export"|"Account Closure"|"Deletion"|"Consent Withdrawal",userNote:text(form,"userNote")||undefined}));}
