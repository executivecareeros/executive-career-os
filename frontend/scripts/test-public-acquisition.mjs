import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const landing = await readFile(new URL("../components/experience-zero/arrival.tsx", import.meta.url), "utf8");
const locale = await readFile(new URL("../lib/locale.ts", import.meta.url), "utf8");
const robots = await readFile(new URL("../app/robots.ts", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
const proxy = await readFile(new URL("../proxy.ts", import.meta.url), "utf8");
const machineSummary = await readFile(new URL("../app/llms.txt/route.ts", import.meta.url), "utf8");
const shell = await readFile(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
const register = await readFile(new URL("../app/register/page.tsx", import.meta.url), "utf8");
const authActions = await readFile(new URL("../app/auth-actions.ts", import.meta.url), "utf8");
const onboardingRepository = await readFile(new URL("../lib/repositories/supabase/onboarding-repository.ts", import.meta.url), "utf8");
const publicOnboardingMigration = await readFile(new URL("../../supabase/migrations/202607210002_public_executive_onboarding.sql", import.meta.url), "utf8");

assert.match(layout, /metadataBase: new URL\("https:\/\/www\.orendalis\.com"\)/);
assert.match(layout, /Find your next executive opportunity/);
assert.match(layout, /canonical: "\/"/);
assert.doesNotMatch(layout, /\?lang=tr/);
assert.match(layout, /card: "summary_large_image"/);
assert.match(layout, /orendalis-social-preview\.png/);
assert.match(layout, /icon: "\/icon\.svg"/);
assert.match(layout, /"@type": "Organization"/);
assert.match(layout, /"@type": "WebSite"/);
assert.match(layout, /"@type": "SoftwareApplication"/);
await access(new URL("../public/brand/orendalis-social-preview.png", import.meta.url));
await access(new URL("../app/icon.svg", import.meta.url));
await access(new URL("../public/media/orendalis-episode-1.mp4", import.meta.url));
await access(new URL("../public/media/orendalis-episode-1-poster.png", import.meta.url));
await access(new URL("../public/media/orendalis-episode-1-captions.vtt", import.meta.url));
assert.match(landing, /The executive hiring process is broken/);
assert.match(landing, /orendalis-episode-1\.mp4/);
assert.match(landing, /orendalis-episode-1-captions\.vtt/);
assert.match(landing, /Create my private workspace/);

for (const phrase of ["Find your next executive opportunity.", "Upload your CV", "Search jobs", "Sign in"]) {
  assert.ok(`${landing}\n${locale}`.includes(phrase), `Missing English public acquisition copy: ${phrase}`);
}
assert.match(locale, /getLocale\(\): Promise<Locale> \{ return "en"; \}/);

assert.match(robots, /sitemap: "https:\/\/www\.orendalis\.com\/sitemap\.xml"/);
for (const privateRoute of ["/applications", "/company-control", "/import", "/opportunities", "/workspace"]) {
  assert.ok(robots.includes(`"${privateRoute}"`), `Private route must be excluded from indexing: ${privateRoute}`);
}
assert.match(sitemap, /https:\/\/www\.orendalis\.com/);
for (const publicRoute of ["/about", "/executive-jobs", "/executive-career-intelligence"]) {
  assert.ok(sitemap.includes(`"${publicRoute}"`), `Public SEO route missing from sitemap: ${publicRoute}`);
  assert.ok(proxy.includes(`"${publicRoute}"`), `Public SEO route must bypass authentication: ${publicRoute}`);
  assert.ok(shell.includes(`"${publicRoute}"`), `Public SEO route must bypass the authenticated shell: ${publicRoute}`);
}
assert.doesNotMatch(sitemap, /\?lang=/);
assert.ok(proxy.includes('"/robots.txt"'), "robots.txt must be reachable without authentication");
assert.ok(proxy.includes('"/sitemap.xml"'), "sitemap.xml must be reachable without authentication");
assert.ok(proxy.includes('"/icon.svg"'), "brand icon must be reachable without authentication");
assert.ok(proxy.includes('"/llms.txt"'), "truthful machine-readable product context must be public");
assert.ok(proxy.includes('"/brand/"'), "social and brand assets must be reachable without authentication");
assert.ok(proxy.includes('"/media/"'), "public welcome media must be reachable without authentication");
assert.match(machineSummary, /Unknown information remains unknown/);
assert.match(machineSummary, /Private CV, profile, application, and decision data is never public content/);
assert.match(register, /Start your executive search/);
assert.doesNotMatch(register, /Invitation required|Registration cannot continue without/);
assert.match(authActions, /if \(inviteToken\)/, "Invitation validation must remain optional and supported");
assert.match(onboardingRepository, /rpc\/provision_personal_workspace/, "Public executives must receive isolated personal workspaces");
assert.match(publicOnboardingMigration, /grant execute on function public\.provision_personal_workspace\(jsonb\) to authenticated/);
assert.match(publicOnboardingMigration, /revoke all on function public\.provision_personal_workspace\(jsonb\) from public, anon/);

console.log("Public acquisition checks passed.");
