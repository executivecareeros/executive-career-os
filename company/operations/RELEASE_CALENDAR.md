# Founder Release Calendar

> Purpose: Establish a predictable release rhythm with explicit freeze, staging, production, observation, and hotfix gates.

## Standard Release Cycle

| Relative day | Stage | Founder action and evidence |
| --- | --- | --- |
| Day -7 | Scope lock | Confirm objective, owner, risks, migrations, privacy/security impact, and acceptance criteria. |
| Day -5 | Feature freeze | Stop feature work. Accept only release-blocking corrections with regression evidence. |
| Day -4 | Release candidate | Create the clean candidate commit; complete CI, build, secret scan, and release notes. |
| Day -3 | Staging deployment | Follow the staging runbook after approval; record deployment and schema identifiers. |
| Day -3 to -2 | Staging acceptance | Complete fictional journey, security checks, logs, backup/rollback rehearsal, and defect decision. |
| Day -1 | Go/no-go | Review issues, provider health, support, communication, rollback, and release window. |
| Day 0 | Production | Follow the production runbook only after separate approval. Keep private-beta exposure unchanged. |
| Day +1 | Observation | Review authentication, errors, database health, email/support, feedback, and cost/usage. |
| Day +3 | Post-release review | Record outcomes, defects, incidents, metrics, gaps, and follow-up owners. |

Dates are selected by the founder for each release. Do not schedule production change during known provider maintenance, founder unavailability, or without a recovery window.

## Release Candidate Rules

- One immutable commit and migration set.
- Clean working tree and passing CI.
- No unreviewed scope expansion after freeze.
- A blocker fix creates a new candidate and repeats affected validation.
- Staging acceptance never promotes staging data, keys, or callbacks.

## Hotfix Procedure

1. Declare incident severity and decide whether rollback is safer.
2. Create the smallest correction from the production release base.
3. Require review, targeted regression, security/privacy check, and production build.
4. Test in staging when impact permits; skipping staging requires emergency authority and retrospective review.
5. Deploy under the production runbook and begin heightened observation.
6. Reconcile the hotfix into normal development.
7. Complete a postmortem when Severity 1/2, staging was skipped, or rollback occurred.

## Current State

This calendar is prepared but has not been exercised against live staging or production. No release date is approved by this document.
