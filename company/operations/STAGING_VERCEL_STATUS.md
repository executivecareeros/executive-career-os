# Vercel Staging Status

> Purpose: Record the factual Vercel state established during the first staging creation phase.

> **Historical milestone notice — 13 July 2026:** This file preserves the repository-connection milestone. Vercel later displayed the assigned hostname `https://project-qmvs1.vercel.app`; no deployment or environment variables exist. Use `company/operations/access-and-environments/ENVIRONMENT_REGISTER.md` for current state.

**Verified:** 13 July 2026

## Project Metadata

| Item | Verified state |
| --- | --- |
| Workspace | Orendalis |
| Workspace plan | Pro |
| Project | `orendalis-staging` |
| Repository | `executivecareeros/executive-career-os` |
| Repository connection | Connected through the existing Vercel GitHub integration |
| Production branch | `main` |
| Automatic deployment behavior | Enabled for future Git pushes by the Vercel Git connection |
| Production deployment | None; production deployment view returned no results |
| Preview deployment | None; project overview reported no preview deployments |
| Environment variables | None added |
| Secrets | None added |
| Custom domains | None added |
| Supabase | Not connected |

## Isolation Evidence

The project was created first as an empty Vercel project, renamed to `orendalis-staging`, and then connected to the existing GitHub repository. The repository connection did not create a Production or Preview deployment.

The pre-existing Hobby projects `executive-career-os` and `executive-career-os-play` remain in the separate `executivecareeros' projects` Hobby workspace. No setting or deployment in either project was changed during this phase.

## Next Gate

Do not push a commit or merge to `main` until the founder separately approves deployment behavior and staging configuration. Environment variables, Supabase, authentication callbacks, domains, DNS, Microsoft 365, secrets, and deployment remain outside this completed phase.
