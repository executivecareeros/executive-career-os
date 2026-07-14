"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { providerFromCareersUrl } from "@/lib/discovery/providers/factory";
import { OpportunityCoverageEngine } from "@/lib/discovery/coverage-engine";
import { recordDiscoveryRun, SupabaseOpportunityIngestionSink } from "@/lib/discovery/supabase-ingestion";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { OpportunityProvider } from "@/lib/discovery/types";

export async function refreshOpportunityBoard(formData: FormData) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/opportunities");
  let provider: OpportunityProvider;
  try { provider = providerFromCareersUrl(String(formData.get("board") ?? "")); }
  catch (error) { redirect(`/opportunities?collection=error&message=${encodeURIComponent(error instanceof Error ? error.message : "The careers board could not be read.")}`); }
  const client = createServerSupabaseClient(resolved.accessToken);
  const requestedAt = new Date().toISOString();
  const engine = new OpportunityCoverageEngine(new SupabaseOpportunityIngestionSink(client, resolved.context)).register(provider, { priority: 1, enabled: true, maximumResults: 100 });
  await engine.enqueue(provider.id, { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] }, requestedAt);
  const outcome = await engine.runNext(requestedAt);
  if (!outcome) redirect("/opportunities?collection=error&message=No%20collection%20run%20was%20available.");
  try { await recordDiscoveryRun(client, resolved.context, outcome); } catch { /* Collection remains visible if the secondary monitoring record fails. */ }
  revalidatePath("/opportunities");
  if (outcome.run.status === "failed") redirect(`/opportunities?collection=error&message=${encodeURIComponent(outcome.run.errors[0]?.message ?? "Greenhouse collection failed.")}`);
  redirect(`/opportunities?collection=complete&imported=${outcome.run.jobsImported}&found=${outcome.run.jobsFound}`);
}
