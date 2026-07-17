# Environment Register

> Purpose: Define the authoritative isolation, provider, data, deployment, and readiness state of local, staging, and production environments.

| Field | Local Development | Staging | Production |
| --- | --- | --- | --- |
| Application URL | `http://localhost:3000` / `http://127.0.0.1:3000` | Isolation gap: the project URL currently aliases the same deployment that serves production | `https://www.orendalis.com`; active |
| Hosting | Founder workstation / Next.js local server | Vercel Pro | Not Configured |
| Hosting project | `frontend` local application | No isolated Vercel deployment target currently verified | `Orendalis/orendalis-staging` (name is historical and misleading; it owns production domains) |
| Database provider | Local Supabase PostgreSQL 15 | Supabase Pro | Not Configured |
| Database project | `executive-career-os-local` | `Orendalis/orendalis-staging`; ref `ymprcckbrgkijnuwhdne` | Not Configured |
| Region | Founder workstation | Central EU (Frankfurt), `eu-central-1` | Not Configured |
| Authentication | Local Supabase Auth | Supabase Auth healthy; staging Site URL and six explicit staging/local redirect URLs configured | Not Configured |
| Email | Local capture/test behavior | Resend custom SMTP configured in Supabase; sender verified; Microsoft quarantine blocker remains | Not Configured |
| Repository | `executivecareeros/executive-career-os` | Same repository connected to Vercel | Same repository intended; not configured |
| Branch | Current local branch; normally `main` | Production branch `main` | Not Configured |
| Deployment | Local only | Blocked pending a domain-isolated Vercel environment | Active from `main`; scheduler routing commit `18d1223` deployed inert |
| Allowed data | Fictional data only | Fictional founder-acceptance data only | No data allowed; environment absent |
| Seed policy | Repository fictional seed permitted for local reset | Do not load `supabase/seed.sql` unless a separate staging approval explicitly requires fictional seed | No seed policy approved |
| Monitoring | Local logs and deterministic tests | Provider signals only; external monitoring not configured | Not Configured |
| Backup | Recreate from migrations and fictional seed | Provider backup observed as recent on 2026-07-13; restore proof not performed | Not Configured |
| Readiness | Active development | Not isolated; do not activate scheduled ingestion | Live application active; opportunity scheduler intentionally unconfigured |
| Blockers | None for local fictional development | Domain-isolated Vercel environment, superseded scheduler-key revocation, restore rehearsal, monitoring, provider recovery evidence, and migration-history baseline | Scheduler activation requires staging acceptance; legal/privacy approval remains required for broader launch claims |
| Owner | Founder / Engineering | Founder / Release Manager / Database Owner | Founder; future assignment required |

## Staging Facts

- **17 July 2026 correction:** the Vercel project named `orendalis-staging` owns `www.orendalis.com` and its stable project hostname points to the same Production deployment. It is therefore not an isolated staging execution boundary. Scheduled opportunity ingestion must not be activated there before an isolated environment is approved and verified.
- Scheduler code and the 15-minute Vercel cron declaration are deployed at commit `18d1223`, but scheduler variables are absent. The route reaches its bearer-authentication guard and returns `401` without credentials. No provider schedule was enabled and no live provider run was executed.

- The initial empty-root deployment `DC87jjWJnTXw5gRSFyZXGkvU6aP1` is retained as failed historical evidence. Vercel now uses root `frontend` and framework preset `Next.js`; corrected deployment `4hTYNCufvM2sErX6N5JCzxhV8vqN` built commit `cf9e1b4` successfully in 40 seconds.
- Vercel has exactly seven approved project variables in Production scope. All are marked Sensitive. Preview and Development variables, custom domains, and provider integrations remain absent.
- Supabase owner-dashboard evidence on 13 July 2026 showed status **Healthy**, Micro compute, and a recent provider backup.
- Supabase Auth Site URL is `https://project-qmvs1.vercel.app`.
- Supabase allows exactly six redirects: the staging origin and localhost on `/auth/confirm`, `/reset-password`, and `/register`. No wildcard or production callback was added.
- All ten committed migrations through `202607130010_email_verification_enforcement.sql` were replayed in filename order. No migration file was edited.
- Read-only validation reported 59 public tables, 59 RLS-enabled tables, 144 RLS policies, 11 application triggers, 11 append-only triggers, and 11 security-definer functions.
- Historical migration milestone: no seed file, user, invitation, service-role credential, integration, or deployment existed when the first ten migrations were validated. Later founder bootstrap, Vercel configuration, and staging deployment are recorded below; no service-role credential or fictional seed was introduced.
- Migrations were applied in committed order and the schema is validated, but SQL Editor execution did not populate the Supabase CLI migration-history ledger. Reconcile or baseline that history before automated push workflows; do not blindly re-apply migrations.
- Monitoring is limited to provider signals and manual checks; no external monitoring account or integration exists.
- Founder bootstrap migration `202607130011_initial_founder_bootstrap.sql`, SHA-256 `28c7b52857f5cd690a9e9099c76ca533b75ac5d7c17540aaf5f56f173d7792c3`, was applied alone through the staging SQL Editor on 13 July 2026. The protected founder email configuration function then completed successfully. The earlier ten migrations were not replayed and the manual-history warning remains.
- Resend Free is verified for `auth.orendalis.com`. Supabase custom SMTP uses `Orendalis <no-reply@auth.orendalis.com>`; the credential is held only by Supabase and is not recorded here.
- A controlled confirmation on 14 July 2026 passed SPF, DKIM, DMARC, and composite authentication. Microsoft Defender quarantined it as high-confidence phishing; it reached the Inbox only after administrator release.
- The founder Auth user is email-confirmed. Founder bootstrap completed once on 14 July 2026 in approximately three seconds. Exactly one Executive Identity, Workspace, Owner membership, settings record, Blueprint context, Career Ledger initialization, Atlas context, and immutable bootstrap audit exists.
- Replay returned `ALREADY_BOOTSTRAPPED`; the initialization route now reports completion and the Company Control indicators are permanently closed.
- Dashboard, Company Control, Invitation Management, and the protected Workspace route were accessible to the verified founder session. All eight bootstrap-relevant tables have RLS enabled.
- Release 0.8 founder acceptance, Atlas isolation, and Workspace isolation passed on 14 July 2026. The staging workflow contained no demonstration records, and logout/login persistence passed.
- Current blockers: unassisted authentication-email Inbox delivery, restore rehearsal, external monitoring, provider recovery evidence, migration-history baseline, and legal/privacy approval.
- Next approval gate: satisfy every item in `company/releases/release-0.9/DEFINITION_OF_READY.md` before any design-partner invitation.
- No production Vercel or Supabase resource is claimed.
