# Launch-Critical Opportunity Intelligence Completion

Status: Implementation complete locally; staging acceptance pending deployment.

## Scope completed

- Collected canonical opportunities support reversible Pursue, Watch, and Skip selection.
- Finalization is atomic and idempotent.
- Finalization preserves one immutable Atlas reasoning snapshot, one decision snapshot, one Career Ledger event, and one appropriate task.
- The snapshot records the active Blueprint revision, opportunity revision, scoring, confidence, contributing factors, classified evidence, strengths, concerns, missing information, executive questions, recommendation, selected action, rule versions, and timestamp.
- Today, Dashboard, Tasks, Career Ledger, Opportunity detail, and return navigation read the finalized collected-opportunity decision.

## Safety invariants

- Workspace membership is verified in the database transaction.
- Canonical opportunity and Blueprint references must match current workspace records.
- A stale opportunity version is rejected.
- A second finalization returns the existing decision rather than creating new history.
- Source provenance remains within the canonical Opportunity and immutable intelligence snapshot.
- No service-role credential or client-side secret is introduced.

## Acceptance gate

Staging acceptance must confirm a genuine collected opportunity, reversible draft selection, one finalization, persistence across refresh and sign-in, desktop and 390px behavior, and absence of critical browser or server errors.
