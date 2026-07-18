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
assert.match(machineSummary, /Unknown information remains unknown/);
assert.match(machineSummary, /Private CV, profile, application, and decision data is never public content/);

console.log("Public acquisition checks passed.");
