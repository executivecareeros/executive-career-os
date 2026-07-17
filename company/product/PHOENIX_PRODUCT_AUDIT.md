# Project Phoenix Product Audit

**Date:** 2026-07-17  
**Authority:** ODS 2.0 / Founder Project Phoenix mission  
**State:** Active permanent product memory

## Current universe

- The production application combines a live Supabase workspace path with older local demonstration surfaces.
- Home, Workspace, CV import, Opportunity Universe, Companies, and collected decisions have live paths.
- Applications and Atlas previously rendered fictional local records even in live mode. Project Phoenix removed those records from live mode and replaced them with workspace evidence or truthful empty states.
- Compensation, Knowledge, and several secondary workspaces still use clearly labelled demonstration data. They must not be presented as live executive intelligence.

## Canonical executive state

- Confirmed professional experiences are the durable career facts used by Atlas.
- Completed document-import sessions provide CV provenance. Because one confirmed role currently creates one session, sessions sharing filename and completion minute are treated as one CV version in the product view.
- The original uploaded CV file is intentionally not retained. The product must never imply that the raw file can be downloaded.
- The active profile, role count, Atlas readiness, provenance, and last update must be visible consistently on Home and Workspace.

## Current highest risks

1. **P0 — Remaining demo/live ambiguity:** secondary live navigation can still reach demonstration-only Compensation and Knowledge surfaces.
2. **P0 — Import lifecycle granularity:** one upload still persists multiple import sessions internally; the UI now canonicalizes them, but the persistence model should eventually represent one upload as one version with multiple extracted records.
3. **P1 — Atlas completeness:** live Atlas reflects confirmed workspace reasoning but does not yet provide a complete conversational executive-coach experience.
4. **P1 — Applications lifecycle:** Pursue is persisted and visible, but no external application submission or complete application-stage record exists. The product now states this truthfully.
5. **P1 — Navigation:** current navigation still exposes more destinations than an executive needs for the daily opportunity journey.

## Completed Phoenix cycle 1

- Added a canonical derived executive-profile state shared by Home and Workspace.
- Made the active CV-derived profile, confirmed role count, Atlas state, update history, and update actions visible.
- Removed the repeated instruction to upload a CV when saved career history exists.
- Removed fictional Applications and Atlas data from live mode.
- Added deterministic profile-state regression coverage.

## Evidence

- Profile-state regression: pass.
- CV import regression: pass.
- Beta workflow atomicity and replay regression: pass.
- TypeScript: pass.
- ESLint: pass.
- Production build: pass.

## Next executable task

Remove or convert the remaining demonstration-only live destinations, beginning with Compensation, so authenticated executives never mistake fictional data for their own records.
