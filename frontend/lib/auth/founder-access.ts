import "server-only";
import { currentSession } from "./session";
import { resolveAuthenticatedRepositoryContext } from "./repository-context";
import { founderBootstrapStatus } from "./founder-bootstrap";

export async function resolveFounderAccess(){
  const session=await currentSession();
  if(!session)return undefined;
  const founderEmail=process.env.COMPANY_CONTROL_FOUNDER_EMAIL?.trim().toLowerCase();
  if(founderEmail&&session.user.email?.toLowerCase()!==founderEmail)return undefined;
  const resolved=await resolveAuthenticatedRepositoryContext({requiredRole:"Owner"});
  if(!resolved||!resolved.context.workspace||resolved.context.workspace.role!=="Owner")return undefined;
  const bootstrap=await founderBootstrapStatus(session.accessToken).catch(()=>undefined);
  if(bootstrap?.status!=="COMPLETE")return undefined;
  return {...resolved,email:session.user.email};
}
