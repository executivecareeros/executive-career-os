# Atlas Everywhere Context Handoff Sprint — 2026-07-18

## Executive outcome

Authenticated executives can now reach Atlas without abandoning the page they are evaluating. Dashboard, Jobs, opportunity reviews, company intelligence, applications, the career profile and Executive Rooms each provide a bounded contextual Atlas entry point. The Atlas page visibly preserves that product context and provides an explicit return path.

## Product change

- Added one persistent, accessible Atlas control to the authenticated application shell.
- Added deterministic page-context contracts for seven executive contexts.
- Added three concise questions per context to help the executive frame the next decision.
- Added safe handoff state to the Atlas route without carrying private page content in the URL.
- Kept Atlas absent from public and authentication pages and avoided duplicate controls on the Atlas page itself.
- Preserved the existing Atlas reasoning, evidence, uncertainty and decision-history architecture.

## Trust boundary

The handoff transmits only a bounded context identifier such as `company` or `opportunity`. It does not transmit opportunity titles, company facts, CV content, room messages, application details or private reasoning in the query string. The displayed guidance is product navigation, not a generated recommendation.

## Validation

- Atlas Everywhere context contract: PASS.
- Atlas product integration: PASS — 100% reported coverage across persistence, review integration, workflow completion, decision continuity, recovery, timeline completeness and recommendation traceability.
- Atlas guidance-answer contract: PASS.
- ESLint: PASS.
- TypeScript: PASS through production build.
- Next.js production build: PASS — 133 routes generated.

## Remaining acceptance

An authenticated executive must validate the control on desktop and 390px mobile. Durable unified conversation/history remains the next Atlas product gap; the current handoff intentionally does not fabricate a chat session.

## Concurrent Opportunity Factory result

The scheduled Opportunity Factory continued during this product cycle. The latest observed run completed 3/3 jobs with no run failures, changed 247 records, and raised canonical inventory from 29,401 to 29,648. Current telemetry reports 397 active employers, 129 verified countries, 29,643 fresh opportunities and zero AI tokens. The next coverage-quality constraint is normalization of 972 unrecognized location labels; no user-profile preference influences network inventory.

## Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Atlas Everywhere (FB-011) | 🟡 In Progress | 55% | Critical | Validate contextual handoff on desktop/mobile, then connect durable conversation history |
| Personal Atlas (FB-010) | 🟡 In Progress | 76% | Critical | Unify conversation and decision history without losing evidence provenance |
| Atlas explainability (FB-012) | 🟠 Founder Review Required | 85% | Critical | Validate confidence and Unknown comprehension with an executive |
| Opportunity Intelligence (FB-019) | 🟠 Founder Review Required | 80% | Critical | Calibrate live opportunity explanations |
| Public launch readiness (FB-035) | 🟡 In Progress | 60% | Critical | Complete authenticated executive and recovery acceptance |
| Global employer expansion (FB-036) | 🟡 Scheduler Healthy | 92% | Critical | Normalize remaining location labels and continue measured source expansion |
