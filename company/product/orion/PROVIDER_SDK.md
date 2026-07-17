# Provider SDK

**Status:** Active · **Owner:** Opportunity Coverage Engine · **Version:** 1.0 · **Effective:** 2026-07-17

## Purpose

The Provider SDK contains only behavior proven repeatedly by Greenhouse, Lever, and Ashby. It does not replace the Coverage Engine and does not create provider-specific architecture.

## Shared capabilities

- manifest validation and source/reliability construction;
- HTTPS-origin allowlisting for provider requests;
- JSON requests with a bounded timeout and no cache;
- consistent not-found, unavailable, and retry classification;
- bounded offset pagination;
- canonical provider batch construction;
- provider health probes with latency;
- single-endpoint JSON provider scaffold;
- deterministic certification through the existing normalizer, pipeline, queue, lifecycle, and metrics.

The shared pipeline remains responsible for validation, normalization, canonical identity, duplicate detection, provenance, source merging, lifecycle, freshness, run monitoring, and retry scheduling. The SDK does not duplicate those responsibilities.

## Provider-specific responsibilities

A provider adapter still owns:

1. secure locator parsing;
2. documented endpoint construction;
3. provider response types;
4. source-record selection;
5. deterministic field mapping without invented values;
6. provider revision and employer/feed scope identity.

Complex APIs may use `ProviderSdk` directly. A simple single-endpoint JSON provider may use `createProviderScaffold`. The scaffold requires six provider hooks: endpoint, records, map, revision, scope key, and the manifest. It must not be stretched to conceal materially different provider behavior.

Workable is the first production-certifiable adapter implemented through the complete scaffold. It reuses manifest validation, source and reliability construction, HTTPS request controls, error classification, batch construction, health, scheduler integration, canonicalization, replay, metrics, and lifecycle certification. Workable-specific code remains locator validation and deterministic response mapping.

## Boundaries

- Providers return `DiscoveryJob`; they never create domain Opportunities.
- The SDK accepts only HTTPS origins explicitly declared by the manifest.
- Retry behavior is status-based and declarative.
- Unknown source fields remain undefined.
- A complete snapshot is valid only when the adapter can prove the requested scope was not truncated.
- An employer/feed scope must be stable across runs.
- Provider credentials, if a future approved provider needs them, remain outside code and manifests.

## Rollback

Adapters retain the `OpportunityProvider` interface. The SDK can be removed from an adapter without a data migration, scheduler change, or canonical-model change. Existing provider run and source history remains intact.
