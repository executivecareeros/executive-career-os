import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = await Promise.all([
  "lib/auth/active-membership.ts",
  "lib/auth/repository-context.ts",
  "lib/auth/executive-display-name.ts",
  "app/onboarding/page.tsx",
  "app/auth-actions.ts",
  "app/api/auth/linkedin-session/route.ts",
].map(async path => [path, await readFile(path, "utf8")]));
const source = Object.fromEntries(files);

assert.match(source["lib/auth/active-membership.ts"], /auth_user_id=eq\.\$\{encodeURIComponent\(authUserId\)\}/);
assert.match(source["lib/auth/active-membership.ts"], /executive_identity_id=eq\.\$\{encodeURIComponent\(executiveIdentityId\)\}/);
assert.doesNotMatch(source["lib/auth/repository-context.ts"], /workspace_memberships\?select/);
assert.match(source["lib/auth/repository-context.ts"], /resolveActiveMembership\(session\.accessToken, session\.user\.id/);
assert.match(source["lib/auth/executive-display-name.ts"], /professional_experiences\?select=notes&executive_identity_id=eq\./);
assert.match(source["app/onboarding/page.tsx"], /resolveActiveMembership\(session\.accessToken, session\.user\.id\)/);
assert.match(source["app/auth-actions.ts"], /resolveActiveMembership\(session\.access_token, session\.user\.id\)/);
assert.match(source["app/api/auth/linkedin-session/route.ts"], /resolveActiveMembership\(body\.accessToken, user\.id\)/);

console.log("Authenticated account isolation checks passed.");
