import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const [page, actions, decision, cookies, session, arrival, atlas] = await Promise.all([
  read("../app/applications/page.tsx"),
  read("../app/applications/actions.ts"),
  read("../lib/live-collected-decision.ts"),
  read("../lib/auth/cookies.ts"),
  read("../lib/auth/session.ts"),
  read("../components/experience-zero/arrival.tsx"),
  read("../components/atlas/atlas-everywhere.tsx"),
]);

assert.match(page, /hidePursueDecisionAction/);
assert.match(page, />\s*Delete record\s*</);
assert.match(actions, /hiddenFromApplicationsAt/);
assert.match(actions, /revalidatePath\("\/applications"\)/);
assert.match(decision, /hiddenFromApplicationsAt/);

assert.match(cookies, /REMEMBER_COOKIE/);
assert.match(cookies, /remember \? \{ maxAge: session\.expires_in \} : \{\}/);
assert.match(session, /jar\.get\(REMEMBER_COOKIE\)\?\.value === "1"/);

assert.match(arrival, /min-h-11/);
assert.match(arrival, /hidden min-h-11[^\n]+sm:inline-flex/);
assert.match(atlas, /size-14/);
assert.match(atlas, /sr-only sm:not-sr-only/);

console.log("Application removal, session persistence, and mobile sign-in contracts pass.");
