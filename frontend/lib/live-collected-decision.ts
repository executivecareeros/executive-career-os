import "server-only";
import type { SupabaseDataClient } from "@/lib/supabase/client";

type CommitRow = { id: string; opportunity_id: string; reasoning_snapshot_id: string; decision_snapshot_id: string; ledger_entry_id: string; task_id: string; selected_action: string; committed_at: string };
type OpportunityRow = { domain_id: string; title: string; payload: Record<string, unknown> };
type LedgerRow = { id: string; occurred_at: string; payload: Record<string, unknown> };
type TaskRow = { id: string; title: string; priority: string; status: string; payload: Record<string, unknown> };

export type LiveCollectedDecision = {
  commitId: string;
  opportunityId: string;
  title: string;
  companyName: string;
  action: "Pursue" | "Watch" | "Skip";
  committedAt: string;
  reasoningSnapshotId: string;
  decisionSnapshotId: string;
  ledgerEntryId: string;
  task: { id: string; title: string; priority: string; status: string };
};

const executiveAction = (value: string): LiveCollectedDecision["action"] => value === "Apply" ? "Pursue" : value === "Monitor" ? "Watch" : "Skip";

export async function loadLatestCollectedDecision(client: SupabaseDataClient, workspaceId: string): Promise<LiveCollectedDecision | undefined> {
  const commits = await client.request<CommitRow[]>(`beta_decision_commits?select=id,opportunity_id,reasoning_snapshot_id,decision_snapshot_id,ledger_entry_id,task_id,selected_action,committed_at&workspace_id=eq.${workspaceId}&domain_id=like.collected-decision-*&order=committed_at.desc&limit=1`);
  const commit = commits.data?.[0];
  if (commits.error || !commit) return undefined;
  const [opportunities, ledgers, tasks] = await Promise.all([
    client.request<OpportunityRow[]>(`opportunities?select=domain_id,title,payload&workspace_id=eq.${workspaceId}&id=eq.${commit.opportunity_id}&limit=1`),
    client.request<LedgerRow[]>(`career_ledger_entries?select=id,occurred_at,payload&workspace_id=eq.${workspaceId}&id=eq.${commit.ledger_entry_id}&limit=1`),
    client.request<TaskRow[]>(`executive_tasks?select=id,title,priority,status,payload&workspace_id=eq.${workspaceId}&id=eq.${commit.task_id}&limit=1`),
  ]);
  const opportunity = opportunities.data?.[0], ledger = ledgers.data?.[0], task = tasks.data?.[0];
  if (!opportunity || !ledger || !task) return undefined;
  const decision = typeof opportunity.payload.executiveDecision === "object" && opportunity.payload.executiveDecision ? opportunity.payload.executiveDecision as Record<string, unknown> : undefined;
  if (decision?.hiddenFromApplicationsAt) return undefined;
  return { commitId: commit.id, opportunityId: opportunity.domain_id, title: opportunity.title, companyName: String(opportunity.payload.companyName ?? "Company not recorded"), action: executiveAction(commit.selected_action), committedAt: commit.committed_at, reasoningSnapshotId: commit.reasoning_snapshot_id, decisionSnapshotId: commit.decision_snapshot_id, ledgerEntryId: ledger.id, task: { id: task.id, title: task.title, priority: task.priority, status: task.status } };
}
