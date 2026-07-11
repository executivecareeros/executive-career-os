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

## Company Intelligence Workspace

`frontend/types/company.ts` defines company profiles, relationship and monitoring stages, priorities, filters, sorting, leadership summaries, signals, scores, and assessment output. `frontend/data/companies.ts` is the single fictional-company source. Company records reference Sprint 5 opportunities by ID; opportunity objects are never duplicated.

`frontend/lib/company-assessment.ts` implements transparent Company Assessment thresholds using quality, strategic relevance, hiring momentum, relationship strength, risks, and exclusions. `frontend/lib/company-filters.ts` contains pure filter, sort, and active-filter-count functions.

Overview and static detail routes pass typed records into focused client workspaces. Relationship, monitoring, priority, review date, and notes changes live only in React state. Future integration can replace the local company collection with a repository, translate filter state into server queries, add reviewed research providers behind an explicit source boundary, and persist company commands without changing presentational contracts.

No external research, live company claim, or future integration is implemented in Sprint 6.

## Applications CRM Workspace

`frontend/types/application.ts` defines applications, activity events, stages, outcomes, filters, and workflow references. Applications reference company and opportunity IDs only. Supporting document contracts live separately in `application-document.ts` with lightweight demo records.

Attention and health calculations are deterministic pure helpers. Date comparisons use the fixed demo date `2026-07-11`, preventing changing results across builds. Client state owns temporary stage, priority, scheduling, blocker, note, response, interview, outcome, withdrawal, and archive actions.

Future repositories can persist the same models; email, calendar, document, and automation adapters can append typed activities behind explicit service boundaries without redesigning the UI. None are implemented in Sprint 7.

## Executive Career Agent Foundation

`frontend/lib/agents` defines shared tasks, results, recommendations, memory, context, logs, lifecycle status, priorities, typed events, schedules, and notification-provider boundaries. Domain agents implement a common four-method contract. `CareerAgent` is the orchestration root and communicates through the event bus rather than importing domain-agent implementations.

Schedules describe hourly, daily, weekly, and manual intent but do not execute. Notification contracts reserve dashboard, email, Slack, and push delivery without providers. `frontend/prompts` is the sole prompt registry; its templates are draft architecture assets and are never sent to a model. The Assistant dashboard uses local mock observability data only.

## Historical integration and Atlas memory access

Applications contain optional `RecruitmentLifecycleDates`. Missing milestones remain absent. Pure helpers create ordered display events and observed durations without prediction, and populated milestones link to immutable Career Ledger entries.

`AgentContext` optionally receives an `AgentHistoryAccess` port. Future Atlas runs can retrieve entity, compensation, lifecycle, and decision history or append attributed ledger events. Context preserves run ID, agent ID, timestamp, confidence, evidence, correlation, and causation. No provider implements this port in Sprint 9.1.
# Sprint 11 Architecture Addendum

Executive Blueprint is the primary, revision-scoped personalization context. Deterministic completeness, conflict, opportunity, and company matching services remain separate from UI and Atlas. Product access is resolved through one typed feature registry and pure entitlement helpers; billing remains outside the platform boundary.
# Durable Provider Boundary

The repository layer now supports explicit `memory-demo` and configuration-dependent `supabase` modes. PostgreSQL schema, RLS, append-only triggers, and PostgREST adapters remain isolated from domain models. Authentication and production deployment are not implemented.
> Professional-history imports use provider-independent deterministic extraction, temporary review state, authenticated repositories, and Workspace RLS. See [PROFESSIONAL_HISTORY_IMPORT.md](./PROFESSIONAL_HISTORY_IMPORT.md).
