import type {
  ConfidenceRating,
  DiscoverySource,
  DiscoverySourceKind,
  ProviderAccessModel,
  SourceReliability,
  SourceReliabilityType,
} from "./types";

export const providerManifestVersion = "1.0" as const;

export type ProviderPaginationManifest =
  | { strategy: "none"; maximumPageSize?: never; offsetParameter?: never; limitParameter?: never }
  | { strategy: "offset"; maximumPageSize: number; offsetParameter: string; limitParameter: string };

export type ProviderManifest = {
  version: typeof providerManifestVersion;
  identity: {
    id: DiscoverySourceKind;
    name: string;
    category: SourceReliabilityType;
    description: string;
  };
  access: {
    model: ProviderAccessModel;
    endpointOrigins: readonly string[];
    timeoutMs: number;
  };
  pagination: ProviderPaginationManifest;
  fields: {
    sourceId: string;
    title: string;
    employerId: string;
    employerName: string;
    location?: string;
    compensation?: string;
    publishedAt?: string;
  };
  timestamps: {
    publishedAt: "provider" | "unavailable";
    discoveredAt: "collection-time";
  };
  lifecycle: {
    snapshot: "complete-when-untruncated" | "incremental";
    scope: "employer-feed" | "provider";
  };
  retry: {
    retryableStatuses: readonly number[];
    unavailableCode: string;
    notFoundCode: string;
  };
  reliability: {
    rating: ConfidenceRating;
    score: number;
    rationale: string;
  };
  capabilities: readonly ("jobs" | "companies")[];
  scheduler: {
    supported: boolean;
    defaultCadenceMinutes: number;
  };
};

export function validateProviderManifest(manifest: ProviderManifest) {
  const errors: string[] = [];
  if (manifest.version !== providerManifestVersion) errors.push("Unsupported provider manifest version");
  if (!manifest.identity.id.trim()) errors.push("Provider identity is required");
  if (!manifest.identity.name.trim()) errors.push("Provider name is required");
  if (!manifest.access.endpointOrigins.length) errors.push("At least one endpoint origin is required");
  if (manifest.access.endpointOrigins.some((origin) => {
    try { return new URL(origin).protocol !== "https:"; } catch { return true; }
  })) errors.push("Provider endpoint origins must be valid HTTPS origins");
  if (!Number.isInteger(manifest.access.timeoutMs) || manifest.access.timeoutMs < 1) errors.push("Provider timeout must be a positive integer");
  if (manifest.pagination.strategy === "offset" && (!Number.isInteger(manifest.pagination.maximumPageSize) || manifest.pagination.maximumPageSize < 1)) errors.push("Offset pagination requires a positive maximum page size");
  if (manifest.reliability.score < 0 || manifest.reliability.score > 100) errors.push("Reliability score must be between 0 and 100");
  if (!manifest.retry.retryableStatuses.length) errors.push("Retryable statuses are required");
  if (!manifest.capabilities.includes("jobs")) errors.push("Opportunity providers must declare the jobs capability");
  if (manifest.scheduler.supported && manifest.scheduler.defaultCadenceMinutes < 1) errors.push("Scheduled providers require a positive cadence");
  if (errors.length) throw new Error(`Invalid provider manifest: ${errors.join("; ")}`);
  return manifest;
}

export function sourceFromManifest(manifest: ProviderManifest): DiscoverySource {
  validateProviderManifest(manifest);
  return { ...manifest.identity, capabilities: manifest.capabilities };
}

export function reliabilityFromManifest(manifest: ProviderManifest, assessedAt = new Date().toISOString()): SourceReliability {
  validateProviderManifest(manifest);
  return { type: manifest.identity.category, ...manifest.reliability, assessedAt };
}
