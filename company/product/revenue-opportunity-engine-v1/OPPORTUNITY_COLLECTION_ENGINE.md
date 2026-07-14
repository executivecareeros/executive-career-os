# Opportunity Collection Engine

> Purpose: Define the collection control plane that acquires public and executive-provided opportunity evidence without coupling Atlas to sources.

- **Authority:** ODS 1.0 Product track
- **Status:** Version 1 architecture complete
- **Date:** 14 July 2026
- **Scope:** Collection design and controls; no collectors, crawlers, providers, or infrastructure

## Product Outcome

An executive opens Orendalis and sees one current, attributable universe of potentially relevant roles and mandates. They can also bring in a confidential recruiter approach, URL, document, or manually known opportunity. The system explains coverage and never implies that its universe is complete.

## Architectural Boundary

The engine owns acquisition through normalized handoff:

`Source Registry → Eligibility Gate → Collection Run → Raw Observation → Validation → Normalization → Duplicate Cluster → Company Resolution → Opportunity Revision → Discovery Index`

Atlas begins only after normalization and indexing. A source cannot write directly to an executive assessment, Blueprint, Career Ledger, or recommendation.

## Core Capabilities

| Capability | Version | Purpose |
| --- | --- | --- |
| Source registry | NOW | Record source identity, access basis, terms status, method, owner, health, cadence, and rollback |
| Eligibility gate | NOW | Prevent collection without an approved technical and legal access basis |
| Manual, URL, PDF, and recruiter-message intake | NOW | Cover confidential and unsupported executive opportunities |
| Structured public employer-feed collectors | NOW | Establish meaningful automated coverage without general web crawling |
| Scheduled incremental collection | NOW | Refresh known sources with bounded cadence and backoff |
| Collection run history | NOW | Preserve start/end, source, records, errors, warnings, and version |
| Health and freshness | NOW | Show source availability, last success, staleness, and coverage limitations |
| Source expansion workflow | NEXT | Qualify additional ATS and career-site patterns through the same gate |
| Licensed job-board partnerships | NEXT | Add sources only after commercial and legal approval |
| Broad arbitrary-site collection | LATER | Consider only with proven revenue need, lawful basis, and operational controls |

## Source Eligibility Gate

Before a source can be enabled, its record must establish:

- source owner and canonical domain;
- method: public documented feed, authorized API, licensed feed, executive-provided artifact, or manual entry;
- permitted use and relevant terms review;
- authentication and requested permissions, if any;
- data categories collected and retention boundary;
- expected cadence, rate limits, and freshness;
- robots or site-policy considerations where applicable;
- source reliability and failure behavior;
- deletion, correction, and source-removal procedure;
- founder approval and review date.

Unknown eligibility means disabled. A technically reachable endpoint is not automatically an authorized source.

## Collection Modes

### Structured Feed

Collect published jobs from a documented employer job-board interface. Use employer or board identifiers, incremental timestamps where available, conditional requests, bounded pagination, and source-specific backoff.

### Executive-Controlled Import

Accept one opportunity through manual entry, a job URL, a PDF job description, or a recruiter message supplied by the executive. The executive confirms the normalized record before it becomes active. Raw source retention is explicit and minimal.

### Company Watchlist

Monitor only companies explicitly in the executive’s or Orendalis’s approved source registry. Prefer a documented ATS feed or structured career-site data. Do not silently crawl arbitrary domains.

### Licensed or Partner Source

Remain disabled until a signed access basis, permitted display/use, data handling, cost, and termination path are recorded.

## Scheduling

- **Manual:** executive-controlled imports and source tests.
- **Daily:** default for active public employer feeds in Version 1.
- **Hourly:** only for sources where freshness materially affects executive value and limits permit it.
- **Weekly:** low-change company watchlists.
- **Paused:** policy uncertainty, provider incident, error threshold, or founder stop.

Scheduling is source-specific. Failure never triggers aggressive retries. The previous accepted Opportunity revision remains visible with a staleness warning.

## Raw Observation Policy

A raw observation records original identifiers, URL, retrieval time, source response version or artifact metadata, content hash, and permitted retained evidence. It is immutable. Sensitive recruiter messages and uploaded documents receive the strongest access and retention boundary.

## Lifecycle

`Registered → Eligible → Enabled → Healthy | Degraded | Paused | Revoked → Historical`

Every transition records actor, reason, evidence, approval, and time. Revoking a source stops future collection; it does not erase already used decision evidence without a separate retention decision.

## Failure Modes

- source unavailable or rate limited;
- access terms or technical behavior changed;
- invalid or incomplete records;
- unexpected volume;
- malformed descriptions;
- stale or closed roles still published;
- company identity ambiguity;
- duplicate flood;
- credentials or permissions invalid;
- source requests deletion or suspension.

The engine fails source-locally. One source cannot block manual imports, search, or previously normalized opportunities.

## Trust and Revenue Measures

- active eligible sources;
- collection success and time since last success;
- published-to-normalized yield;
- unique opportunity yield after deduplication;
- executive-level opportunity yield;
- median source-to-Orendalis freshness;
- source corrections and false-open rate;
- opportunities surfaced, opened, saved, dismissed, and advanced;
- executive-reported relevance and trust;
- cost and operating time per active executive.

Volume alone is not success. A smaller universe that consistently surfaces credible executive opportunities is commercially stronger than a large, noisy inventory.
