"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveGuidanceAnswersAction(formData: FormData) {
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/assistant");
  const workspace = resolved.context.workspace;
  if (!workspace) throw new Error("A private workspace is required.");

  const irrelevantQuestion = String(formData.get("irrelevantQuestion") ?? "");
  const selected = (irrelevantQuestion ? [irrelevantQuestion] : formData.getAll("selectedQuestion").map(String))
    .filter(id => /^[a-zA-Z0-9:_-]{3,200}$/.test(id)).slice(0, 20);
  if (!selected.length) redirect("/assistant?guidance=select");

  const now = new Date();
  const nextReview = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const rows = selected.map(questionId => {
    const question = String(formData.get(`question:${questionId}`) ?? "").trim().slice(0, 1000);
    const answer = irrelevantQuestion === questionId
      ? "__ATLAS_IRRELEVANT__"
      : String(formData.get(`answer:${questionId}`) ?? "").trim().slice(0, 2000);
    if (question.length < 3 || !answer) throw new Error("Each selected guidance question requires an answer.");
    return {
      workspace_id: workspace.workspaceId,
      executive_identity_id: workspace.executiveId,
      question_id: questionId,
      question,
      answer,
      answered_at: now.toISOString(),
      next_review_at: nextReview.toISOString(),
      updated_at: now.toISOString(),
    };
  });

  const client = createServerSupabaseClient(resolved.accessToken);
  for (const row of rows) {
    const result = await client.request("atlas_guidance_responses?on_conflict=workspace_id,executive_identity_id,question_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(row),
    });
    if (result.error) throw new Error(result.error.message);
  }

  revalidatePath("/assistant");
  redirect(`/assistant?guidance=${irrelevantQuestion ? "irrelevant" : "saved"}&count=${rows.length}`);
}
