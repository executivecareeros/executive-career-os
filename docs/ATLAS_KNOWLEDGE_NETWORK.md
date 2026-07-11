# Atlas Knowledge Network

> **Purpose:** Define the deterministic architecture through which Atlas observes the executive market beyond an individual career record.

## Knowledge Architecture

The Knowledge Network separates providers, raw observations, evidence, normalized signals, relationships, assessments, timelines, snapshots, watchlists, and digests. Atlas receives versioned snapshots rather than provider-specific records. It observes supported facts and does not speculate.

## Signals and Lifecycle

Signals cover companies, executive search, recruiters, industries, technology, countries, economies, compensation, leadership, boards, markets, hiring, mergers, funding, expansion, layoffs, appointments, departures, policy, and regulation.

Lifecycle states are Observed, Verified, Updated, Superseded, Archived, Expired, and Dismissed. History records every transition so new evidence never silently erases an earlier observation.

## Providers

Provider contracts support corporate reports, company websites, executive search firms, recruiters, industry publications, market research, economic data, government, manual research, Atlas observations, and internal research. Sprint 13 providers are local stubs and make no external requests.

## Evidence and Relationships

Evidence retains source, weight, confidence, timestamp, reason code, and related entity. Typed relationships connect signals to companies, opportunities, applications, Blueprints, objectives, principles, industries, countries, compensation, Career Ledger entries, decision snapshots, and discovery runs. Relationship strength ranges from weak to direct.

## Confidence

Confidence is deterministic and exposes provider reliability, evidence quantity, freshness, verification state, relationship quality, conflict count, and missing information. The resulting score maps to Very Low, Low, Moderate, High, or Very High. Each factor remains visible.

## Timeline and History

Timelines organize lifecycle events by related entity. Signal history preserves updates, supersession, archival, expiry, and dismissal. Snapshots bind signals, assessments, relationships, watchlists, and ruleset versions at a point in time.

## Watchlists

Watchlists model companies, countries, industries, recruiters, executive search firms, technologies, compensation topics, and leadership topics. Subscriptions define only future manual, daily, or weekly cadence; nothing executes in this sprint.

## Digest and Executive Brief

The digest is structured data: what changed, why it matters, affected opportunities, companies, Blueprint objectives and principles, plus review codes. It contains no generated text and is preparation for a future Executive Brief.

## Atlas Integration

Atlas context can receive a Knowledge Snapshot, relevant signals, confidence, relationships, evidence, and digest. Decision logic remains deterministic and provider-independent. Knowledge evidence should be cited when it influences a later decision.

## Future Provider Boundary

Future authorized providers may supply observations through typed adapters. They must not bypass normalization, evidence requirements, lifecycle history, confidence rules, or source attribution.

## Demonstration Limitations

All Sprint 13 records are fictional demonstration data. There are no APIs, feeds, search engines, scraping, browser automation, AI providers, databases, or background subscriptions.
