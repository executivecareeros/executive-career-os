import type { OpportunityProviderAdapter } from "../types";
import { AshbyOpportunityProvider, parseAshbyBoard } from "./ashby.ts";
import { GreenhouseOpportunityProvider, parseGreenhouseBoardToken } from "./greenhouse.ts";
import { LeverOpportunityProvider, parseLeverBoard } from "./lever.ts";
import { OpportunityProviderCatalog } from "./catalog.ts";

const reviewedAt = "2026-07-14T00:00:00.000Z";
const approved = (scores: Omit<OpportunityProviderAdapter["evaluation"], "accessModel" | "reviewStatus" | "reviewedAt">): OpportunityProviderAdapter["evaluation"] => ({
  ...scores, accessModel: "official-api", reviewStatus: "approved", reviewedAt,
});

export const productionProviderAdapters: readonly OpportunityProviderAdapter[] = [
  {
    id: "greenhouse", name: "Greenhouse", supports: (url) => ["boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io"].includes(url.hostname.toLowerCase()),
    create: (locator) => new GreenhouseOpportunityProvider(parseGreenhouseBoardToken(locator)),
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "lever", name: "Lever", supports: (url) => ["jobs.lever.co", "jobs.eu.lever.co"].includes(url.hostname.toLowerCase()),
    create: (locator) => { const board = parseLeverBoard(locator); return new LeverOpportunityProvider(board.site, board.region); },
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "ashby", name: "Ashby", supports: (url) => url.hostname.toLowerCase() === "jobs.ashbyhq.com",
    create: (locator) => new AshbyOpportunityProvider(parseAshbyBoard(locator)),
    evaluation: approved({ executiveCoverage: "moderate", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
] as const;

export const productionOpportunityProviderCatalog = new OpportunityProviderCatalog(productionProviderAdapters);
