import type { EmployerSourceInput } from "./employer-source-factory";

/** Public, no-key feeds whose published terms allow attributed distribution. */
export const publicGlobalFeedSources: readonly EmployerSourceInput[] = [
  { employerName: "Jobicy Network", careersUrl: "https://jobicy.com/api/v2/remote-jobs", operatingRegions: ["Worldwide Remote"], refreshMinutes: 60, maximumResults: 100, priority: 30 },
  { employerName: "Arbeitnow Network", careersUrl: "https://www.arbeitnow.com/api/job-board-api", operatingRegions: ["Europe"], refreshMinutes: 60, maximumResults: 500, priority: 35 },
] as const;
