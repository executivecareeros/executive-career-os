# Founder Product Learning Sprint — 2026-07-18

## Executive Outcome

ORENDALIS now has an internal, first-party product-learning capability designed for a controlled executive beta. It measures authenticated activation, feature use, session duration, return behavior, device and browser mix, and voluntarily confirmed profile segments. It does not expose raw activity or collect age, gender, exact location, IP address, email, CV content, or private Atlas conversations.

## Scope and Authority

Governing authority: ODS 4.0, Founder Backlog, and the Founder-approved Real Users directive. No external analytics provider, advertising tracker, fingerprinting, infrastructure vendor, or paid service was introduced.

## Security and Privacy

- Event writes require an authenticated active Workspace membership.
- The event table grants no direct access to authenticated or anonymous roles.
- Aggregate reads require the immutable founder-bootstrap identity in the database and the application-level configured Founder email plus Owner role.
- Raw user records, identities, query strings, and sensitive content are never returned by the Founder aggregate.
- Confirmed career/geography dimensions are included only when the executive explicitly provided or confirmed them; missing values remain absent/Unknown.

## Product Capability

- Founder Control Center links to Real Executive Product Learning.
- The dashboard reports executives, sessions, returning executives, average engagement, funnel stages, feature use, device mix, browser mix, and safe confirmed profile segments.
- The authenticated application records bounded page and engagement events without third-party scripts.
- Replayed event IDs are idempotent.

## Validation

- TypeScript: PASS
- ESLint: PASS
- Production build: PASS
- Product-learning privacy/access contract test: PASS
- Migration execution and live Founder/non-Founder authorization: pending controlled application

## Decision

Implementation is complete locally. Activation remains gated on applying the migration and validating the live Founder-only boundary before real design partners are invited.

## Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Real executive product learning (FB-040) | In Progress | 70% | Critical | Apply migration and validate Founder-only live aggregates |
| Founder Control Center (FB-034) | In Progress | 60% | High | Connect live aggregate product-learning source |
| Security and privacy (FB-031) | In Progress | 85% | Critical | Validate database authorization with Founder and non-Founder sessions |
| Daily executive dashboard (FB-006) | Founder Review Required | 82% | Critical | Measure real return behavior after controlled-beta activation |
| Public launch readiness (FB-035) | In Progress | 60% | Critical | Complete privacy/legal and real-user acceptance gates |
