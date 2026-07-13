# Production Deployment Runbook

> Purpose: Define the future controlled release procedure for private production without authorizing a deployment.

## Trigger

Separate founder approval after staging acceptance, production readiness review, security/privacy approval, restore proof, support readiness, exact cost approval, and a scheduled release window.

## Responsible Owner

Founder / Release Manager. Production rollback authority remains with the founder until formally delegated.

## Procedure

1. Open a major-change record identifying accepted staging evidence and residual risks.
2. Freeze the release candidate and record the commit and migration set.
3. Confirm production uses independent hosting, database, Auth, variables, callbacks, keys, and backups.
4. Verify legal/privacy notices, invitation scope, support channel, known limitations, and incident contacts.
5. Confirm CI, dependency review, secret scan, staging acceptance, and rollback rehearsal.
6. Back up production and verify the restore point before migrations.
7. Apply reviewed forward-only migrations within the approved window.
8. Deploy the exact staging-accepted commit.
9. Run minimum smoke tests without creating or exposing unnecessary personal data.
10. Review logs, health, authentication, data integrity, support, and email delivery.
11. Announce internally only after verification; do not make a public launch claim.
12. Begin the defined post-release observation period.

## Verification

- Production commit and schema match the approved release record.
- HTTPS, security headers, cookies, Auth, RLS, founder access, backups, logging, and support paths pass.
- No staging key, callback, account, seed, or fictional operational setting exists in production.
- Private-beta access remains invitation-only.

## Rollback

Pause invitations and writes where necessary. Use `ROLLBACK_RUNBOOK.md`; restore the prior compatible application and verified database state. Do not improvise destructive SQL or weaken authentication to recover availability.

## Postmortem Requirements

Required for any rollback, Severity 1/2 impact, data or privacy concern, missed release gate, or material deviation. Complete within five business days after stabilization.
