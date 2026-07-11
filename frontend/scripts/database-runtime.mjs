import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

export const docker = process.env.DOCKER_BIN ?? "/Applications/Docker.app/Contents/Resources/bin/docker";
export const container = "supabase_db_executive-career-os-local";
export function psql(sql) {
  return execFileSync(docker, ["exec", "-i", container, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At"], { input: sql, encoding: "utf8" });
}
export function sqlFile(relativePath) { return resolve(import.meta.dirname, "../..", relativePath); }
export function pass(label, detail = "") { console.log(`PASS ${label}${detail ? ` — ${detail}` : ""}`); }
