# Business Continuity Plan

> Purpose: Maintain safe minimum operations through founder, device, network, provider, billing, domain, or communication disruption.

## Critical Functions and Priority

1. Protect identity, domain, data, and evidence.
2. Maintain secure founder and provider access.
3. Preserve source, documentation, and database recoverability.
4. Restore authentication and controlled application access.
5. Restore company email and support communication.
6. Resume releases only after stability.

## Scenario Plan

| Scenario | Immediate continuity action | Recovery path | Current gap |
| --- | --- | --- | --- |
| Single-founder unavailability | Freeze releases, purchases, DNS, ownership, and destructive changes; preserve support and evidence | Authorized backup operator follows written limits and escalates legal/ownership decisions | No backup authority is documented as active |
| Internet outage | Stop production changes; use approved alternate connection only from a trusted device | Verify local and provider state after connectivity returns | Alternate connectivity and test unverified |
| Device loss/failure | Secure email/password manager, revoke device sessions, preserve evidence | Follow `SECURITY_RECOVERY.md`; rebuild from clean device and repository | Recovery device and exercise unverified |
| Credential loss | Avoid repeated lockout attempts; use provider recovery | Restore identity, revoke sessions, rotate affected credentials, verify audits | Several recovery methods unverified |
| Billing failure | Freeze optional spend and capture provider notice; avoid unverified payment links | Founder corrects billing in provider portal after approving charge | Microsoft billing evidence incomplete; Vercel/Supabase absent |
| Domain expiration/registrar loss | Treat as Severity 1/2; secure registrar/email and freeze DNS | Recover registrar, renew with approval, verify known-good DNS, certificates and mail | Renewal controls and backup authority require verification |
| Microsoft outage | Use approved alternate founder contact; do not alter mail DNS | Monitor Microsoft health/support; verify mailbox after recovery | Alternate contact workflow unexercised; DKIM case open |
| Supabase outage | Pause writes/invitations if integrity is uncertain | Follow Supabase and database recovery runbooks | Cloud backup/restore cannot be tested before project exists |
| Vercel outage | Stop deployments; preserve last known-good build and evidence | Follow Vercel/rollback runbooks | No live project or rollback exercise exists |
| GitHub outage | Pause merges/deployments; use verified local clone read-only | Reconcile history after recovery | Secondary protected archive unverified |

## Minimum Operating Mode

Orendalis may suspend invitations, staging, releases, uploads, and external access. Maintain incident records, provider communication, and data protection. Availability does not justify weakening authentication, RLS, encryption, or evidence preservation.

## Communication

Use the company mailbox when available and an approved alternate founder channel when it is not. Communicate facts, impact, workaround, owner, and next update. Never expose credentials, security details, or personal data.

## Recovery Verification

Verify provider ownership, MFA, billing, domain/DNS, email, source integrity, deployed commit, database integrity/RLS, authentication, logs, and backups before normal operation.

## Exercises

- Quarterly access and provider-contact review.
- Semiannual device-loss and credential-recovery tabletop.
- Annual provider-outage, database restore, and founder-unavailability exercise.
- Record simulation, verified controls, gaps, owners, and deadlines.

## Current Readiness

The plan is documented but not exercised. Single-founder concentration, unverified backup authority, provider recovery evidence, alternate connectivity, and cloud restore proof remain material gaps.
