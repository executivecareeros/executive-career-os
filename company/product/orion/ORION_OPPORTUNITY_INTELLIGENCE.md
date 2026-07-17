# Orion Opportunity Intelligence

## Current implementation

The canonical contract is `frontend/types/opportunity.ts`. Provider observations flow through `frontend/lib/discovery/pipeline.ts`, normalize in `normalizer.ts`, deduplicate and merge in `lib/opportunity-universe.ts`, and persist through `supabase-ingestion.ts`. Durable schedules/jobs/runs are migration `202607170002`; concurrency is `202607170003`; authenticated scheduler claim is `202607170004`; route is `app/api/operations/opportunity-refresh/route.ts`.

Current records support source and normalized titles, company identity, location/country, arrangement, employment type, sources/provenance, first/last observation, freshness, lifecycle, confidence/completeness, salary when supplied, skills, explanations, risks, and executive decision state. `app/opportunities/[id]/page.tsx` and collected-decision migration `202607140002` provide the decision loop and immutable reasoning snapshot.

## Truth contract

Every important field must be represented as observed fact, labeled inference, or Unknown, with source, confidence, and verification time where available. Atlas may summarize evidence but may not convert an inference into fact.

## Lifecycle

The long-term lifecycle is discovered → active → uncertain → stale → closed → archived, with superseded and duplicate relations. The present product status enum remains stable while source status, freshness, `closedAt`, `closureReason`, and lifecycle events carry network truth. Closed records remain historical and cannot appear active. A future schema change must reconcile product decision statuses with network lifecycle rather than overload one column.

## M1–M4 roadmap

- M1: validated canonical inventory, executive-title classification, source identity, freshness, duplicate rate, geographic reporting.
- M2: structured seniority/function/department, compensation, language/travel/relocation/visa fields, confidence components, related opportunities, useful evidence-led detail pages.
- M3: mature deduplication, structured and semantic search, explainable recommendation quality, historical opportunity graph.
- M4: global active/historical knowledge system, market signals, API-ready contracts, measurable recommendation outcomes.

## Atlas and search

Atlas consumes canonical evidence and must explain recommendation, non-recommendation, missing qualifications, seniority, geography, industry, company, compensation, progression, gaps, confidence, and uncertainty. Search first uses structured fields and observable ranking, then adds semantic retrieval without hiding deterministic filters or provenance.

## Current gaps

Employment type, work arrangement, compensation, industry, application URL validity, closure accuracy, and executive classification require measured completeness. Recommendation confidence is not yet a separately persisted network metric. Lifecycle vocabulary is partial. These are M1/M2 gaps, not grounds to fabricate data.
