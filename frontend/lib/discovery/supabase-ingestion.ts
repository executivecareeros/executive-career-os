import "server-only";
import { randomUUID } from "node:crypto";
import type { RepositoryContext } from "@/lib/repositories/types";
import type { SupabaseDataClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/types/opportunity";
import type { OpportunityIngestionOutcome, OpportunityIngestionSink } from "./types";

type Row = { id: string; domain_id: string; payload: Record<string, unknown> };

export class SupabaseOpportunityIngestionSink implements OpportunityIngestionSink {
  constructor(private readonly client: SupabaseDataClient, private readonly context: RepositoryContext) {}
  private get workspace() { return this.context.workspace!; }

  async list() {
    const response = await this.client.request<Row[]>(`opportunities?select=id,domain_id,payload&workspace_id=eq.${this.workspace.workspaceId}&archived_at=is.null`);
    if (response.error) throw new Error(response.error.message);
    return (response.data ?? []).map((row) => ({ ...row.payload, id: row.domain_id }) as Opportunity);
  }

  async upsert(opportunity: Opportunity) {
    const existing = await this.client.request<Row[]>(`opportunities?select=id,domain_id,payload&workspace_id=eq.${this.workspace.workspaceId}&domain_id=eq.${encodeURIComponent(opportunity.id)}&limit=1`);
    if (existing.error) throw new Error(existing.error.message);
    const { id: domainId, ...payload } = opportunity;
    if (existing.data?.[0]) {
      const updated = await this.client.request<Row[]>(`opportunities?id=eq.${existing.data[0].id}&workspace_id=eq.${this.workspace.workspaceId}`, { method: "PATCH", body: JSON.stringify({ title: opportunity.jobTitle, country: opportunity.country, industry: opportunity.industry, status: opportunity.status, source_url: opportunity.sourceUrl ?? null, payload, updated_at: new Date().toISOString() }) });
      if (updated.error) throw new Error(updated.error.message);
      return;
    }
    const created = await this.client.request<Row[]>("opportunities", { method: "POST", body: JSON.stringify({ id: randomUUID(), domain_id: domainId, workspace_id: this.workspace.workspaceId, title: opportunity.jobTitle, country: opportunity.country, industry: opportunity.industry, status: opportunity.status, source_url: opportunity.sourceUrl ?? null, payload, created_by: this.workspace.executiveId }) });
    if (created.error) throw new Error(created.error.message);
    // The canonical payload contains source attribution atomically with the opportunity.
    // Append-only provenance expansion is intentionally deferred until a transaction RPC exists.
  }
}

export async function recordDiscoveryRun(client: SupabaseDataClient, context: RepositoryContext, outcome: OpportunityIngestionOutcome) {
  const response = await client.request("discovery_runs", { method: "POST", body: JSON.stringify({ id: randomUUID(), domain_id: `discovery-run-${outcome.run.id}`, workspace_id: context.workspace!.workspaceId, sequence_number: Date.now(), occurred_at: outcome.run.startedAt, correlation_id: context.correlationId, payload: outcome.run, created_by: context.workspace!.executiveId }) });
  if (response.error) throw new Error(response.error.message);
}
