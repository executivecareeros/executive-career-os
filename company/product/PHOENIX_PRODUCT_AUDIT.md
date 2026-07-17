# Project Phoenix Product Audit

**Date:** 2026-07-17  
**Authority:** ODS 2.0 / Founder Project Phoenix mission  
**State:** Active permanent product memory

## Current universe

- The production application combines a live Supabase workspace path with older local demonstration surfaces.
- Home, Workspace, CV import, Opportunity Universe, Companies, and collected decisions have live paths.
- Applications and Atlas previously rendered fictional local records even in live mode. Project Phoenix removed those records from live mode and replaced them with workspace evidence or truthful empty states.
- Compensation now reads only workspace-scoped append-only records. Knowledge and secondary demonstration workspaces remain production-isolated behind truthful live boundaries and are not presented as executive intelligence.

## Canonical executive state

- Confirmed professional experiences are the durable career facts used by Atlas.
- Completed document-import sessions provide CV provenance. Because one confirmed role currently creates one session, sessions sharing filename and completion minute are treated as one CV version in the product view.
- The original uploaded CV file is intentionally not retained. The product must never imply that the raw file can be downloaded.
- The active profile, role count, Atlas readiness, provenance, and last update must be visible consistently on Home and Workspace.

## Current highest risks

1. **P1 — Import lifecycle granularity:** one upload still persists multiple import sessions internally; the canonical profile view groups them into one visible CV version. A future persistence migration should represent one upload as one version with multiple extracted records.
2. **P1 — Atlas completeness:** live Atlas reflects confirmed workspace reasoning and evidence but is not yet a complete conversational executive-coach experience.
3. **P1 — Applications lifecycle:** real application records, activities, documents, and compensation are now visible when they exist. Pursue remains correctly distinguished from an employer application.
4. **P2 — Navigation breadth:** production-isolated secondary destinations remain reachable through explicit truthful boundaries; ongoing Luna work should simplify them as usage evidence becomes available.

## Completed Phoenix cycle 1

- Added a canonical derived executive-profile state shared by Home and Workspace.
- Made the active CV-derived profile, confirmed role count, Atlas state, update history, and update actions visible.
- Removed the repeated instruction to upload a CV when saved career history exists.
- Removed fictional Applications and Atlas data from live mode.
- Added deterministic profile-state regression coverage.

## Completed Phoenix cycle 2

- Removed the proxy rule that silently replaced live Workspace, Atlas, Blueprint, and Applications pages with generic module boundaries.
- Made live Supabase opportunity detail take precedence over every local fixture.
- Converted Compensation to authenticated, append-only workspace records with explicit unknown and normalization states.
- Converted Applications to real workspace records with activities, documents, compensation counts, and truthful Pursue semantics.
- Added a searchable, filterable, paginated live Company directory with evidence confidence, executive relevance, hiring activity, and opportunity links.
- Added live Company briefings built only from current opportunity evidence.
- Added salary, currency, eligibility, confidence, freshness, source-verification date, and role-specific actions to opportunity cards.
- Added deterministic live-product-truth regression coverage.

## Evidence

- Profile-state regression: pass.
- CV import regression: pass.
- Beta workflow atomicity and replay regression: pass.
- TypeScript: pass.
- ESLint: pass.
- Production build: pass.
- Live-product-truth regression: pass.
- Opportunity Coverage Engine: pass.
- Scheduler security and durability: pass.
- Geographic confidence ranking: pass.
- LinkedIn bridge provenance, deduplication, SSRF, and workspace isolation: pass.

## Next executable task

Luna should expand lawful provider coverage and complete real authenticated browser acceptance while preserving the release-candidate truth and isolation contracts.
