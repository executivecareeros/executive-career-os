import type { DiscoveryConfiguration, DiscoveryHealth, DiscoveryRun, DiscoverySchedule, DiscoveryStatistics, SourceReliability } from "@/lib/discovery";

export const demoDiscoveryHealth: readonly DiscoveryHealth[] = [
  { source: "greenhouse", status: "available", checkedAt: "2026-07-11T09:00:00.000Z", message: "Stub available; no connection configured." },
  { source: "executive-search-firm", status: "available", checkedAt: "2026-07-11T09:00:00.000Z", message: "Stub available; no connection configured." },
  { source: "manual-import", status: "available", checkedAt: "2026-07-11T09:00:00.000Z", message: "Local demonstration adapter available." },
  { source: "rss-feed", status: "disabled", checkedAt: "2026-07-11T09:00:00.000Z", message: "Disabled in demonstration settings." },
];

export const demoDiscoveryRuns: readonly DiscoveryRun[] = [
  { id: "RUN-DEMO-004", source: "greenhouse", status: "completed", startedAt: "2026-07-10T07:00:00.000Z", finishedAt: "2026-07-10T07:00:12.000Z", durationMs: 12000, jobsFound: 18, jobsImported: 4, jobsIgnored: 14, errors: [], warnings: ["Demonstration run; no source was contacted."], isDemo: true },
  { id: "RUN-DEMO-003", source: "executive-search-firm", status: "completed-with-warnings", startedAt: "2026-07-09T07:00:00.000Z", finishedAt: "2026-07-09T07:00:08.000Z", durationMs: 8000, jobsFound: 6, jobsImported: 2, jobsIgnored: 4, errors: [], warnings: ["Two records lacked publication dates.", "Demonstration run; no source was contacted."], isDemo: true },
  { id: "RUN-DEMO-002", source: "manual-import", status: "completed", startedAt: "2026-07-08T13:30:00.000Z", finishedAt: "2026-07-08T13:30:02.000Z", durationMs: 2000, jobsFound: 3, jobsImported: 3, jobsIgnored: 0, errors: [], warnings: [], isDemo: true },
];

export const demoDiscoverySchedule: readonly DiscoverySchedule[] = [
  { id: "schedule-demo-1", source: "greenhouse", frequency: "daily", enabled: true, timezone: "Europe/Istanbul", nextRunAt: "2026-07-12T07:00:00.000Z" },
  { id: "schedule-demo-2", source: "executive-search-firm", frequency: "weekly", enabled: true, timezone: "Europe/Istanbul", nextRunAt: "2026-07-13T07:00:00.000Z" },
  { id: "schedule-demo-3", source: "manual-import", frequency: "manual", enabled: true, timezone: "Europe/Istanbul" },
];

export const demoDiscoveryStatistics: DiscoveryStatistics = { totalRuns: 4, successfulRuns: 3, opportunitiesFound: 27, opportunitiesImported: 9, duplicateRate: 33, averageConfidence: 68, lastCalculatedAt: "2026-07-11T09:00:00.000Z" };

export const demoReliability: readonly { source: string; reliability: SourceReliability }[] = [
  { source: "Corporate ATS", reliability: { type: "Corporate Website", rating: "high", score: 85, rationale: "Direct employer publication with stable identifiers.", assessedAt: "2026-07-11T09:00:00.000Z" } },
  { source: "Executive Search", reliability: { type: "Executive Search Firm", rating: "high", score: 80, rationale: "Curated mandate requiring source verification.", assessedAt: "2026-07-11T09:00:00.000Z" } },
  { source: "Job Board", reliability: { type: "Job Board", rating: "moderate", score: 60, rationale: "Aggregated listing requiring freshness checks.", assessedAt: "2026-07-11T09:00:00.000Z" } },
  { source: "Manual", reliability: { type: "Manual Import", rating: "moderate", score: 55, rationale: "Confidence depends on supplied evidence.", assessedAt: "2026-07-11T09:00:00.000Z" } },
];

export const demoDiscoverySettings: readonly DiscoveryConfiguration[] = [
  { source: "greenhouse", enabled: true, priority: 1, maximumResults: 50, filters: { countries: ["Türkiye", "United Kingdom"], industries: ["Technology"], executiveLevels: ["C-suite", "VP"], languages: ["English", "Turkish"], keywords: ["strategy", "transformation"], exclusionKeywords: ["intern", "junior"] } },
  { source: "executive-search-firm", enabled: true, priority: 1, maximumResults: 25, filters: { countries: ["Europe"], industries: [], executiveLevels: ["C-suite"], languages: ["English"], keywords: ["chief"], exclusionKeywords: [] } },
  { source: "rss-feed", enabled: false, priority: 3, maximumResults: 20, filters: { countries: [], industries: [], executiveLevels: [], languages: ["English"], keywords: [], exclusionKeywords: [] } },
];
