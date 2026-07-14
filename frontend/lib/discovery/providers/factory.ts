import type { OpportunityProvider } from "../types";
import { AshbyOpportunityProvider, parseAshbyBoard } from "./ashby.ts";
import { GreenhouseOpportunityProvider, parseGreenhouseBoardToken } from "./greenhouse.ts";
import { LeverOpportunityProvider, parseLeverBoard } from "./lever.ts";

export function providerFromCareersUrl(locator: string): OpportunityProvider {
  let host = "";
  try { host = new URL(locator.trim()).hostname.toLowerCase(); } catch { throw new Error("Enter a supported company careers URL."); }
  if (["boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io"].includes(host)) return new GreenhouseOpportunityProvider(parseGreenhouseBoardToken(locator));
  if (["jobs.lever.co", "jobs.eu.lever.co"].includes(host)) { const board = parseLeverBoard(locator); return new LeverOpportunityProvider(board.site, board.region); }
  if (host === "jobs.ashbyhq.com") return new AshbyOpportunityProvider(parseAshbyBoard(locator));
  throw new Error("This careers provider is not supported yet. Use a public Greenhouse, Lever, or Ashby URL.");
}
