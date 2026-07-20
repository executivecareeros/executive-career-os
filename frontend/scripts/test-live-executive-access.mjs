import { readFileSync } from "node:fs";

const sidebar = readFileSync(new URL("../components/sidebar.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const founderPage = readFileSync(new URL("../app/company-control/page.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../components/home/simple-executive-home.tsx", import.meta.url), "utf8");
const repository = readFileSync(new URL("../lib/beta/repository.ts", import.meta.url), "utf8");

if (!sidebar.includes('item.href !== "/company-control" || founderAccess')) throw new Error("Founder navigation is not hidden for ordinary executives.");
if ((shell.match(/founderAccess=\{founderAccess\}/g) ?? []).length !== 2) throw new Error("Founder access is not enforced in both desktop and mobile navigation.");
if (!layout.includes("resolveFounderAccess().then(Boolean).catch(() => false)")) throw new Error("The shell does not derive Founder access on the server.");
for (const required of ["resolveFounderAccess()", "if (!resolved) notFound()"]){if(!founderPage.includes(required))throw new Error(`Founder route authorization is missing: ${required}`);}
const profileLoad = home.indexOf("profileState = await loadExecutiveProfileState");
const optionalBriefing = home.indexOf("const [view, decision] = await Promise.all");
if (profileLoad < 0 || optionalBriefing < 0 || profileLoad > optionalBriefing) throw new Error("Stored profile truth can still be discarded by an optional briefing failure.");
if (!repository.includes('await this.advance("Blueprint","Professional History",{active_import_session_id:session},false)')) throw new Error("Live profile save still requires a legacy beta workflow.");

console.log("PASS Live executive profile and Founder authorization regression checks.");
