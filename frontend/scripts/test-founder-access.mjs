import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source=await readFile(new URL("../lib/auth/founder-access.ts",import.meta.url),"utf8");
assert.match(source,/workspace\.role!=="Owner"/,"Company Control must remain Owner-only");
assert.match(source,/founderBootstrapStatus\(session\.accessToken\)/,"Company Control must require the immutable founder-bootstrap authority");
assert.match(source,/bootstrap\?\.status!=="COMPLETE"/,"An incomplete or unavailable bootstrap audit must deny access");
assert.match(source,/resolveAuthenticatedRepositoryContext\(\{requiredRole:"Owner"\}\)/,"Founder access must select the Owner membership instead of an arbitrary active membership");
assert.match(source,/if\(founderEmail&&session\.user\.email\?\.toLowerCase\(\)!==founderEmail\)/,"A configured founder email must remain an additional access restriction");
assert.doesNotMatch(source,/!founderEmail\|\|/,"A missing deployment hint must not override the immutable database authority");
console.log("Founder access boundary checks passed.");
