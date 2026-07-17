# Revenue Opportunity Collection Engine — Version 1

> Purpose: Define the revenue-focused product architecture that makes Orendalis the single trusted place an executive visits to discover relevant public and directly received opportunities.

- **Track:** Product
- **Authority:** ODS 2.0 Product track and permanent Executive Opportunity Universe Directive
- **Accountable owner:** Founder / Product
- **Status:** Implemented foundation with incremental provider and intelligence expansion active
- **Objective:** Increase the probability of acquiring the first paying executive
- **Non-goals:** prediction, AI crawling, application automation, provider integration, infrastructure change, or public launch

## Product Principle

Executives should no longer spend hours visiting fragmented job boards, applicant-tracking platforms, and company career sites. Orendalis should assemble a defensible executive opportunity universe. Atlas then filters, prioritizes, challenges, and explains.

**Discovery is the default. Search remains available.**

## Package

| Record | Purpose |
| --- | --- |
| `OPPORTUNITY_COLLECTION_ENGINE.md` | Collection architecture, source policy, scheduling, health, and operating boundaries |
| `OPPORTUNITY_NORMALIZATION_AND_OBJECT.md` | Normalization pipeline and canonical Opportunity object |
| `DUPLICATE_AND_COMPANY_INTELLIGENCE.md` | Duplicate clustering, provenance preservation, and bounded company enrichment |
| `DISCOVERY_SEARCH_AND_ATLAS.md` | Discovery, search, Blueprint matching, and Atlas recommendation flow |
| `SOURCE_PORTFOLIO.md` | NOW/NEXT/LATER classification for every requested source |
| `REVENUE_ROADMAP.md` | Smallest sequence that supports the first paying executive |
| `EXECUTIVE_OPPORTUNITY_INTELLIGENCE_PHASE_1.md` | Deterministic intelligence view for every collected canonical Opportunity |
| `GLOBAL_OPPORTUNITY_INTELLIGENCE_NETWORK_ROADMAP.md` | Five-phase roadmap from the existing Coverage Engine to a trusted global opportunity graph |
| `DURABLE_INGESTION_OPERATIONS.md` | Persistent scheduling, queue, run-history, capacity, activation, and rollback controls |

## Decision

Version 1 will not promise universal coverage. It will deliver a trustworthy, multi-source opportunity universe from sources Orendalis is permitted and technically able to collect, supplemented by executive-controlled imports. Coverage, freshness, provenance, and unsupported sources remain visible.

Compliant provider expansion proceeds under the standing ODS delegation. Paid licensing, contractual acceptance, provider-term acceptance, legal uncertainty, material personal-data or cost changes, fundamental architecture changes, and commercial commitments remain explicit Founder Approval Gates.
