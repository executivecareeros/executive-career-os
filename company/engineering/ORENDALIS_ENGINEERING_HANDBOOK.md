# ORENDALIS Engineering Handbook

Version: 1.0  
Status: Release-candidate constitution  
Authority: ODS 2.0 and Founder directives

## Vision

ORENDALIS is a private executive career intelligence platform. It preserves an executive’s confirmed career memory, maintains a truthful global opportunity universe, and helps Atlas explain which decisions deserve attention. The product optimizes for executive trust, useful opportunity coverage, decision quality, activation, and retention.

## Architecture

- Next.js provides the public and authenticated product surfaces.
- Supabase Auth and workspace-scoped PostgreSQL records provide identity, persistence, and row-level isolation.
- The Executive Opportunity Coverage Engine accepts provider observations through common registration, normalization, canonicalization, provenance, freshness, lifecycle, retry, health, and quality contracts.
- Vercel hosts the application and the authenticated scheduler endpoint. Scheduled ingestion is isolated from user traffic and uses a server-only secret.
- Atlas consumes canonical executive profile, Blueprint, opportunity, decision, and evidence state. It does not own a parallel profile or opportunity store.

Architecture changes require Sol review. Ordinary implementation inside these contracts belongs to Luna.

## Product Principles

1. Tell the truth before filling the screen.
2. Never show fixtures, demonstrations, or inferred activity in production.
3. Never ask for information already known by the canonical profile.
4. Discovery comes first; familiar search remains available.
5. One opportunity is shown once even when many sources observe it.
6. Every executive action produces visible, durable feedback.
7. Unknown is preferable to an unsupported claim.

## Data Principles

- Workspace identity is mandatory for every private query and mutation.
- One canonical executive profile is derived from confirmed CV versions and professional-history evidence.
- Raw CV files are not retained unless a separately approved retention policy exists.
- Preserve original source values, currency, timestamps, and provenance.
- Append-only decisions, ledger, compensation, provenance, reasoning, and lifecycle evidence are never rewritten to simplify a UI.
- Archive records rather than destroying executive history.
- Require idempotency and deterministic duplicate control at ingestion and save boundaries.

## Design Principles

- English is the sole enabled production language; localization architecture remains dormant and configurable.
- ORENDALIS is a protected brand string and never passes through locale-sensitive casing.
- Use shared visual tokens and interaction components before page-specific styles.
- Primary actions are legible in default, hover, focus, active, disabled, and loading states.
- Pages retain a clear location, next action, evidence boundary, and truthful empty state at desktop and 390px.
- Keyboard access, visible focus, semantic labels, readable contrast, and reduced cognitive load are release requirements.

## Coding Standards

- Prefer small typed modules with explicit input and output contracts.
- Keep server credentials and privileged operations server-only.
- Use common repositories and provider interfaces; do not create provider-specific architecture.
- Validate external URLs, enforce SSRF boundaries, and preserve source attribution.
- Do not silently replace data-access failures with empty data.
- Add a deterministic regression test for every verified defect.
- Avoid unrelated refactors during fixes and release hardening.

## Release Process

1. Establish factual state, scope, authority, approval gates, stop conditions, and definition of done.
2. Implement the smallest complete change.
3. Run focused tests, TypeScript, lint, production build, security checks, and secret scan.
4. Commit intentionally, push, and verify the exact commit deployed.
5. Validate the real authenticated executive journey at desktop and 390px.
6. Inspect runtime evidence and record risk without optimism.
7. Roll back when user trust, isolation, authentication, or persistence is uncertain.

## Testing Philosophy

Tests prove contracts, not customer trust. Every release needs engineering validation and a real executive journey. Critical paths cover registration, authentication, CV extraction/editing, repeat-save idempotency, canonical profile state, ranked opportunities, company and opportunity navigation, Atlas evidence, decisions, applications, compensation, refresh, logout/login persistence, workspace isolation, mobile, accessibility, and runtime errors.

## Provider Framework

Every provider plugs into the Coverage Engine and implements registration, priority, scheduling, normalization, source attribution, canonical identity, duplicate detection, freshness, lifecycle, retry, health, and quality metrics. Use public or authorized data only. Paid licensing, contracts, uncertain terms, material personal-data changes, or material infrastructure cost require Founder approval.

## Opportunity Lifecycle

Canonical opportunities progress through Open, Updated, Closing Candidate, Closed, and Archived evidence. A later observation may update current state but must not delete provenance or executive decisions. Closing is evidence-led, not inferred from silence. Atlas reasons about one canonical opportunity and its complete history.

## Atlas Principles

- Distinguish Confirmed, Estimated, and Unknown.
- Cite evidence, expose confidence, explain fit and concern, and recommend a next action.
- Hard eligibility overrides attractive professional fit.
- Never fabricate employer facts, work authorization, compensation, application activity, or certainty.
- Use the canonical profile and never request another CV when a confirmed profile exists.

## Executive Profile Principles

The profile supports one active CV, version history, replacement, update, archive, profile confidence, confirmed professional history, and Atlas knowledge. Every screen reads the same derived state. Unknown fields remain blank. Imported facts remain editable, and repeat imports or saves must not duplicate roles.

## Security Principles

- Enforce least privilege, MFA, environment separation, secret ownership, secure OAuth, and no shared credentials.
- Require both RLS and workspace filters as defense layers.
- Never expose service-role keys, SMTP credentials, scheduler secrets, tokens, or private IDs.
- Payment, legal acceptance, identity, credentials, destructive data impact, or irreversible external state stops at a Founder gate.
- Follow operational severity and incident runbooks for security incidents.

## Definition of Done

A change is done only when scope is complete, factual data is preserved, regression tests exist, TypeScript/lint/build pass, security and isolation are checked, desktop and mobile journeys pass, deployment matches the intended commit, runtime evidence is clean, documentation is current where facts changed, and the repository is clean.

## Luna Escalation Rules

Luna owns routine UI, UX, frontend, backend, features, mobile, provider adapters, employer expansion, GOCI improvement, accessibility, performance, deployments, defects, and product evolution inside established contracts. Escalate to Sol only for architecture, provider-framework contracts, search architecture, Atlas architecture, RLS/security boundaries, scaling, AI orchestration, infrastructure design, or production-critical incidents whose safe repair changes those foundations.
