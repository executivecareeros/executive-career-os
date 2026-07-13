# Environment Register

> Purpose: Define the authoritative isolation, provider, data, deployment, and readiness state of local, staging, and production environments.

| Field | Local Development | Staging | Production |
| --- | --- | --- | --- |
| Application URL | `http://localhost:3000` / `http://127.0.0.1:3000` | Assigned origin `https://project-qmvs1.vercel.app`; currently returns Vercel `404: NOT_FOUND` | Not Configured |
| Hosting | Founder workstation / Next.js local server | Vercel Pro | Not Configured |
| Hosting project | `frontend` local application | `Orendalis/orendalis-staging` | Not Configured |
| Database provider | Local Supabase PostgreSQL 15 | Supabase Pro | Not Configured |
| Database project | `executive-career-os-local` | `Orendalis/orendalis-staging`; ref `ymprcckbrgkijnuwhdne` | Not Configured |
| Region | Founder workstation | Central EU (Frankfurt), `eu-central-1` | Not Configured |
| Authentication | Local Supabase Auth | Supabase Auth healthy; staging Site URL and six explicit staging/local redirect URLs configured | Not Configured |
| Email | Local capture/test behavior | No accepted transactional path; Microsoft mailbox is company communications only | Not Configured |
| Repository | `executivecareeros/executive-career-os` | Same repository connected to Vercel | Same repository intended; not configured |
| Branch | Current local branch; normally `main` | Production branch `main` | Not Configured |
| Deployment | Local only | Commit `cf9e1b4`, Vercel deployment `DC87jjWJnTXw5gRSFyZXGkvU6aP1`; provider status Ready but application unavailable | None |
| Allowed data | Fictional data only | Fictional founder-acceptance data only | No data allowed; environment absent |
| Seed policy | Repository fictional seed permitted for local reset | Do not load `supabase/seed.sql` unless a separate staging approval explicitly requires fictional seed | No seed policy approved |
| Monitoring | Local logs and deterministic tests | Provider signals only; external monitoring not configured | Not Configured |
| Backup | Recreate from migrations and fictional seed | Provider backup observed as recent on 2026-07-13; restore proof not performed | Not Configured |
| Readiness | Active development | Infrastructure exists, but the first deployment did not build the Next.js application; monitoring, restore rehearsal, and acceptance remain incomplete | Not created or accepted |
| Blockers | None for local fictional development | Vercel root directory is empty and framework preset is `Other`; project must use `frontend` and Next.js before one controlled redeployment. Migration-history baseline is also required before future automated database push workflows | Full architecture, provider creation, security, legal/privacy, deployment, and acceptance |
| Owner | Founder / Engineering | Founder / Release Manager / Database Owner | Founder; future assignment required |

## Staging Facts

- Vercel deployed `main` commit `cf9e1b4` as deployment `DC87jjWJnTXw5gRSFyZXGkvU6aP1` and marked it Ready. The default assigned hostname is `https://project-qmvs1.vercel.app`, but it returns Vercel `404: NOT_FOUND` because the project root is empty and the framework preset is `Other`; the Next.js application under `frontend` was not built.
- Vercel has exactly seven approved project variables in Production scope. All are marked Sensitive. Preview and Development variables, custom domains, and provider integrations remain absent.
- Supabase owner-dashboard evidence on 13 July 2026 showed status **Healthy**, Micro compute, and a recent provider backup.
- Supabase Auth Site URL is `https://project-qmvs1.vercel.app`.
- Supabase allows exactly six redirects: the staging origin and localhost on `/auth/confirm`, `/reset-password`, and `/register`. No wildcard or production callback was added.
- All ten committed migrations through `202607130010_email_verification_enforcement.sql` were replayed in filename order. No migration file was edited.
- Read-only validation reported 59 public tables, 59 RLS-enabled tables, 144 RLS policies, 11 application triggers, 11 append-only triggers, and 11 security-definer functions.
- No seed file, user, invitation, service-role credential, Supabase/Vercel integration, or deployment was created.
- Migrations were applied in committed order and the schema is validated, but SQL Editor execution did not populate the Supabase CLI migration-history ledger. Reconcile or baseline that history before automated push workflows; do not blindly re-apply migrations.
- Monitoring is limited to provider signals and manual checks; no external monitoring account or integration exists.
- Current blocker: incorrect Vercel build configuration prevented the application build.
- Next approval gate: explicit founder approval to set root directory `frontend`, confirm Next.js detection, and perform one controlled redeployment.
- No production Vercel or Supabase resource is claimed.
