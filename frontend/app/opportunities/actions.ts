"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { OpportunityIngestionPipeline } from "@/lib/discovery/pipeline";
import { GreenhouseOpportunityProvider, parseGreenhouseBoardToken } from "@/lib/discovery/providers/greenhouse";
import { OpportunityProviderRegistry } from "@/lib/discovery/registry";
import { recordDiscoveryRun, SupabaseOpportunityIngestionSink } from "@/lib/discovery/supabase-ingestion";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function refreshGreenhouseBoard(formData: FormData) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/opportunities");
  let boardToken = "";
  try { boardToken = parseGreenhouseBoardToken(String(formData.get("board") ?? "")); }
  catch (error) { redirect(`/opportunities?collection=error&message=${encodeURIComponent(error instanceof Error ? error.message : "The careers board could not be read.")}`); }
  const runId = randomUUID();
  const client = createServerSupabaseClient(resolved.accessToken);
  const provider = new GreenhouseOpportunityProvider(boardToken);
  const pipeline = new OpportunityIngestionPipeline(new OpportunityProviderRegistry().register(provider), new SupabaseOpportunityIngestionSink(client, resolved.context));
  const requestedAt = new Date().toISOString();
  const outcome = await pipeline.ingest("greenhouse", { runId, requestedAt, maximumResults: 100, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } });
  try { await recordDiscoveryRun(client, resolved.context, outcome); } catch { /* Collection remains visible if the secondary monitoring record fails. */ }
  revalidatePath("/opportunities");
  if (outcome.run.status === "failed") redirect(`/opportunities?collection=error&message=${encodeURIComponent(outcome.run.errors[0]?.message ?? "Greenhouse collection failed.")}`);
  redirect(`/opportunities?collection=complete&imported=${outcome.run.jobsImported}&found=${outcome.run.jobsFound}`);
}
