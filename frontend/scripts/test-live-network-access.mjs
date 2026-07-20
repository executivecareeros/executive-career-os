import { readFileSync } from "node:fs";

const opportunities = readFileSync(new URL("../app/opportunities/page.tsx", import.meta.url), "utf8");
const detail = readFileSync(new URL("../app/opportunities/[id]/page.tsx", import.meta.url), "utf8");
const decisions = readFileSync(new URL("../app/opportunities/actions.ts", import.meta.url), "utf8");
const companies = readFileSync(new URL("../app/companies/page.tsx", import.meta.url), "utf8");
const network = readFileSync(new URL("../lib/opportunity-network.ts", import.meta.url), "utf8");

for (const [source, requirement] of [
  [opportunities, "loadNetworkOpportunities"],
  [detail, "loadNetworkOpportunity"],
  [companies, "loadNetworkCompanies"],
  [decisions, "materializeNetworkOpportunity"],
  [network, 'import "server-only"'],
]) if (!source.includes(requirement)) throw new Error(`Live network boundary is missing: ${requirement}`);

if (!network.includes("networkSourceOpportunityId")) throw new Error("Private decisions do not retain canonical network provenance.");
if (!network.includes("workspace_id: workspaceId")) throw new Error("Network opportunities are not materialized into the executive's private workspace.");
if (opportunities.includes("&workspace_id=eq.${resolved.context.workspace!.workspaceId}&archived_at=is.null&status=")) throw new Error("Jobs still reads the private workspace as the global catalog.");
if (companies.includes("loadCanonicalCompanies(client, workspaceId)")) throw new Error("Companies still reads the private workspace as the global directory.");

console.log("PASS Shared Opportunity Network read boundary and private decision materialization checks.");
