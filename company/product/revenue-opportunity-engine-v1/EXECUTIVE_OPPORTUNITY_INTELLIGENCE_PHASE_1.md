# Executive Opportunity Intelligence Layer — Phase 1

## Status

- **Implemented:** 14 July 2026
- **Authority:** ODS 2.0 Product track
- **Scope:** Deterministic intelligence derived at read time from the canonical Opportunity, its source observations, and the active Executive Blueprint
- **Schema change:** None
- **External provider or infrastructure change:** None

## Executive Outcome

Every collected canonical Opportunity now has an internal intelligence view. The executive can see why the role was surfaced, which Blueprint dimensions align or conflict, what evidence supports the view, what remains unknown, how fresh the evidence is, and which related opportunities are supported by the current universe.

## Deterministic Contract

The intelligence projection provides:

- Blueprint compatibility across comparable industry, geography, and compensation dimensions;
- Atlas confidence derived from source confidence, record completeness, and comparison coverage;
- evidence classified as Confirmed, Estimated, or Unknown;
- strengths, concerns, missing information, and next-step guidance;
- source provenance and freshness;
- canonical lifecycle history;
- related opportunities, similar companies, and similar roles derived from normalized overlap.

The projection does not create facts, call an AI provider, infer private company information, convert currencies without evidence, or turn missing fields into positive signals. A compatibility score remains pending when no Blueprint dimension can be compared.

## Experience

Collected Opportunity cards now open the private intelligence detail through the existing Opportunity route. The detail keeps the original employer evidence available, labels uncertainty, and retains the Opportunity Universe as the executive's navigation context.

## Validation

- deterministic intelligence tests cover aligned, conflicting, and evidence-poor opportunities;
- Confirmed, Estimated, and Unknown evidence states are asserted;
- provenance, freshness, history, relationships, similar companies, and similar roles are asserted;
- Opportunity Universe, ingestion, and Coverage Engine regressions pass;
- lint, TypeScript, and production build pass.

## Remaining Limits

- Phase 1 computes intelligence on read; it does not persist a new reasoning snapshot.
- Relatedness is deterministic normalized overlap, not semantic or predictive similarity.
- Company intelligence remains limited to facts already present in the canonical Opportunity.
- A collected Opportunity cannot yet enter the existing Pursue, Watch, or Skip decision workflow without an approved workflow extension.
