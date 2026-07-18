import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../../supabase/migrations/202607180007_archive_fictional_acceptance_history.sql", import.meta.url), "utf8");
const workflow = await readFile(new URL("../app/beta-workflow/page.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../components/home/simple-executive-home.tsx", import.meta.url), "utf8");
const workspace = await readFile(new URL("../app/workspace/page.tsx", import.meta.url), "utf8");

if (!migration.includes("archived_at = now()") || !migration.includes("Fictional acceptance record:")) throw new Error("Cleanup must archive only the evidenced acceptance fixture.");
if (migration.includes("updated_at")) throw new Error("Cleanup must match the professional_experiences schema exactly.");
if (!migration.includes("aurora meridian group") || !migration.includes("chief strategy officer")) throw new Error("Cleanup identity must remain exact and bounded.");
if (workflow.includes('placeholder="Example: Aurora Meridian Group"')) throw new Error("Authenticated workflow must not prompt with a fictional acceptance employer.");
if (!home.includes("Your confirmed career profile") || !workspace.includes("Your confirmed career profile")) throw new Error("Primary profile surfaces must describe confirmed career memory, not expose a source filename as identity.");

console.log("PASS Production truth cleanup — bounded fixture archival and truthful profile presentation");
