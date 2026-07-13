import "server-only";
import { currentSession } from "./session";
import { resolveAuthenticatedRepositoryContext } from "./repository-context";

export async function resolveFounderAccess(){
  const session=await currentSession();
  const founderEmail=process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase();
  if(!session||!founderEmail||session.user.email?.toLowerCase()!==founderEmail)return undefined;
  const resolved=await resolveAuthenticatedRepositoryContext();
  if(!resolved||!resolved.context.workspace||resolved.context.workspace.role!=="Owner")return undefined;
  return {...resolved,email:session.user.email};
}
