# Environment Register

> Purpose: Define the authoritative isolation, provider, data, deployment, and readiness state of local, staging, and production environments.

| Field | Local Development | Staging | Production |
| --- | --- | --- | --- |
| Application URL | `http://localhost:3000` / `http://127.0.0.1:3000` | Future Vercel-generated HTTPS URL; not deployed | Not Configured |
| Hosting | Founder workstation / Next.js local server | Vercel Pro | Not Configured |
| Hosting project | `frontend` local application | `Orendalis/orendalis-staging` | Not Configured |
| Database provider | Local Supabase PostgreSQL 15 | Supabase Pro | Not Configured |
| Database project | `executive-career-os-local` | `Orendalis/orendalis-staging`; ref `ymprcckbrgkijnuwhdne` | Not Configured |
| Region | Founder workstation | Central EU (Frankfurt), `eu-central-1` | Not Configured |
| Authentication | Local Supabase Auth | Supabase Auth; not configured for staging callbacks | Not Configured |
| Email | Local capture/test behavior | No accepted transactional path; Microsoft mailbox is company communications only | Not Configured |
| Repository | `executivecareeros/executive-career-os` | Same repository connected to Vercel | Same repository intended; not configured |
| Branch | Current local branch; normally `main` | Production branch `main` | Not Configured |
| Deployment | Local only | None | None |
| Allowed data | Fictional data only | Fictional founder-acceptance data only | No data allowed; environment absent |
| Seed policy | Repository fictional seed permitted for local reset | Do not load `supabase/seed.sql` unless a separate staging approval explicitly requires fictional seed | No seed policy approved |
| Monitoring | Local logs and deterministic tests | Provider signals only; external monitoring not configured | Not Configured |
| Backup | Recreate from migrations and fictional seed | Pro capability documented; first backup and restore proof unverified | Not Configured |
| Readiness | Active development | Resources created; configuration, migrations, deployment, and acceptance incomplete | Not created or accepted |
| Blockers | None for local fictional development | Health evidence, variables, callbacks, migrations, deployment, monitoring, restore proof, security and founder acceptance | Full architecture, provider creation, security, legal/privacy, deployment, and acceptance |
| Owner | Founder / Engineering | Founder / Release Manager / Database Owner | Founder; future assignment required |

## Staging Facts

- Vercel repository connection exists, but no Preview or Production deployment has occurred.
- Vercel has no staging environment variables, secrets, custom domain, or Supabase integration.
- Supabase project creation is confirmed; no application migration, seed, user, callback, or Vercel connection was made during creation.
- Public service checks on 13 July 2026 showed the project API hostname and database endpoint published, Storage responding, and Auth/REST gateways responding with authentication required. The provider-dashboard account used for automated verification lacked project access, so full dashboard health and backup state remain open evidence items.
- No production Vercel or Supabase resource is claimed.

