import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFile(resolve(root, path), "utf8");
const [proxy, opportunity, companies, applications, compensation] = await Promise.all([
  read("proxy.ts"),
  read("app/opportunities/[id]/page.tsx"),
  read("components/companies/live-companies.tsx"),
  read("app/applications/page.tsx"),
  read("app/live-compensation/page.tsx"),
]);

const checks = {
  live_roots_are_not_demo_isolated: ["/workspace", "/assistant", "/blueprint", "/applications"].every((path) => proxy.includes(`\"${path}\"`)) && !proxy.includes('["/workspace", "workspace"]'),
  compensation_uses_live_records: proxy.includes('path === "/compensation"') && compensation.includes("compensation_records?select="),
  live_opportunity_precedes_fixtures: opportunity.indexOf('NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase"') < opportunity.indexOf("const opportunity = getOpportunityById(id)"),
  company_directory_is_searchable_and_paginated: companies.includes("Search companies") && companies.includes("Page {Math.min(page, pages)} of {pages}"),
  company_evidence_is_explicit: companies.includes("Identity confidence") && companies.includes("Average executive relevance") && companies.includes("Company overview is not inferred"),
  applications_use_workspace_records: applications.includes("applications?select=") && applications.includes("application_activities?select=") && applications.includes("application_documents?select="),
  no_invented_application_activity: applications.includes("never invents employer actions") && applications.includes("not an employer application"),
};

const failures = Object.entries(checks).filter(([, passed]) => !passed);
if (failures.length) throw new Error(`Live product truth checks failed: ${failures.map(([name]) => name).join(", ")}`);
console.log(`PASS Live Product Truth — ${Object.keys(checks).join(", ")}`);
