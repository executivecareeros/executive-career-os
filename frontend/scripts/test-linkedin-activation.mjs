import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const callback = read("app/api/auth/linkedin-session/route.ts");
const callbackPage = read("app/auth/linkedin/callback/page.tsx");
const identityLink = read("app/auth/linkedin/link/route.ts");
const settings = read("app/settings/page.tsx");
const importer = read("components/import/import-workspace.tsx");
const referral = read("components/referrals/executive-referral-share.tsx");
const login = read("app/login/page.tsx");

assert.match(callback, /workspace_memberships\?select=id/);
assert.match(callback, /existing ORENDALIS executives/);
assert.match(callback, /email_confirmed_at/);
assert.match(callbackPage, /useRef\(false\)/);
assert.match(callbackPage, /if \(started\.current\) return/);
assert.match(callbackPage, /new URLSearchParams\(location\.search\)/);
assert.doesNotMatch(callbackPage, /useSearchParams/);
assert.match(identityLink, /currentSession\(\)/);
assert.match(identityLink, /user\/identities\/authorize/);
assert.match(identityLink, /authorization: `Bearer \$\{session\.accessToken\}`/);
assert.match(identityLink, /provider", "linkedin_oidc"/);
assert.match(identityLink, /skip_http_redirect", "true"/);
assert.match(settings, /Connect LinkedIn securely/);
assert.match(settings, /different email addresses/);
assert.match(login, /LINKEDIN_SIGN_IN_ENABLED/);
assert.match(importer, /Import LinkedIn information/);
assert.match(importer, /\.pdf,\.csv/);
assert.match(importer, /does not scrape LinkedIn/);
assert.match(referral, /linkedin\.com\/sharing\/share-offsite/);
assert.match(referral, /never access your LinkedIn connections/);
assert.doesNotMatch(referral, /connections\?/);

console.log("LinkedIn activation boundaries: pass");
