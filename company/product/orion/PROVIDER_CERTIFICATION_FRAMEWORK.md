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

On 2026-07-17, Greenhouse, Lever, Ashby, and Workable passed the same deterministic contract. The final M3 run processed 1 Greenhouse fixture in 10.40 ms, 101 paginated Lever fixtures in 8.99 ms, 1 Ashby fixture in 0.45 ms, and 1 Workable fixture in 0.45 ms. Replay preserved canonical counts. Lever and Ashby passed scoped closure/reactivation. Greenhouse and Workable passed incremental empty-run safety without deactivation. These durations measure deterministic fixture certification, not live provider latency.

## Measured acceleration

- Engineering Reuse Index: 100% of 11 mandatory certification concerns execute through the shared harness and repository certification command.
- Shared framework surface after M3: 291 meaningful lines across manifest, SDK, scaffold, and certification modules.
- Certified adapter surface after Workable certification: 209 meaningful lines: Greenhouse 73, Lever 45, Ashby 35, Workable 56.
- Certified adapter surface before extraction: 160 meaningful lines: Greenhouse 79, Lever 50, Ashby 31.
- Direct adapter reduction: 7 meaningful lines, or 4.4%, while adding explicit manifests and stronger common gates.
- Future simple-provider integration surface: 6 declared provider hooks versus 11 certification concerns, a measured 45.5% reduction in provider-owned responsibility count.
- Common Coverage Engine, scheduler runtime, normalizer, canonical model, persistence, and database schema modifications: 0.
- M3 public framework API changes: 0. The 12-line shared certification addition verifies incremental lifecycle safety for Greenhouse, Workable, and future incremental providers.
- M3 certification and regression failures: 0.
- Time estimate: not produced. Measured code surface and certification duration are used instead.

## M3 engineering economics

- Connector-specific responsibility count: 6 scaffold hooks.
- Shared framework responsibility count: 11 certification concerns plus request, batch, health, canonicalization, scheduling, metrics, and persistence services.
- Framework Stability Index: 100% of the M2X public framework signatures remained unchanged.
- Connector SDK reuse: 4 of 5 SDK capabilities used; offset pagination is correctly not applicable.
- Certification reuse: 11 of 11 mandatory certification concerns use the common harness/command.
- Manifest reuse: all 10 required Manifest v1.0 sections.
- Scaffold reuse: all 6 scaffold hooks; no alternate Workable execution path.
- Connector-specific production surface: 56 meaningful adapter lines plus 12 declarative manifest lines.
- Cost Per Certified Connector index: 54.5, using six connector-owned responsibilities against the pre-framework eleven-concern baseline of 100.
- Time To Certification index: 54.5 on the same responsibility basis; direct engineering hours were unavailable and were not fabricated.
- Workable deterministic certification duration: 0.45 ms for one fixture; this is a harness measurement, not engineering time or live latency.
- Breaking changes: 0.
- Shared architecture modifications: 0. One internal certification behavior was added for all incremental providers.
- Financial ROI: Unknown. Engineering leverage is evidenced by eleven shared gates and zero public framework API changes, not a fabricated currency value.

## Adding the next provider

1. Record the provider evaluation and reserved gates.
2. Declare a valid manifest.
3. Implement only locator validation and source-to-DiscoveryJob mapping; use the shared SDK or scaffold. Workable is the first certified proof of the six-hook scaffold.
4. Run `runProviderCertification` with deterministic public-contract fixtures.
5. Run `npm run certify:providers`.
6. Deploy only to isolated staging.
7. Observe the first run and a zero-change or explainable replay.
8. Record health, inventory, duplicate, freshness, and lifecycle evidence before production classification.
