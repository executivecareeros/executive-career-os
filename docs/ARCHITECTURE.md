# Executive Career OS Architecture

## Opportunity Intelligence Workspace

### Data model

`frontend/types/opportunity.ts` defines the strict domain contract, workflow statuses, priorities, work arrangements, filter state, sort options, and assessment output. Optional values model legitimately undisclosed information such as salary, deadline, source URL, or logo.

`frontend/data/opportunities.ts` is the single local data source. The overview, detail routes, and dashboard import the same collection. Every record is a demonstration scenario and the interface displays that limitation prominently.

### Domain logic

`frontend/lib/opportunity-filters.ts` contains pure filtering, sorting, and active-filter-count functions. These functions are independent of React and can later be replaced by query parameters or server-side repository calls.

`frontend/lib/opportunity-assessment.ts` contains the deterministic Opportunity Assessment. It evaluates Executive Fit, Strategic Opportunity, confidence, risk flags, and exclusions. It returns a recommendation plus human-readable reasons. It is intentionally not described as AI scoring.

### UI composition

Server routes load typed local data and pass it to focused client workspaces. Components under `frontend/components/opportunities` own presentation and temporary interaction state. Existing shell, header, button, card, empty-state, and metric primitives remain the visual foundation.

Dynamic detail pages use `generateStaticParams`, so each demo opportunity is generated at build time. Status and notes changes live only in React state and are never represented as persisted.

### Future integration points

- Replace `frontend/data/opportunities.ts` with an `OpportunityRepository` backed by a database.
- Translate `OpportunityFiltersState` and `OpportunitySort` into server query parameters.
- Replace the deterministic assessor behind the same typed assessment boundary if a reviewed scoring service is introduced.
- Persist status transitions and notes through explicit application commands.
- Replace the demonstration source placeholder with validated source metadata and controlled outbound URLs.

No future integration is implemented in Sprint 5.
