# Environment Register

> Purpose: Define the authoritative isolation, provider, data, deployment, and readiness state of local, staging, and production environments.

| Field | Local Development | Staging | Production |
| --- | --- | --- | --- |
| Application URL | `http://localhost:3000` / `http://127.0.0.1:3000` | Assigned origin `https://project-qmvs1.vercel.app`; no deployment exists | Not Configured |
| Hosting | Founder workstation / Next.js local server | Vercel Pro | Not Configured |
| Hosting project | `frontend` local application | `Orendalis/orendalis-staging` | Not Configured |
| Database provider | Local Supabase PostgreSQL 15 | Supabase Pro | Not Configured |
| Database project | `executive-career-os-local` | `Orendalis/orendalis-staging`; ref `ymprcckbrgkijnuwhdne` | Not Configured |
| Region | Founder workstation | Central EU (Frankfurt), `eu-central-1` | Not Configured |
| Authentication | Local Supabase Auth | Supabase Auth healthy; Site URL and allowed redirect URLs not configured for staging | Not Configured |
| Email | Local capture/test behavior | No accepted transactional path; Microsoft mailbox is company communications only | Not Configured |
| Repository | `executivecareeros/executive-career-os` | Same repository connected to Vercel | Same repository intended; not configured |
| Branch | Current local branch; normally `main` | Production branch `main` | Not Configured |
| Deployment | Local only | None | None |
| Allowed data | Fictional data only | Fictional founder-acceptance data only | No data allowed; environment absent |
| Seed policy | Repository fictional seed permitted for local reset | Do not load `supabase/seed.sql` unless a separate staging approval explicitly requires fictional seed | No seed policy approved |
| Monitoring | Local logs and deterministic tests | Provider signals only; external monitoring not configured | Not Configured |
| Backup | Recreate from migrations and fictional seed | Provider backup observed as recent on 2026-07-13; restore proof not performed | Not Configured |
| Readiness | Active development | Hosting and database healthy; Auth URLs, migrations, variables, deployment, monitoring, restore rehearsal, and acceptance incomplete | Not created or accepted |
| Blockers | None for local fictional development | Controlled operations session lacks access to the owning Supabase project; Auth URLs and migrations cannot be applied until correct owner access is restored | Full architecture, provider creation, security, legal/privacy, deployment, and acceptance |
| Owner | Founder / Engineering | Founder / Release Manager / Database Owner | Founder; future assignment required |

## Staging Facts

- Vercel repository connection exists, but no Preview or Production deployment has occurred. The default assigned hostname displayed by Vercel is `https://project-qmvs1.vercel.app` and currently reports no deployment.
- Vercel has no staging environment variables, secrets, custom domain, or Supabase integration.
- Supabase owner-dashboard evidence on 13 July 2026 showed status **Healthy**, Micro compute, **No migrations**, and a provider backup recorded 19 minutes before the 18:44 Europe/Istanbul screenshot.
- Supabase Auth Site URL: **Not Configured**. Planned value after owner access is restored: `https://project-qmvs1.vercel.app`.
- Supabase allowed redirects: **Not Configured**. Repository-validated candidates are the confirmed origin plus `/auth/confirm`, `/reset-password`, and `/register`, with separately approved local routes; no wildcard is required.
- No application migration, seed, user, invitation, callback, or Vercel connection has been applied.
- Monitoring is limited to provider signals and manual checks; no external monitoring account or integration exists.
- Current blocker: the controlled operations browser session is authenticated to a Supabase account that cannot access project `ymprcckbrgkijnuwhdne`, while the founder's Safari session can view it. No configuration will be attempted until owner access is available in the controlled session.
- Next approval gate: complete Supabase Auth URL configuration and replay/validate all ten migrations; then stop for founder approval before adding Vercel environment variables or deploying.
- No production Vercel or Supabase resource is claimed.
