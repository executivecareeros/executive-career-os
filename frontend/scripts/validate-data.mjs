import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const failures = [];
const checks = [];
const record = (name, passed, detail) => { checks.push({ name, passed, detail }); if (!passed) failures.push(`${name}: ${detail}`); };
const source = async (path) => readFile(resolve(root, path), "utf8");
const ids = (text, prefix = "") => [...text.matchAll(/\bid\s*:\s*["'`]([^"'`]+)["'`]/g)].map((match) => `${prefix}${match[1]}`);
const duplicates = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];

const datasets = ["data/opportunities.ts", "data/companies.ts", "data/applications.ts", "data/compensation.ts", "data/career-ledger.ts", "data/executive-blueprint.ts", "data/knowledge-network.ts"];
for (const file of datasets) {
  const values = ids(await source(file));
  const duplicateIds = duplicates(values);
  record(`${file} unique IDs`, duplicateIds.length === 0, duplicateIds.length ? duplicateIds.join(", ") : `${values.length} IDs checked`);
}

const opportunities = await source("data/opportunities.ts");
const companies = await source("data/companies.ts");
const applications = await source("data/applications.ts");
const compensation = await source("data/compensation.ts");
const blueprint = await source("data/executive-blueprint.ts");
const features = await source("lib/feature-registry.ts");
const opportunityIds = new Set([...opportunities.matchAll(/id:\s*"(demo-[^"]+)"\s*,\s*companyName/g)].map((match) => match[1]));
const companyIds = new Set([...companies.matchAll(/id:\s*"(demo-company-[^"]+)"/g)].map((match) => match[1]));
const referencedOpportunities = [...applications.matchAll(/opportunityId:\s*"([^"]+)"/g)].map((match) => match[1]);
const referencedCompanies = [...applications.matchAll(/companyId:\s*"([^"]+)"/g)].map((match) => match[1]);
record("Application opportunity references", referencedOpportunities.every((id) => opportunityIds.has(id)), referencedOpportunities.filter((id) => !opportunityIds.has(id)).join(", ") || `${referencedOpportunities.length} references checked`);
record("Application company references", referencedCompanies.every((id) => companyIds.has(id)), referencedCompanies.filter((id) => !companyIds.has(id)).join(", ") || `${referencedCompanies.length} references checked`);
const compensationOpportunityIds = [...compensation.matchAll(/opportunityId:\s*"([^"]+)"/g)].map((match) => match[1]);
record("Compensation opportunity references", compensationOpportunityIds.every((id) => opportunityIds.has(id)), compensationOpportunityIds.filter((id) => !opportunityIds.has(id)).join(", ") || `${compensationOpportunityIds.length} references checked`);
const revisions = [...blueprint.matchAll(/id:\s*"bp-rev-[^"]+"\s*,\s*revisionNumber:\s*(\d+)/g)].map((match) => Number(match[1]));
record("Blueprint revision sequence", revisions.every((value, index) => index === 0 || value >= revisions[index - 1]), revisions.join(" → "));
const featureKeys = [...features.matchAll(/featureKey:\s*"([^"]+)"/g)].map((match) => match[1]);
record("Feature registry unique keys", duplicates(featureKeys).length === 0, duplicates(featureKeys).join(", ") || `${featureKeys.length} keys checked`);

const routeDirectories = await readdir(resolve(root, "app"));
const requiredRoutes = ["opportunities", "companies", "applications", "assistant", "archive", "compensation", "discovery", "blueprint", "knowledge", "recruiters", "reports", "settings"];
record("Required route directories", requiredRoutes.every((route) => routeDirectories.includes(route)), requiredRoutes.filter((route) => !routeDirectories.includes(route)).join(", ") || `${requiredRoutes.length} routes checked`);

for (const check of checks) console.log(`${check.passed ? "PASS" : "FAIL"} ${check.name} — ${check.detail}`);
if (failures.length) { console.error(`\n${failures.length} integrity check(s) failed.`); process.exitCode = 1; } else console.log(`\nAll ${checks.length} deterministic integrity checks passed.`);
