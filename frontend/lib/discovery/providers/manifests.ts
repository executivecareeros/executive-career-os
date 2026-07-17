import type { ProviderManifest } from "../provider-manifest.ts";

const common = {
  version: "1.0",
  access: { model: "official-api", timeoutMs: 12_000 },
  retry: { retryableStatuses: [429, 500, 502, 503, 504], notFoundCode: "BOARD_NOT_FOUND" },
  reliability: { rating: "high", score: 90 },
  capabilities: ["jobs", "companies"],
  scheduler: { supported: true, defaultCadenceMinutes: 720 },
  timestamps: { publishedAt: "provider", discoveredAt: "collection-time" },
} as const;

export const greenhouseProviderManifest = {
  ...common,
  identity: { id: "greenhouse", name: "Greenhouse", category: "Corporate Website", description: "Published employer opportunities from the Greenhouse Job Board API." },
  access: { ...common.access, endpointOrigins: ["https://boards-api.greenhouse.io"] },
  pagination: { strategy: "none" },
  fields: { sourceId: "jobs[].id", title: "jobs[].title", employerId: "board token", employerName: "board.name", location: "jobs[].location.name", compensation: "unavailable", publishedAt: "jobs[].updated_at" },
  lifecycle: { snapshot: "incremental", scope: "employer-feed" },
  retry: { ...common.retry, unavailableCode: "GREENHOUSE_UNAVAILABLE" },
  reliability: { ...common.reliability, rationale: "Published directly through the employer's public Greenhouse job board." },
} as const satisfies ProviderManifest;

export const leverProviderManifest = {
  ...common,
  identity: { id: "lever", name: "Lever", category: "Corporate Website", description: "Published employer opportunities from the Lever Postings API." },
  access: { ...common.access, endpointOrigins: ["https://api.lever.co", "https://api.eu.lever.co"] },
  pagination: { strategy: "offset", maximumPageSize: 100, offsetParameter: "skip", limitParameter: "limit" },
  fields: { sourceId: "[].id", title: "[].text", employerId: "site", employerName: "controlled schedule context", location: "[].categories.location", compensation: "[].salaryRange", publishedAt: "unavailable" },
  lifecycle: { snapshot: "complete-when-untruncated", scope: "employer-feed" },
  retry: { ...common.retry, unavailableCode: "LEVER_UNAVAILABLE" },
  reliability: { ...common.reliability, rationale: "Published directly through the employer's public Lever job board." },
} as const satisfies ProviderManifest;

export const ashbyProviderManifest = {
  ...common,
  identity: { id: "ashby", name: "Ashby", category: "Corporate Website", description: "Listed employer opportunities from the Ashby public Job Postings API." },
  access: { ...common.access, endpointOrigins: ["https://api.ashbyhq.com"] },
  pagination: { strategy: "none" },
  fields: { sourceId: "jobs[].jobUrl", title: "jobs[].title", employerId: "board", employerName: "controlled schedule context", location: "jobs[].location", compensation: "jobs[].compensation.summaryComponents", publishedAt: "jobs[].publishedAt" },
  lifecycle: { snapshot: "complete-when-untruncated", scope: "employer-feed" },
  retry: { ...common.retry, unavailableCode: "ASHBY_UNAVAILABLE" },
  reliability: { ...common.reliability, rationale: "Published directly through the employer's public Ashby job board." },
} as const satisfies ProviderManifest;

export const workableProviderManifest = {
  ...common,
  identity: { id: "workable", name: "Workable", category: "Corporate Website", description: "Published employer opportunities from Workable's public account feed." },
  access: { ...common.access, endpointOrigins: ["https://www.workable.com"] },
  pagination: { strategy: "none" },
  fields: { sourceId: "jobs[].shortcode|code|url", title: "jobs[].title", employerId: "account", employerName: "response.name", location: "jobs[].city|state|country", compensation: "jobs[].salary", publishedAt: "jobs[].published_on|created_at" },
  lifecycle: { snapshot: "incremental", scope: "employer-feed" },
  retry: { ...common.retry, unavailableCode: "WORKABLE_UNAVAILABLE" },
  reliability: { ...common.reliability, rationale: "Published directly through the employer's public Workable account feed." },
} as const satisfies ProviderManifest;

export const certifiedProviderManifests = [greenhouseProviderManifest, leverProviderManifest, ashbyProviderManifest, workableProviderManifest] as const;
