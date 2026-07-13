# Backup and Restore Verification

> Purpose: Define and record the controlled restore exercise required before private-beta data may be accepted.

## Current Result

**Not performed. Recovery readiness is not claimed.**

The repository contains backup and recovery planning, but Release 0.6 has no accepted staging or production database on which to perform a provider-backed restore exercise.

## Required Policy Inputs

- Backup method: Pending provider decision
- Frequency: Pending founder approval
- Retention: Pending legal and operational review
- Owner: Founder / Infrastructure
- Recovery point objective: Pending risk decision
- Recovery time objective: Pending risk decision
- Escalation: Incident Playbook and provider support

## Restore Exercise

Use an isolated restoration environment and fictional data only.

1. Record source project and backup timestamp without exposing identifiers or secrets.
2. Restore into an empty isolated target.
3. Apply any required forward migrations.
4. Count workspaces, identities, memberships, history, Blueprint revisions, opportunities, decision snapshots, ledger events, and feedback.
5. Validate foreign and composite workspace references.
6. Verify RLS with two fictional identities.
7. Verify append-only sequence, update denial, and delete denial.
8. Run the deterministic assessment against restored records.
9. Record duration, warnings, errors, and cleanup.
10. Delete or disable the isolated target according to the approved procedure.

## Exercise Record

- Backup timestamp: Not available
- Restoration environment: Not created
- Restored counts: Not measured
- Reference validation: Not run
- Append-only validation: Not run
- Duration: Not measured
- Errors: Not assessed
- Final result: **Not verified**

Production private beta remains blocked until a successful exercise is recorded.
