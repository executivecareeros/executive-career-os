import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,"..");
const read=(path)=>readFile(resolve(root,path),"utf8");
const [welcome,dashboard,workflow,progress,actions]=await Promise.all([read("app/welcome/page.tsx"),read("app/page.tsx"),read("app/beta-workflow/page.tsx"),read("components/beta/beta-journey-progress.tsx"),read("app/beta-workflow/actions.ts")]);
const checks={
  onboarding_success_continues_to_journey:welcome.includes('href="/beta-workflow#professional-history"')&&welcome.includes(">Continue</Link>"),
  dashboard_resumes_journey:dashboard.includes('href="/beta-workflow"')&&dashboard.includes('href="/beta-workflow#professional-history"'),
  all_required_steps_visible:["Workspace","Professional History","Executive Blueprint","Opportunity","Atlas Assessment","Decision","Career Ledger","Feedback"].every(label=>progress.includes(`label:"${label}"`)),
  all_required_states:["Complete","Current","Not Started","Locked"].every(status=>progress.includes(`"${status}"`)),
  current_step_has_one_continue:progress.includes('aria-current="step"')&&progress.includes('>Continue</Link>'),
  locked_stages_explain_unlock:workflow.includes("This stage will open automatically")&&workflow.includes('complete.has("Professional History") ?')&&workflow.includes('complete.has("Blueprint") ?'),
  successful_stages_advance:actions.includes('execute(repo=>repo.saveHistory')&&actions.includes(',"blueprint")')&&actions.includes('execute(repo=>repo.saveBlueprint')&&actions.includes(',"opportunity")')&&actions.includes('execute(repo=>repo.saveOpportunity')&&actions.includes(',"assessment")'),
};
const failures=Object.entries(checks).filter(([,passed])=>!passed);
if(failures.length)throw new Error(`Beta discoverability checks failed: ${failures.map(([name])=>name).join(", ")}`);
console.log(`PASS Beta workflow discoverability — ${Object.keys(checks).join(", ")}`);
