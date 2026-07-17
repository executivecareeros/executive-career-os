# Orion Employer Intelligence

## Current implementation

Canonical employers live in `public.companies`. Migration `202607170005_employer_intelligence_registry.sql` added canonical keys, aliases, official domains, careers URLs, ATS, confidence, and discovery/verification timestamps. `public.employer_source_observations` preserves provider identity, source URL, first/last seen, confidence, and payload. Migration `202607170006_remove_employer_digest_dependency.sql` protects employer identity during refresh. `SupabaseOpportunityIngestionSink.upsertEmployer()` is the only live ingestion entry point.

Company pages are `frontend/app/companies/page.tsx` and `frontend/app/companies/[id]/page.tsx`. They may show only live canonical evidence; demo statistics are prohibited.

## Target contract

Every employer may hold a canonical name, aliases, official domain, careers URL, provider/ATS evidence, logo, headquarters, countries/regions, industry/sub-industry, size, ownership, ticker, parent/subsidiary/brand relations, first discovery, last observation, last verification, last successful ingestion, confidence, freshness, and status. Missing evidence remains Unknown. Logos require an attributable, permitted source.

## Discovery sequence

Market → company discovery → official-domain verification → career-page detection → ATS detection → provider verification → canonical employer upsert → opportunity ingestion → continuous monitoring.

## Confidence and verification

“Verified employer” requires an official domain, `last_verified_at`, and identity confidence of at least 80. A provider account name alone is not verified. Conflicting names/domains create a review signal; they do not overwrite a higher-confidence identity.

## Roadmap

- M1: 100 verified employers, active-opportunity link, confidence/freshness metrics, deterministic collision handling.
- M2: 1,000 verified employers, useful live company pages, hiring locations/distributions/velocity from canonical history, relationships only with evidence.
- M3: 10,000 employers, mature timeline and relations, claim workflow, verified administration and corrections.
- M4: continuously refreshed global employer graph, partner/API boundaries, demand and trend intelligence.

## Claim governance

Claiming begins only after M2 acceptance. Domain and authorized-representative verification are mandatory. Claims add managed assertions and corrections with audit history; they cannot suppress public truth, erase provenance, manipulate ranking, or silently rewrite history. Employer publishing remains disabled until claim governance is stable and M3 readiness is established.

## Next implementation gap

The isolated network has one active canonical employer and zero employers meeting the strict verification rule. The next employer increment is an approved cohort registry with official-domain verification and collision review, not bulk synthetic enrichment.
