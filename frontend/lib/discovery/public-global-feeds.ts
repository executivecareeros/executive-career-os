import type { EmployerSourceInput } from "./employer-source-factory";

/** Public, no-key feeds whose published terms allow attributed distribution. */
export const publicGlobalFeedSources: readonly EmployerSourceInput[] = [
  { employerName: "Jobicy Network", careersUrl: "https://jobicy.com/api/v2/remote-jobs", operatingRegions: ["Worldwide Remote"], refreshMinutes: 60, maximumResults: 100, priority: 30 },
  { employerName: "Arbeitnow Network", careersUrl: "https://www.arbeitnow.com/api/job-board-api", operatingRegions: ["Europe"], refreshMinutes: 60, maximumResults: 500, priority: 35 },
] as const;

/** Credentialed sources remain absent until approved credentials are configured. */
export function credentialedGlobalFeedSources(): readonly EmployerSourceInput[] {
  return process.env.USAJOBS_API_KEY && process.env.USAJOBS_USER_AGENT_EMAIL
    ? [{ employerName: "USAJOBS", careersUrl: "https://data.usajobs.gov/api/Search", operatingRegions: ["United States"], refreshMinutes: 60, maximumResults: 2_000, priority: 20 }]
    : [];
}
