import "server-only";
import { currentSession } from "./session";
import { resolveAuthenticatedRepositoryContext } from "./repository-context";

export async function resolveFounderAccess(){
  const session=await currentSession();
  if(!session)return undefined;
  const configuredEmail=process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase();
  const authorizedEmails=new Set(["cuneyt.sen@orendalis.com",configuredEmail].filter((email):email is string=>Boolean(email)));
  if(!session.user.email||!authorizedEmails.has(session.user.email.toLowerCase()))return undefined;
  const resolved=await resolveAuthenticatedRepositoryContext({requiredRole:"Owner"});
  if(!resolved||!resolved.context.workspace||resolved.context.workspace.role!=="Owner")return undefined;
  return {...resolved,email:session.user.email};
}
