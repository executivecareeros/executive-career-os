import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [component, action, migration, page] = await Promise.all([
  readFile(new URL("../components/atlas/guidance-question-review.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/assistant/actions.ts", import.meta.url), "utf8"),
  readFile(new URL("../../supabase/migrations/202607180015_atlas_guidance_responses.sql", import.meta.url), "utf8"),
  readFile(new URL("../app/assistant/page.tsx", import.meta.url), "utf8"),
]);

assert.match(component, /type="checkbox"/i, "guidance questions must be independently selectable");
assert.match(component, /Select all/, "the executive must be able to select every question at once");
assert.match(component, /name="selectedQuestion"/, "selected questions must be submitted as a batch");
assert.match(component, /textarea/, "selected questions must accept an answer");
assert.match(action, /resolveAuthenticatedRepositoryContext/, "saving must require an authenticated executive");
assert.match(action, /workspace_id: workspace\.workspaceId/, "answers must remain workspace scoped");
assert.match(action, /30 \* 24 \* 60 \* 60 \* 1000/, "guidance must be scheduled for a 30-day review");
assert.match(migration, /unique\(workspace_id,executive_identity_id,question_id\)/, "repeated answers must update instead of duplicate");
assert.match(migration, /enable row level security/, "guidance answers must use RLS");
assert.match(migration, /is_active_workspace_member\(workspace_id\)/, "RLS must enforce workspace access");
assert.match(page, /GuidanceQuestionReview/, "the live Atlas page must render the interactive review");

console.log("Atlas guidance review checks passed.");
