# Staging Database Acceptance

> Purpose: Record the factual result of preparing the isolated Supabase database before the first staging deployment.

## Migration Result

On 13 July 2026, all ten committed SQL migrations were replayed against the empty `Orendalis/orendalis-staging` project in filename order, ending with `202607130010_email_verification_enforcement.sql`. Each migration returned success. No migration was edited, and `supabase/seed.sql` was not run.

The provider SQL editor was used because the controlled environment did not have the Supabase CLI or database credentials. The resulting schema was validated directly; the provider's CLI migration-history ledger was not populated by this method and remains an operational limitation to reconcile before production.

## Read-only Validation

| Control | Result |
| --- | ---: |
| Public tables | 59 |
| RLS-enabled public tables | 59 |
| RLS policies | 144 |
| Application triggers | 11 |
| Append-only triggers | 11 |
| Security-definer functions | 11 |
| Auth users | 0 |

Confirmed domain surfaces include `workspace_invitations`, `beta_invitation_audit_events`, `email_verification_audit_events`, eight Atlas tables, and `career_ledger_entries`.

No seed, user, invitation, Vercel variable, integration, or deployment was created. Backup restore has not been rehearsed.
