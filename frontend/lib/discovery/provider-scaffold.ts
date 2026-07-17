import { ProviderSdk } from "./provider-sdk.ts";
import type { ProviderManifest } from "./provider-manifest.ts";
import type { DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "./types.ts";

export type ProviderScaffoldDefinition<TPayload, TRecord> = {
  manifest: ProviderManifest;
  endpoint(locator: string, request: ProviderCollectionRequest): string | URL;
  notFoundMessage: string;
  records(payload: TPayload): readonly TRecord[];
  map(record: TRecord, context: { locator: string; collectedAt: string; payload: TPayload }): DiscoveryJob;
  revision(payload: TPayload, records: readonly TRecord[]): string;
  scopeKey(locator: string): string;
};

/** Minimal scaffold for a single-endpoint JSON provider. Complex APIs may use ProviderSdk directly. */
export function createProviderScaffold<TPayload, TRecord>(definition: ProviderScaffoldDefinition<TPayload, TRecord>, locator: string, fetcher: typeof fetch = fetch): OpportunityProvider {
  const sdk = new ProviderSdk(definition.manifest, fetcher);
  const load = (request: ProviderCollectionRequest) => sdk.json<TPayload>(definition.endpoint(locator, request), definition.notFoundMessage);
  return {
    id: definition.manifest.identity.id,
    source: sdk.source,
    reliability: sdk.reliability,
    async collect(request) {
      const collectedAt = new Date().toISOString();
      const payload = await load(request);
      const all = definition.records(payload);
      const selected = all.slice(0, request.maximumResults);
      return sdk.batch({
        collectedAt,
        jobs: selected.map((record) => definition.map(record, { locator, collectedAt, payload })),
        sourceRevision: definition.revision(payload, all),
        completeSnapshot: definition.manifest.lifecycle.snapshot === "complete-when-untruncated" && all.length <= request.maximumResults,
        snapshotScopeKeys: definition.manifest.lifecycle.scope === "employer-feed" ? [definition.scopeKey(locator)] : undefined,
      });
    },
    health() {
      const request: ProviderCollectionRequest = { runId: "health", requestedAt: new Date().toISOString(), maximumResults: 1, filters: { countries: [], industries: [], executiveLevels: [], languages: [], keywords: [], exclusionKeywords: [] } };
      return sdk.health(() => load(request), `${definition.manifest.identity.name} is available.`, `${definition.manifest.identity.name} is unavailable.`);
    },
  };
}
