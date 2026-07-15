import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const landing = await readFile(new URL("../components/experience-zero/arrival.tsx", import.meta.url), "utf8");
const locale = await readFile(new URL("../lib/locale.ts", import.meta.url), "utf8");
const robots = await readFile(new URL("../app/robots.ts", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");

assert.match(layout, /metadataBase: new URL\("https:\/\/www\.orendalis\.com"\)/);
assert.match(layout, /Find your next executive opportunity/);
assert.match(layout, /canonical: "\/"/);
assert.match(layout, /"tr": "\/\?lang=tr"/);
assert.match(layout, /card: "summary"/);

for (const phrase of ["Find your next executive opportunity.", "Upload your CV", "Search jobs", "Sign in"]) {
  assert.ok(`${landing}\n${locale}`.includes(phrase), `Missing English public acquisition copy: ${phrase}`);
}
for (const phrase of ["Bir sonraki yönetici fırsatını bul.", "CV’ni yükle", "İş ara", "Giriş yap"]) {
  assert.ok(`${landing}\n${locale}`.includes(phrase), `Missing Turkish public acquisition copy: ${phrase}`);
}

assert.match(robots, /sitemap: "https:\/\/www\.orendalis\.com\/sitemap\.xml"/);
for (const privateRoute of ["/applications", "/company-control", "/import", "/opportunities", "/workspace"]) {
  assert.ok(robots.includes(`"${privateRoute}"`), `Private route must be excluded from indexing: ${privateRoute}`);
}
assert.match(sitemap, /https:\/\/www\.orendalis\.com\/\?lang=en/);
assert.match(sitemap, /https:\/\/www\.orendalis\.com\/\?lang=tr/);

console.log("Public acquisition checks passed.");
