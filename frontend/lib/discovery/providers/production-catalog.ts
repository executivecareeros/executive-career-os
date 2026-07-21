import type { OpportunityProviderAdapter } from "../types";
import { AshbyOpportunityProvider, parseAshbyBoard } from "./ashby.ts";
import { CompanyCareerSiteOpportunityProvider, isSafePublicCareerUrl, parseCompanyCareerUrl } from "./company-career-site.ts";
import { GreenhouseOpportunityProvider, parseGreenhouseBoardToken } from "./greenhouse.ts";
import { LeverOpportunityProvider, parseLeverBoard } from "./lever.ts";
import { PersonioOpportunityProvider, parsePersonioAccount } from "./personio.ts";
import { RecruiteeOpportunityProvider, parseRecruiteeCompany } from "./recruitee.ts";
import { SmartRecruitersOpportunityProvider, parseSmartRecruitersCompany } from "./smartrecruiters.ts";
import { WorkableOpportunityProvider, parseWorkableAccount } from "./workable.ts";
import { JobicyOpportunityProvider } from "./jobicy.ts";
import { ArbeitnowOpportunityProvider } from "./arbeitnow.ts";
import { OpportunityProviderCatalog } from "./catalog.ts";

const reviewedAt = "2026-07-14T00:00:00.000Z";
const approved = (scores: Omit<OpportunityProviderAdapter["evaluation"], "accessModel" | "reviewStatus" | "founderGateReasons" | "reviewedAt">, accessModel: OpportunityProviderAdapter["evaluation"]["accessModel"] = "official-api"): OpportunityProviderAdapter["evaluation"] => ({
  ...scores, accessModel, reviewStatus: "approved", founderGateReasons: [], reviewedAt,
});

export const productionProviderAdapters: readonly OpportunityProviderAdapter[] = [
  {
    id: "greenhouse", name: "Greenhouse", supports: (url) => ["boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io"].includes(url.hostname.toLowerCase()),
    create: (locator) => new GreenhouseOpportunityProvider(parseGreenhouseBoardToken(locator)),
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "lever", name: "Lever", supports: (url) => ["jobs.lever.co", "jobs.eu.lever.co"].includes(url.hostname.toLowerCase()),
    create: (locator, context) => { const board = parseLeverBoard(locator); return new LeverOpportunityProvider(board.site, board.region, context?.companyName); },
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "ashby", name: "Ashby", supports: (url) => url.hostname.toLowerCase() === "jobs.ashbyhq.com",
    create: (locator, context) => new AshbyOpportunityProvider(parseAshbyBoard(locator), context?.companyName),
    evaluation: approved({ executiveCoverage: "moderate", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "smartrecruiters", name: "SmartRecruiters", supports: (url) => ["careers.smartrecruiters.com", "jobs.smartrecruiters.com"].includes(url.hostname.toLowerCase()),
    create: (locator) => new SmartRecruitersOpportunityProvider(parseSmartRecruitersCompany(locator)),
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "recruitee", name: "Recruitee", supports: (url) => /^[a-z0-9-]+\.recruitee\.com$/i.test(url.hostname),
    create: (locator) => new RecruiteeOpportunityProvider(parseRecruiteeCompany(locator)),
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "personio", name: "Personio", supports: (url) => /^[a-z0-9-]+\.jobs\.personio\.(com|de)$/i.test(url.hostname),
    create: (locator) => { const feed = parsePersonioAccount(locator); return new PersonioOpportunityProvider(feed.account, feed.region); },
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "workable", name: "Workable", supports: (url) => url.hostname.toLowerCase() === "apply.workable.com" || (url.hostname.toLowerCase() === "www.workable.com" && url.pathname.startsWith("/api/accounts/")),
    create: (locator) => new WorkableOpportunityProvider(parseWorkableAccount(locator)),
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "high", legalCompliance: "high", reliability: "high", scalability: "high", engineeringEfficiency: "high" }),
  },
  {
    id: "jobicy", name: "Jobicy", supports: (url) => url.hostname.toLowerCase() === "jobicy.com" && url.pathname === "/api/v2/remote-jobs",
    create: () => new JobicyOpportunityProvider(),
    evaluation: approved({ executiveCoverage: "moderate", executiveRelevance: "moderate", dataQuality: "moderate", freshness: "high", legalCompliance: "high", reliability: "moderate", scalability: "moderate", engineeringEfficiency: "high" }, "public-feed"),
  },
  {
    id: "arbeitnow", name: "Arbeitnow", supports: (url) => url.hostname.toLowerCase() === "www.arbeitnow.com" && url.pathname === "/api/job-board-api",
    create: () => new ArbeitnowOpportunityProvider(),
    evaluation: approved({ executiveCoverage: "moderate", executiveRelevance: "moderate", dataQuality: "moderate", freshness: "high", legalCompliance: "high", reliability: "moderate", scalability: "high", engineeringEfficiency: "high" }, "public-feed"),
  },
  {
    id: "corporate-career-site", name: "Company Career Site", supports: isSafePublicCareerUrl,
    create: (locator) => new CompanyCareerSiteOpportunityProvider(parseCompanyCareerUrl(locator)),
    evaluation: approved({ executiveCoverage: "high", executiveRelevance: "high", dataQuality: "high", freshness: "moderate", legalCompliance: "high", reliability: "moderate", scalability: "high", engineeringEfficiency: "high" }, "public-feed"),
  },
] as const;

export const productionOpportunityProviderCatalog = new OpportunityProviderCatalog(productionProviderAdapters);
