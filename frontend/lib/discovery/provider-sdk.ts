import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionBatch } from "./types.ts";
import type { ProviderManifest } from "./provider-manifest.ts";
import { reliabilityFromManifest, sourceFromManifest, validateProviderManifest } from "./provider-manifest.ts";

export class ProviderHttpError extends Error {
  constructor(message: string, readonly code: string, readonly retryable: boolean, readonly status: number) {
    super(message);
  }
}

export class ProviderSdk {
  readonly source;
  readonly reliability;

  constructor(readonly manifest: ProviderManifest, private readonly fetcher: typeof fetch = fetch) {
    validateProviderManifest(manifest);
    this.source = sourceFromManifest(manifest);
    this.reliability = reliabilityFromManifest(manifest);
  }

  async json<T>(url: string | URL, notFoundMessage: string): Promise<T> {
    const target = new URL(url);
    if (!this.manifest.access.endpointOrigins.includes(target.origin)) throw new Error(`Provider endpoint is outside the ${this.manifest.identity.name} manifest`);
    const response = await this.fetcher(target, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(this.manifest.access.timeoutMs),
    });
    if (!response.ok) {
      const notFound = response.status === 404;
      throw new ProviderHttpError(
        notFound ? notFoundMessage : `${this.manifest.identity.name} returned ${response.status}.`,
        notFound ? this.manifest.retry.notFoundCode : this.manifest.retry.unavailableCode,
        this.manifest.retry.retryableStatuses.includes(response.status),
        response.status,
      );
    }
    return response.json() as Promise<T>;
  }

  async collectOffsetPages<T>(maximumResults: number, fetchPage: (offset: number, limit: number) => Promise<readonly T[]>) {
    if (this.manifest.pagination.strategy !== "offset") throw new Error(`${this.manifest.identity.name} does not declare offset pagination`);
    const records: T[] = [];
    let completeSnapshot = false;
    while (records.length < maximumResults) {
      const limit = Math.min(this.manifest.pagination.maximumPageSize, maximumResults - records.length);
      const page = await fetchPage(records.length, limit);
      records.push(...page.slice(0, limit));
      if (page.length < limit) { completeSnapshot = true; break; }
    }
    return { records, completeSnapshot } as const;
  }

  batch(input: {
    collectedAt: string;
    jobs: readonly DiscoveryJob[];
    sourceRevision?: string;
    completeSnapshot?: boolean;
    snapshotScopeKeys?: readonly string[];
  }): ProviderCollectionBatch {
    return { providerId: this.manifest.identity.id, ...input };
  }

  async health(probe: () => Promise<unknown>, availableMessage: string, unavailableMessage: string): Promise<DiscoveryHealth> {
    const started = Date.now();
    try {
      await probe();
      return { source: this.manifest.identity.id, status: "connected", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: availableMessage };
    } catch (error) {
      return { source: this.manifest.identity.id, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: error instanceof Error ? error.message : unavailableMessage };
    }
  }
}

export function providerContractFrom(manifest: ProviderManifest, sdk: ProviderSdk): Pick<OpportunityProvider, "id" | "source" | "reliability"> {
  return { id: manifest.identity.id, source: sdk.source, reliability: sdk.reliability };
}
