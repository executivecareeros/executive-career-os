import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source=await readFile(new URL("../lib/auth/founder-access.ts",import.meta.url),"utf8");
assert.match(source,/workspace\.role!=="Owner"/,"Company Control must remain Owner-only");
assert.match(source,/"cuneyt\.sen@orendalis\.com"/,"The authorized Founder email must remain explicit when deployment configuration is unavailable");
assert.match(source,/resolveAuthenticatedRepositoryContext\(\{requiredRole:"Owner"\}\)/,"Founder access must select the Owner membership instead of an arbitrary active membership");
assert.match(source,/authorizedEmails\.has\(session\.user\.email\.toLowerCase\(\)\)/,"The exact authorized Founder email must remain an access restriction");
assert.doesNotMatch(source,/!founderEmail\|\|/,"A missing deployment hint must not override the immutable database authority");
console.log("Founder access boundary checks passed.");
