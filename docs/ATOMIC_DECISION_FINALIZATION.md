# Atomic Decision Finalization

> Purpose: Define the accepted transaction that completes a beta opportunity decision.

`finalize_beta_decision` is the sole accepted finalization boundary. It verifies active Workspace membership, Blueprint revision, opportunity version, reasoning references, selected action, and idempotency key.

Within one PostgreSQL transaction it appends an immutable Atlas decision snapshot, appends a Career Ledger event, creates the selected next-action task, writes a stable decision commit, writes a safe audit event, and advances workflow state. A validation or write failure aborts the complete function. Browser-side sequencing is not treated as atomic.

Repeated calls with the same Workspace and idempotency key return the original commit. A stale opportunity version produces an explicit concurrency failure. The append-only triggers continue to reject update and delete operations.
