import { LiveWorkspaceEmptyState } from "@/components/live-workspace-empty-state";

const modules = {
  workspace: ["Your Workspace", "Your private professional home is active.", "Begin with confirmed career context"],
  atlas: ["Atlas", "Evidence-led decision support grounded only in your confirmed records.", "Atlas is waiting for your first opportunity context"],
  companies: ["Companies", "Research and compare companies connected to your career decisions.", "No confirmed companies yet"],
  applications: ["Applications", "Track applications that you choose to pursue.", "No applications yet"],
  compensation: ["Compensation", "Preserve confirmed compensation evidence and negotiation history.", "No compensation records yet"],
  discovery: ["Discovery", "Review opportunities from connected, attributable sources.", "No discovery sources are active"],
  knowledge: ["Knowledge", "Preserve verified observations without inventing conclusions.", "No confirmed observations yet"],
  memory: ["Executive Memory", "Atlas remembers only evidence you confirm.", "No confirmed memories yet"],
  repositories: ["Repository Health", "Operational data access remains isolated from executive career content.", "No repository diagnostics are available here"],
  interview: ["Interview Preparation", "Prepare from confirmed company, role, and career evidence.", "No upcoming interview context yet"],
  negotiation: ["Negotiation Planner", "Compare confirmed offer terms, targets, and trade-offs.", "No active negotiation yet"],
  decisions: ["Decision Workspace", "Compare opportunities using confirmed evidence and explicit trade-offs.", "No decisions ready to compare"],
  notes: ["Executive Notes", "Keep structured notes linked to confirmed career context.", "No notes yet"],
  ledger: ["Career Ledger", "Your permanent record of confirmed career events and decisions.", "No executive decisions recorded yet"],
  opportunities: ["Opportunities", "Assess opportunities against your confirmed Blueprint.", "No confirmed opportunities yet"],
} as const;

type ModuleKey = keyof typeof modules;

export default async function LiveModulePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const key = query.module && query.module in modules ? query.module as ModuleKey : "workspace";
  const [title, description, emptyTitle] = modules[key];
  return <LiveWorkspaceEmptyState title={title} description={description} emptyTitle={emptyTitle} emptyDescription="Complete the guided founder journey to add the first confirmed record. Demonstration data is isolated from this staging Workspace." actionHref="/beta-workflow" actionLabel="Continue your guided journey" />;
}
