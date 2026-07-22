import "server-only";
import type { SupabaseDataClient } from "@/lib/supabase/client";
import { emptyExecutiveBehaviorProfile, type ExecutiveBehaviorProfile } from "@/lib/opportunity-geography";

type DecisionOpportunityRow = { country?: string; industry?: string; status?: string; payload: Record<string, unknown> };
type ApplicationRow = { stage?: string; payload: Record<string, unknown> };
const normalize = (value: unknown) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
const family = (title: unknown) => {
  const value = normalize(title);
  const families: string[] = [];
  if (/sales|account executive/.test(value)) families.push("sales");
  if (/revenue|chief revenue officer/.test(value)) families.push("revenue");
  if (/business development|partnership|alliance/.test(value)) families.push("businessDevelopment");
  if (/commercial|go to market|gtm/.test(value)) families.push("commercialLeadership");
  if (/general manager|managing director|country manager/.test(value)) families.push("generalManagement");
  if (/product/.test(value)) families.push("product");
  if (/marketing|brand|communications/.test(value)) families.push("marketing");
  if (/operations|operational/.test(value)) families.push("operations");
  if (/engineer|developer|technical|data scientist/.test(value)) families.push("technical");
  return families;
};
const add = (record: Record<string, number>, key: unknown, weight: number) => { const normalized = normalize(key); if (normalized) record[normalized] = (record[normalized] ?? 0) + weight; };
const decisionWeight = (payload: Record<string, unknown>, status?: string) => {
  const decision = payload.executiveDecision && typeof payload.executiveDecision === "object" ? payload.executiveDecision as Record<string, unknown> : {};
  const action = String(decision.action ?? status ?? "");
  return action === "Pursue" || action === "Ready to Apply" ? 2 : action === "Watch" || action === "Evaluating" ? 1 : action === "Skip" || action === "Archived" ? -2 : 0;
};

export async function loadExecutiveBehaviorProfile(client: SupabaseDataClient, workspaceId: string): Promise<ExecutiveBehaviorProfile> {
  const [decisions, applications] = await Promise.all([
    client.request<DecisionOpportunityRow[]>(`opportunities?select=country,industry,status,payload&workspace_id=eq.${workspaceId}&payload->executiveDecision->>status=eq.Finalized&limit=250`),
    client.request<ApplicationRow[]>(`applications?select=stage,payload&workspace_id=eq.${workspaceId}&archived_at=is.null&limit=250`),
  ]);
  if (decisions.error || applications.error) return emptyExecutiveBehaviorProfile();
  const profile = emptyExecutiveBehaviorProfile();
  for (const row of decisions.data ?? []) {
    const weight = decisionWeight(row.payload, row.status); if (!weight) continue;
    profile.evidenceCount += 1;
    for (const value of family(row.payload.jobTitle)) add(profile.titleFamilies, value, weight);
    add(profile.industries, row.payload.industry ?? row.industry, weight); add(profile.countries, row.payload.country ?? row.country, weight);
    add(profile.workArrangements, row.payload.workArrangement, weight); add(profile.employmentTypes, row.payload.employmentType, weight);
  }
  for (const row of applications.data ?? []) {
    const stage = normalize(row.stage); const weight = /offer|interview|shortlist/.test(stage) ? 2 : /submitted|applied/.test(stage) ? 1 : 0;
    if (!weight) continue;
    profile.evidenceCount += 1;
    for (const value of family(row.payload.jobTitle ?? row.payload.title)) add(profile.titleFamilies, value, weight);
    add(profile.industries, row.payload.industry, weight); add(profile.countries, row.payload.country, weight);
    add(profile.workArrangements, row.payload.workArrangement, weight); add(profile.employmentTypes, row.payload.employmentType, weight);
  }
  return profile;
}
