# Supabase Staging Project Status

Purpose: Record safe operational metadata for the isolated Supabase staging project without storing credentials or secrets.

> **Historical milestone notice — 13 July 2026:** This file records project creation while status was `Coming up…`. The project later became Healthy, and Auth/migration preparation was completed. Use `company/operations/access-and-environments/ENVIRONMENT_REGISTER.md` for current state.

## Project

| Field | Verified value |
| --- | --- |
| Organization | Orendalis |
| Project | `orendalis-staging` |
| Project reference | `ymprcckbrgkijnuwhdne` |
| Region | Central EU (Frankfurt), `eu-central-1` |
| Compute | Micro, `t3a.micro` |
| Organization plan | Pro |
| Billing period | Monthly |
| Creation status | Created; provisioning (`Coming up…`) |
| GitHub integration | Not connected |

## Service Readiness

At the time of this record, Supabase showed the project as **Coming up…**. Database, API, Authentication, Storage, and backup execution were therefore not yet claimed operational. The Pro plan includes daily backup capability with seven-day retention; the first successful project backup has not yet been observed.

## Isolation Confirmation

- No production Supabase project was modified.
- No migrations were applied.
- No seed data was loaded.
- No test users were created.
- No authentication callbacks were configured.
- No Supabase integration was connected to Vercel.
- No Vercel environment variables or secrets were configured.
- No deployment was triggered.
- No database password, API key, service-role key, JWT secret, access token, or connection string is recorded here.

## Next Approved Step

Historical next step completed. The current approval gate is Vercel staging environment-variable configuration; no deployment is authorized by this record.
