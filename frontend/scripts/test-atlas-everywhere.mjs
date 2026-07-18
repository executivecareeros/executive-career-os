import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { atlasHandoffHref, resolveAtlasHandoffContext, resolveAtlasPageContext } from "../lib/atlas/page-context.ts";

assert.equal(resolveAtlasPageContext("/opportunities").id, "jobs");
assert.equal(resolveAtlasPageContext("/opportunities/abc").id, "opportunity");
assert.equal(resolveAtlasPageContext("/companies/example").id, "company");
assert.equal(resolveAtlasPageContext("/applications/example").id, "applications");
assert.equal(resolveAtlasPageContext("/import").id, "profile");
assert.equal(resolveAtlasPageContext("/rooms/example").id, "rooms");
assert.equal(resolveAtlasPageContext("/unmapped").id, "home");
assert.equal(atlasHandoffHref("/companies/example"), "/assistant?from=company");
assert.equal(resolveAtlasHandoffContext("company")?.returnHref, "/companies");
assert.equal(resolveAtlasHandoffContext("invalid"), undefined);

for (const path of ["/", "/opportunities", "/opportunities/abc", "/companies", "/applications", "/workspace", "/rooms"]) {
  const context = resolveAtlasPageContext(path);
  assert.equal(context.prompts.length, 3);
  assert.ok(context.summary.includes("Atlas"));
  assert.ok(context.title.length > 12);
}

const pageContentSource = readFileSync(new URL("../components/page-content.tsx", import.meta.url), "utf8");
const atlasEverywhereSource = readFileSync(new URL("../components/atlas/atlas-everywhere.tsx", import.meta.url), "utf8");
assert.match(pageContentSource, /data-atlas-safe-content/);
assert.match(pageContentSource, /pb-28 sm:pb-32/);
assert.match(atlasEverywhereSource, /data-atlas-dock/);

console.log("Atlas Everywhere context and safe handoff contracts passed.");
