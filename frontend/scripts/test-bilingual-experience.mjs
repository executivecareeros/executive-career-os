import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  jobs: await readFile(new URL("../components/opportunities/live-opportunity-universe.tsx", import.meta.url), "utf8"),
  linkedIn: await readFile(new URL("../components/opportunities/linkedin-import-panel.tsx", import.meta.url), "utf8"),
  empty: await readFile(new URL("../components/opportunities/opportunity-universe-empty.tsx", import.meta.url), "utf8"),
  detail: await readFile(new URL("../components/opportunities/collected-opportunity-intelligence.tsx", import.meta.url), "utf8"),
  route: await readFile(new URL("../app/opportunities/[id]/page.tsx", import.meta.url), "utf8"),
  sidebar: await readFile(new URL("../components/sidebar.tsx", import.meta.url), "utf8"),
};

for (const [name, source] of Object.entries(files)) {
  assert.match(source, /locale/, `${name} must consume or pass the saved locale`);
}

for (const phrase of ["Yönetici rollerinde ara", "Filtreleri temizle", "İşi gör", "Şirket kariyer sayfasından iş ekle"]) assert.match(files.jobs, new RegExp(phrase));
for (const phrase of ["LinkedIn'den içe aktar", "Her içe aktarma senin kontrolünde", "Uyarıyı içe aktar"]) assert.ok(files.linkedIn.includes(phrase), `Missing Turkish LinkedIn copy: ${phrase}`);
for (const phrase of ["İşlere dön", "Bu rol neden dikkatimi çekti", "Ne yapmak istersin?", "Karar kaydedildi"]) assert.ok(files.detail.includes(phrase), `Missing Turkish opportunity copy: ${phrase}`);
for (const phrase of ["Uygulama kenar çubuğu", "Ana gezinme", "Özel kariyer ofisin"]) assert.ok(files.sidebar.includes(phrase), `Missing Turkish navigation copy: ${phrase}`);
assert.match(files.route, /getLocale\(\)/, "Opportunity detail must resolve the active locale on the server");
assert.match(files.route, /locale=\{locale\}/, "Opportunity detail must pass the active locale to the live view");

console.log("Bilingual live-experience checks passed.");
