# Company Intelligence Specification

> Companies are durable, canonical, reusable intelligence assets. Opportunities are temporary observations linked to them.

## Canonical company contract

Identity and canonical name; verified website/careers page; headquarters/countries; industry; products/services; markets; useful overview; hiring activity/counts/trends; confidence; provenance; freshness; evidence; history; completeness; relationships; health.

Every material fact uses the Trust contract: source, confidence, freshness, evidence, verification state, observed/updated timestamps, history and conflict status. Unknown remains Unknown.

## Source precedence

1. Official structured data and Schema.org.
2. Official company/career pages and OpenGraph.
3. Verified ATS/provider metadata.
4. Other approved evidence with explicit provenance.
5. AI only where deterministic methods cannot create equivalent measurable value.

Names, ATS slugs and opportunity prose alone do not prove an official domain, headquarters, product, culture, financial health or employer intent.

## Processing

Deterministic extract → normalize → validate source/identity → reconcile conflicts → fingerprint → cache reusable payload → persist evidence/history → independently refresh. Failure never blocks opportunity ingestion; the page shows verified partial intelligence and explicit Unknowns.

## Overview defect acceptance

“Company overview is not inferred” is a safety disclosure, not an acceptable repeated user experience when official evidence exists. The page must render a concise sourced overview when deterministic official content is available; otherwise it explains exactly which evidence is missing without filler.

## Performance and reuse

- One canonical payload reused by pages, Atlas, search, graph and Rooms.
- Targeted indexed reads; never load the global universe for one company.
- Fingerprint unchanged sources to avoid reprocessing.
- Record extraction latency, cache hit, completeness, age, failures and source yield.

## Acceptance criteria

- Identity collision and unsupported-domain tests pass.
- Every displayed fact has source/confidence/freshness and conflict behavior.
- Official overview extraction produces no unsupported claim.
- Cache/fingerprint invalidation and independent refresh pass.
- Company page p95 and data-read budget are established and met.
- Atlas can explain and compare company facts using the same canonical payload.
- Desktop/mobile/accessibility and Founder review pass.
