"use server";

import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";

type Draft = { organizationName: string; roleTitle: string; startDate?: string; endDate?: string; isCurrent: boolean; companyDescription?: string; roleDescription?: string; responsibilities?: string[]; achievements?: string[]; industries?: string[]; location?: string; employmentType?: string; leadershipScope?: string; teamSize?: string; geographicResponsibility?: string; revenueScope?: string; technologies?: string[] };
const month = /^\d{4}-(0[1-9]|1[0-2])$/;
function databaseDate(value: string | undefined) { return value && month.test(value) ? `${value}-01` : undefined; }

export async function confirmCvHistory(formData: FormData) {
  if (formData.get("consent") !== "yes") throw new Error("Consent is required before confirmed history can be saved.");
  const filename = String(formData.get("filename") ?? "").slice(0, 120);
  let drafts: Draft[];
  try { drafts = JSON.parse(String(formData.get("drafts") ?? "[]")) as Draft[]; } catch { throw new Error("The review draft is invalid."); }
  if (!Array.isArray(drafts) || !drafts.length || drafts.length > 20) throw new Error("Confirm between one and twenty roles.");
  drafts = drafts.map(draft => ({ ...draft, organizationName: String(draft.organizationName ?? "").trim().slice(0, 200), roleTitle: String(draft.roleTitle ?? "").trim().slice(0, 200), startDate: databaseDate(String(draft.startDate ?? "")), endDate: databaseDate(String(draft.endDate ?? "")), isCurrent: Boolean(draft.isCurrent), companyDescription: String(draft.companyDescription ?? "").trim().slice(0, 3000), roleDescription: String(draft.roleDescription ?? "").trim().slice(0, 5000), responsibilities: Array.isArray(draft.responsibilities) ? draft.responsibilities.map(String).slice(0, 30) : [], achievements: Array.isArray(draft.achievements) ? draft.achievements.map(String).slice(0, 30) : [] }));
  if (drafts.some(draft => !draft.organizationName || !draft.roleTitle || (draft.startDate && draft.endDate && draft.endDate < draft.startDate))) throw new Error("Review the employer, role, and dates before saving.");
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect(`/login?next=${encodeURIComponent("/import")}`);
  const client = createServerSupabaseClient(resolved.accessToken);
  const documentContext = String(formData.get("documentContext") ?? "").slice(0, 20_000);
  const workspaceId = resolved.context.workspace!.workspaceId;
  const existing = await client.request<Array<{ organization_name: string; role_title: string; start_date?: string }>>(`professional_experiences?select=organization_name,role_title,start_date&workspace_id=eq.${workspaceId}&archived_at=is.null`);
  if (existing.error) throw new Error("Your existing history could not be checked safely.");
  const keys = new Set((existing.data ?? []).map(item => `${item.organization_name}|${item.role_title}|${item.start_date?.slice(0, 7) ?? ""}`.toLowerCase()));
  const repository = new SupabaseBetaWorkflowRepository(client, resolved.context);
  let saved = 0;
  for (const draft of drafts) {
    const key = `${draft.organizationName}|${draft.roleTitle}|${draft.startDate?.slice(0, 7) ?? ""}`.toLowerCase();
    if (keys.has(key)) continue;
    await repository.saveHistory({ organizationName: draft.organizationName, roleTitle: draft.roleTitle, startDate: draft.startDate, endDate: draft.isCurrent ? undefined : draft.endDate, isCurrent: draft.isCurrent, notes: JSON.stringify({ companyDescription: draft.companyDescription, roleDescription: draft.roleDescription, responsibilities: draft.responsibilities, achievements: draft.achievements, documentContext, sourceEvidence: "Confirmed from CV review" }), sourceType: "Document Import", sourceFilename: filename });
    keys.add(key); saved++;
  }
  redirect(`/opportunities?cv=complete&roles=${saved}`);
}
