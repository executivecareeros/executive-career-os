# Founder Bootstrap Runbook

> Purpose: Operate the one-time founder initialization without bypassing authentication, verification, or database safeguards.

## Preconditions

- Approved staging environment only.
- Supabase Auth email verification enabled and callbacks approved.
- No Executive Identity, Workspace, membership, seed data, or bootstrap audit event exists.
- `COMPANY_CONTROL_FOUNDER_EMAIL` is server-only and matches the approved founder mailbox.
- Migration `202607130011_initial_founder_bootstrap.sql` has been reviewed but earlier migrations will not be replayed.

## Procedure

1. Record a database backup reference and current schema counts.
2. Apply only migration `202607130011_initial_founder_bootstrap.sql` through the existing controlled SQL Editor process.
3. In the same privileged administrative context, execute `select public.configure_initial_founder_email('<approved founder mailbox>');`. Never paste the address into browser code.
4. Confirm browser roles cannot read the configuration table or call the configuration function.
5. Open `/founder-bootstrap`, register or sign in, and complete the real verification-email callback.
6. Review and explicitly accept the Atlas Promise, then initialize once.
7. Verify the eight Company Control bootstrap indicators and confirm a second attempt returns the completed state.
8. Stop before creating a design-partner invitation.

## Rollback and escalation

Before success, a failed transaction requires no data cleanup. After success, the immutable bootstrap is not rolled back through application controls. Restore the pre-change staging backup only under a separately approved recovery decision. Never delete the audit row, rotate the configured email, or regenerate a second founder as an informal fix.
