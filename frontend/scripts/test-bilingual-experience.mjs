import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  jobs: await readFile(new URL("../components/opportunities/live-opportunity-universe.tsx", import.meta.url), "utf8"),
  empty: await readFile(new URL("../components/opportunities/opportunity-universe-empty.tsx", import.meta.url), "utf8"),
  detail: await readFile(new URL("../components/opportunities/collected-opportunity-intelligence.tsx", import.meta.url), "utf8"),
  route: await readFile(new URL("../app/opportunities/[id]/page.tsx", import.meta.url), "utf8"),
  sidebar: await readFile(new URL("../components/sidebar.tsx", import.meta.url), "utf8"),
  breadcrumbs: await readFile(new URL("../components/breadcrumbs.tsx", import.meta.url), "utf8"),
  shell: await readFile(new URL("../components/app-shell.tsx", import.meta.url), "utf8"),
  home: await readFile(new URL("../components/home/simple-executive-home.tsx", import.meta.url), "utf8"),
  cv: await readFile(new URL("../components/import/import-workspace.tsx", import.meta.url), "utf8"),
  locale: await readFile(new URL("../lib/locale.ts", import.meta.url), "utf8"),
  register: await readFile(new URL("../app/register/page.tsx", import.meta.url), "utf8"),
  proxy: await readFile(new URL("../proxy.ts", import.meta.url), "utf8"),
};

assert.match(files.shell, /PageContent locale=\{locale\}/, "Application shell must pass the active locale to page chrome");
assert.match(files.route, /getLocale\(\)/, "Opportunity detail must resolve the active locale on the server");
assert.match(files.route, /locale=\{locale\}/, "Opportunity detail must pass the active locale to the live view");
assert.match(files.jobs, /Search executive jobs/, "Jobs must expose English production copy");
assert.match(files.home, /Search jobs/, "Home must expose English production copy");
assert.match(files.cv, /Save my experience and see jobs/, "CV review must expose English production copy");
assert.match(files.locale, /getLocale\(\): Promise<Locale> \{ return "en"; \}/, "English must be the only enabled production locale");
assert.match(files.register, /locale="en"/, "Registration must render in English");
assert.doesNotMatch(files.register, /private beta|Yalnızca|Davet|Kurucu/, "Registration must not expose beta or Turkish production copy");
assert.match(files.proxy, /response\.cookies\.delete\("orendalis-language"\)/, "Language overrides must be cleared in production");

console.log("English-only production and future localization architecture checks passed.");
