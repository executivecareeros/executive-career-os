# Duplicate Detection and Company Intelligence

> Purpose: Define how Orendalis creates one executive opportunity view from repeated listings while adding only defensible company context.

- **Authority:** ODS 1.0 Product track
- **Status:** Version 1 architecture complete
- **Date:** 14 July 2026
- **Scope:** Duplicate resolution and bounded company enrichment; no provider integration

## Duplicate Detection

Duplicate detection creates clusters; it does not delete source observations.

### Match Layers

1. **Exact source identity:** same source and original posting identifier.
2. **Canonical URL:** equivalent normalized destination or employer application URL.
3. **ATS identity:** same employer board, requisition, or posting identity across syndication.
4. **Content fingerprint:** stable normalized title, company, location, and description fingerprint.
5. **Composite candidate:** company, title family, location/work model, mandate similarity, and publication window.
6. **Executive review:** ambiguous confidential or materially different variants require confirmation.

### Cluster Decisions

- `Same Posting` — source variants represent the same opening.
- `Likely Same` — cluster for review; do not hide variants.
- `Related Roles` — similar mandate but distinct requisitions.
- `Repost` — later publication of a previously closed or expired role.
- `Distinct` — remain separate.

### Canonical Display

The executive sees one Opportunity with:

- the preferred current source;
- all contributing sources;
- source count and last-seen time;
- material differences in title, location, terms, or description;
- closure or freshness conflicts;
- the ability to inspect provenance.

### Safety

False merges are more damaging than visible duplicates because they can erase meaningful differences. Ambiguous clusters default to separate or review. Split and merge actions are audited and reversible.

## Company Resolution

Company resolution is distinct from enrichment. It establishes whether source names refer to the same organization, subsidiary, brand, or business unit.

Signals include official domain, ATS board identity, legal or source name, career-site domain, known aliases, headquarters, and executive confirmation. A brand and parent company may be linked without being collapsed.

## Version 1 Company Enrichment

| Context | Version | Boundary |
| --- | --- | --- |
| Official name, domain, career page, ATS board, and source aliases | NOW | Directly evidenced |
| Industry, ownership, size band, headquarters, and operating geography | NOW when official or executive-confirmed; otherwise unknown | No commercial enrichment dependency required |
| Current linked opportunities and collection freshness | NOW | Derived from Orendalis collection evidence |
| Executive-entered notes and known relationships | NOW | Private, Workspace-scoped, and purpose-limited |
| Official company-description and leadership-page references | NEXT | Only from approved sources and with freshness |
| Funding, financial, leadership-change, risk, and market signals | NEXT | Separate Company Intelligence evidence policy |
| Third-party reputation scoring or opaque company ratings | LATER | Requires product evidence, licensing, and explainability review |

## Enrichment Output

Company enrichment supplies a bounded briefing:

- what the company is and how confidently it was resolved;
- why it is connected to the opportunity;
- current official facts available to Orendalis;
- relevant opportunities and changes;
- what remains unknown;
- source freshness and contradictions.

It does not fabricate culture, strategy, financial health, manager quality, or executive fit.

## Revenue Value

Deduplication reduces noise and restores time to the executive. Company resolution prevents fragmented opportunity histories. Bounded enrichment makes the opportunity immediately more decision-ready without requiring speculative data products before the first customer.
