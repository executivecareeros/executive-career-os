# Engineering Protocol

> Purpose: Define how Orendalis software changes are designed, implemented, reviewed, validated, and preserved.

## Before Implementation

- inspect the repository, current branch, working tree, guidance, architecture, tests, and recent history;
- identify affected boundaries, data, routes, users, providers, and rollback;
- confirm whether an ADR, threat review, migration plan, or founder gate is required;
- preserve unrelated and uncommitted work.

## Design Rules

- Prefer existing architecture, domain contracts, components, and naming.
- Maintain provider independence and explicit boundaries.
- Keep business logic separate from infrastructure and presentation.
- Use strong types and deterministic behavior where applicable.
- Avoid duplication, hidden coupling, and premature abstraction.
- Treat authentication, authorization, append-only history, tenant isolation, and auditability as invariants.
- Add external packages only with justified need, license review, security review, and approval where material.

## Implementation Rules

- Make the smallest coherent change.
- Never weaken validation, RLS, authorization, audit, or error handling to make a test pass.
- Do not introduce fake business data into live workspaces.
- Handle empty, loading, error, retry, and responsive states.
- Keep secrets out of code, logs, fixtures, commits, and screenshots.
- Comment intent or non-obvious constraints, not self-evident syntax.

## Database and Migration Rules

Migrations are ordered, immutable after application, reviewable, and safe to replay in the intended sequence. Every material migration defines preconditions, transaction behavior, data impact, RLS and privilege effects, validation, failure handling, and rollback or forward-repair strategy. Seed and migration execution are separate actions.

## Source Control

- One coherent purpose per commit.
- Review the diff and validation before commit.
- Use descriptive approved messages.
- Never force-push or rewrite shared history without explicit exceptional approval.
- Do not commit generated clutter, operating-system files, credentials, or unrelated work.
- A clean working tree means no uncommitted change; it does not prove the branch is synchronized.

## Review

Review correctness, scope, security, privacy, data integrity, accessibility, performance, maintainability, failure behavior, rollback, tests, and documentation. High-risk changes require independent challenge where possible.

## Engineering Completion

Compilation, lint, targeted tests, regression tests, build, security checks, migration checks, and browser validation are selected proportionately. Report commands, results, skipped checks, and reasons.
