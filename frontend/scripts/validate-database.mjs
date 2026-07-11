import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const migrationDirectory = resolve(root, "supabase/migrations");
const migrationFiles = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
const sql = (await Promise.all(migrationFiles.map((file) => readFile(resolve(migrationDirectory, file), "utf8")))).join("\n");
const seed = await readFile(resolve(root, "supabase/seed.sql"), "utf8");
const failures = [];
const check = (name, passed, detail) => {
  console.log(`${passed ? "PASS" : "FAIL"} ${name} — ${detail}`);
  if (!passed) failures.push(name);
};

const explicitTables = [...sql.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);
const businessTables = [...sql.matchAll(/create_business_table\('([a-z_]+)'/g)].map((match) => match[1]);
const exposedTables = [...new Set([...explicitTables, ...businessTables])];
const rlsLoops = [...sql.matchAll(/foreach t in array array\[([^;]+?)\] loop execute format\('alter table public\.%I enable row level security'/g)].map((match) => match[1]).join(" ");

check("Migrations discovered", migrationFiles.length > 0, migrationFiles.join(", "));
check("Core tables declared", exposedTables.length >= 25, `${exposedTables.length} tables`);
check("RLS coverage", exposedTables.every((table) => rlsLoops.includes(`'${table}'`)), exposedTables.filter((table) => !rlsLoops.includes(`'${table}'`)).join(", ") || "all exposed tables included");
const workspaceExempt = new Set(["executive_identities", "workspaces", "workspace_permissions"]);
const explicitWorkspaceTables = explicitTables.filter((table) => !workspaceExempt.has(table));
const explicitWorkspaceScoped = explicitWorkspaceTables.every((table) => new RegExp(`create table public\\.${table}\\([^;]*workspace_id`).test(sql));
check("Workspace ownership columns", sql.includes("workspace_id uuid not null") && explicitWorkspaceScoped, "workspace-owned tables scoped");

const appendOnlyTables = ["career_ledger_entries", "compensation_records", "executive_blueprint_revisions", "atlas_decision_snapshots", "knowledge_observations", "discovery_runs", "document_versions"];
check("Append-only trigger coverage", appendOnlyTables.every((table) => sql.includes(`'${table}'`)) && sql.includes("before update or delete"), appendOnlyTables.join(", "));
check("Authenticated membership policies", sql.includes("auth.uid()") && sql.includes("is_active_workspace_member") && sql.includes("status='Active'"), "auth identity and active membership required");
check("Compensation permission policy", sql.includes("has_workspace_permission(workspace_id,'View Compensation')"), "independent compensation scope");
check("Idempotent fictional seed", seed.includes("on conflict") && seed.includes('"isDemo":true'), "seed uses conflict guards and demo labels");
check("No real email in seed", !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(seed), "no email addresses");

const walk = async (path) => (await Promise.all((await readdir(path, { withFileTypes: true })).map((entry) => entry.isDirectory() ? walk(resolve(path, entry.name)) : resolve(path, entry.name)))).flat();
const trackedFiles = (await Promise.all(["frontend/lib", "frontend/app", "supabase"].map((directory) => walk(resolve(root, directory))))).flat().filter((file) => /\.(ts|tsx|sql|toml)$/.test(file));
const texts = await Promise.all(trackedFiles.map((file) => readFile(file, "utf8")));
check("No service-role browser exposure", texts.every((text) => !text.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE") && !/service[_-]role[_-]key/i.test(text)), "no public or committed service-role key");

if (failures.length) {
  console.error(`\n${failures.length} database validation check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log("\nAll database architecture checks passed. Static validation only; no PostgreSQL runtime was available.");
}
