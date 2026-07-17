# Provider Certification Framework

**Status:** Active · **Owner:** Opportunity Coverage Engine · **Effective:** 2026-07-17 · **Review:** after every provider or framework change

## Purpose

This is the permanent certification gate for every opportunity provider. A provider is not production-ready because its endpoint returns jobs. It must pass the same evidence chain through discovery, canonical inventory, lifecycle, scheduling, metrics, company surfaces, regression, build, and isolated staging.

## Required gates

| Gate | Pass evidence | Failure rule |
|---|---|---|
| Discovery | Valid source records are collected with stable source identity and provenance. | Reject the provider or invalid record; never repair by inventing data. |
| Replay | The same source snapshot produces no new canonical records and stable source identities. | Block activation. |
| Pagination | Every documented page is collected within the configured maximum; termination is deterministic. | Block activation when inventory may be silently truncated. |
| Canonicalization | Provider observations enter the common normalizer and Coverage Engine and resolve to one canonical Opportunity. | Provider-specific persistence is prohibited. |
| Employer resolution | Every observation has a stable provider employer/feed key; official employer identity remains Unknown without evidence. | Do not promote ATS identity to verified corporate identity. |
| Opportunity resolution | Cross-run source identity is stable and repeated observations merge rather than duplicate. | Block activation. |
| Lifecycle | Complete snapshots are scoped to an employer/feed; missing records close only that scope and reobserved records reactivate. | Block complete-snapshot activation. |
| Scheduler | Provider registers, queues, executes, retries, and records a durable result through the shared scheduler contract. | Block scheduled activation. |
| Metrics | Runs, rejected observations, freshness, health, and canonical inventory are measurable. | A provider without health evidence is not production. |
| Company pages | Employer provenance is available to the canonical company surface without fabricated claims. | Block public company claims. |
| Regression | Provider connector, discovery, durable ingestion, scheduler, metrics, lint, and production build pass. | Stop release progression. |
| Deployment | Isolated staging is Ready, the provider schedule is controlled, first run and replay are observed, and no production domain is affected. | Local success is not deployment certification. |

## Reusable execution

`runProviderCertification(provider, manifest)` is the deterministic provider contract harness. It covers discovery, replay, pagination applicability, canonicalization, employer and opportunity resolution, scoped lifecycle, scheduler queue execution, provider health, and coverage metrics.

`npm run certify:providers` is the repository certification command. It runs the three certified connector suites, the common harness, discovery and durable-ingestion regression, scheduler and Orion metrics, lint, and the production build.

Deployment certification remains an external evidence gate because a local test must not claim that isolated staging is Ready. The evidence must record the deployment revision, schedule, first run, replay, canonical inventory, and provider health.

## Certification record

The provider manifest, adapter evaluation, test output, staging run records, and Orion roadmap together form the certification record. Secrets, tokens, personal data, and private employer payloads are excluded.

## Current validation

On 2026-07-17, Greenhouse, Lever, and Ashby passed the common deterministic contract. The recorded certification run processed 1 Greenhouse fixture in 11.04 ms, 101 paginated Lever fixtures in 9.73 ms, and 1 Ashby fixture in 0.57 ms. Replay preserved canonical counts. Lever and Ashby passed scoped lifecycle restoration; Greenhouse remains incremental by its existing contract. These durations measure deterministic fixture certification, not live provider latency.

## Measured acceleration

- Engineering Reuse Index: 100% of 11 mandatory certification concerns execute through the shared harness and repository certification command.
- Shared framework surface: 279 meaningful lines across manifest, SDK, scaffold, and certification modules.
- Certified adapter surface after extraction: 153 meaningful lines: Greenhouse 73, Lever 45, Ashby 35.
- Certified adapter surface before extraction: 160 meaningful lines: Greenhouse 79, Lever 50, Ashby 31.
- Direct adapter reduction: 7 meaningful lines, or 4.4%, while adding explicit manifests and stronger common gates.
- Future simple-provider integration surface: 6 declared provider hooks versus 11 certification concerns, a measured 45.5% reduction in provider-owned responsibility count.
- Common Coverage Engine, scheduler runtime, normalizer, canonical model, persistence, and database schema modifications: 0.
- Files changed by M2X: 18, including the three required documents and three authoritative Orion updates.
- Regression failures after correction of the new harness lifecycle test double: 0.
- Time estimate: not produced. Measured code surface and certification duration are used instead.

## Adding the next provider

1. Record the provider evaluation and reserved gates.
2. Declare a valid manifest.
3. Implement only locator validation and source-to-DiscoveryJob mapping; use the shared SDK or scaffold.
4. Run `runProviderCertification` with deterministic public-contract fixtures.
5. Run `npm run certify:providers`.
6. Deploy only to isolated staging.
7. Observe the first run and a zero-change or explainable replay.
8. Record health, inventory, duplicate, freshness, and lifecycle evidence before production classification.
