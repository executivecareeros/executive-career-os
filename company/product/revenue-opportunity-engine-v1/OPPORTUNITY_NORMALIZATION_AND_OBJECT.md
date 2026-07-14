# Opportunity Normalization and Object

> Purpose: Define how heterogeneous job and mandate evidence becomes one canonical, explainable Opportunity without erasing source truth.

- **Authority:** ODS 1.0 Product track
- **Status:** Version 1 architecture complete
- **Date:** 14 July 2026
- **Scope:** Canonical object and deterministic normalization design; no implementation

## Normalization Pipeline

1. **Accept:** receive an eligible raw observation or executive-provided artifact.
2. **Validate:** check required source identity, URL or artifact, timestamps, and basic structure.
3. **Extract:** map explicit fields and retain unparsed text separately.
4. **Sanitize:** normalize encoding and safe text while preserving the original evidence reference.
5. **Standardize:** represent dates, locations, employment type, work arrangement, compensation units, and language consistently.
6. **Resolve company:** link to a canonical Company candidate with confidence and ambiguity visible.
7. **Classify role:** assign only supported function, seniority, and opportunity type; unknown remains unknown.
8. **Normalize compensation:** preserve original currency, interval, range, and source; no silent conversion.
9. **Detect duplicates:** attach the observation to an existing cluster or create a new candidate.
10. **Validate provenance:** ensure every material field can identify its contributing source.
11. **Create revision:** append the normalized state and changes.
12. **Index:** expose only the accepted revision to Discovery and Search.

No generative inference is required. Extraction that cannot meet a deterministic or executive-confirmed threshold remains `Unparsed` or `Unknown`.

## Canonical Opportunity Object

### Identity

- stable Opportunity identity;
- lifecycle status and revision;
- opportunity type: employed role, board role, advisory mandate, operating partnership, succession path, or unknown;
- first observed, last observed, last changed, and closure evidence.

### Role

- original title and normalized title family;
- function and supported executive level;
- mandate summary and responsibilities;
- team, reporting line, decision authority, board exposure, and scope;
- employment type and expected duration.

### Company

- canonical Company reference;
- source company name;
- business unit or legal entity;
- industry, ownership, company size, headquarters, and operating geographies when evidenced.

### Location and Work Model

- source location text;
- structured country, region, and city candidates;
- remote, hybrid, on-site, or unknown;
- relocation and travel evidence;
- language requirements.

### Compensation

- original amount or range;
- currency and interval;
- base, bonus, equity, benefits, and total-package evidence kept distinct;
- advertised, recruiter-stated, estimated, negotiated, or unknown evidence class;
- conversion reference only when explicitly requested and timestamped.

### Access and Process

- original and canonical URLs;
- source and connector identity;
- original posting identifier;
- recruiter, introducer, or confidential-source reference under restricted access;
- application or conversation stage;
- published, updated, closing, and last-verified dates.

### Evidence and Intelligence

- field-level provenance;
- known facts, claims, assumptions, unknowns, and contradictions;
- source reliability and opportunity confidence;
- duplicate-cluster membership;
- Blueprint assessment references;
- Atlas recommendation and decision snapshots;
- Career Ledger and outcome references.

## Field Authority

When sources disagree, the object does not silently choose the most convenient value. It retains variants and applies a visible precedence policy:

1. executive-confirmed direct evidence;
2. current official employer source;
3. current authorized ATS publication;
4. licensed job-board record;
5. recruiter-provided claim;
6. other public listing;
7. derived or normalized candidate.

Precedence affects display, not historical deletion. Freshness and contradictions can override a nominally higher source only through an explained revision.

## Confidence

Opportunity confidence is decomposed into:

- existence confidence;
- field accuracy confidence;
- freshness confidence;
- company-resolution confidence;
- executive-level classification confidence;
- completeness for Blueprint assessment.

The object never presents a single confidence number as proof of fit.

## Lifecycle

`Observed → Normalized → Active → Changed | Stale | Closed | Withdrawn → Archived`

An Opportunity may be closed at one source and active at another. Closure requires source-specific evidence, and the canonical state explains how it was reached.

## Version Classification

| Capability | Version |
| --- | --- |
| Canonical object, provenance, revisions, unknowns, and field authority | NOW |
| Deterministic location, work-model, seniority, and compensation normalization | NOW |
| Executive confirmation for imported artifacts | NOW |
| Multi-language normalization beyond source language | NEXT |
| Market-derived compensation or role inference | LATER |
| Generative extraction from arbitrary unstructured pages | LATER |
