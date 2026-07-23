import assert from "node:assert/strict";
import fs from "node:fs";

const actions = fs.readFileSync(new URL("../app/auth-actions.ts", import.meta.url), "utf8");
const linkedinCallback = fs.readFileSync(new URL("../app/auth/linkedin/callback/page.tsx", import.meta.url), "utf8");

assert.match(actions, /redirect\(hasWorkspace \? requested \?\? "\/" : "\/welcome"\)/);
assert.doesNotMatch(actions, /safePath\(value\(form, "next"\)\) \?\?/);
assert.match(linkedinCallback, /body\.hasWorkspace/);
assert.ok(linkedinCallback.includes('"/welcome"'));

console.log("Authentication routing checks passed.");
