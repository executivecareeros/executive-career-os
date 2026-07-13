# Business Continuity

> Purpose: Keep critical company functions recoverable during founder, device, or provider disruption.

## Scenarios

- **Founder laptop fails:** Use a clean trusted device, recover password manager through approved method, verify MFA, clone from company repository, and do not restore unencrypted local secrets from unknown media.
- **GitHub unavailable:** Pause releases, use verified local/secondary backup for read-only continuity, monitor official status, and reconcile history after recovery.
- **Supabase unavailable:** Confirm provider status, pause data-changing workflows if integrity is uncertain, communicate accurately, and avoid risky migrations.
- **Vercel unavailable:** Confirm status, preserve last known-good build information, use documented alternative hosting assessment only if outage exceeds accepted tolerance.
- **Registrar compromised:** Treat as critical incident; contact registrar, secure recovery email/payment, lock changes, preserve logs, restore DNS, and review certificate/email impact.
- **Founder unavailable:** Backup administrator follows written authority limits, maintains service/support, preserves records, and does not make irreversible ownership decisions without proper authority.

## Priorities

1. Prevent cross-user exposure and preserve evidence.
2. Protect domain, identity, production data, and secrets.
3. Restore authentication and read access safely.
4. Restore normal deployment and communications.
5. Reconcile logs, decisions, costs, and lessons.

Conduct an annual tabletop exercise. This is operational guidance, not legal succession authority.

The executable continuity scenarios, minimum operating mode, verification, and exercise cadence are maintained in `company/operations/BUSINESS_CONTINUITY_PLAN.md`. This asset-level summary does not by itself prove recovery readiness.
