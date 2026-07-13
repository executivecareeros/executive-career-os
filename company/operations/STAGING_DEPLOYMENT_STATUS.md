# Staging Deployment Status

> Purpose: Record the factual state of the first Orendalis staging deployment attempt.

## Attempt — 13 July 2026

- Workspace: `Orendalis` (Vercel Pro)
- Project: `orendalis-staging`
- Repository: `executivecareeros/executive-career-os`
- Branch: `main`
- Commit: `cf9e1b49c3766bad6a758bce448caa6e29a5a08e`
- Deployment ID: `DC87jjWJnTXw5gRSFyZXGkvU6aP1`
- Vercel status: **Ready**
- Assigned origin: `https://project-qmvs1.vercel.app`
- Application status: **Unavailable**

Vercel completed the deployment in approximately three seconds, but the project used framework preset `Other` with an empty root directory. The Next.js application is under `frontend`, so no application build occurred. The assigned origin, branch alias, and unique deployment URL return Vercel platform-level `404: NOT_FOUND` after deployment authentication where applicable.

## Blocker and Next Gate

The project must be configured with root directory `frontend` and Next.js framework detection before a single controlled redeployment. No configuration change or redeployment was performed during this validation. Founder approval is required before correcting the Vercel build configuration.

## Corrected Deployment — 13 July 2026

- Root directory: `frontend`
- Framework preset: `Next.js`
- Install, build, and output settings: Next.js defaults; no custom output directory
- Node.js: `24.x`
- Source commit: `cf9e1b49c3766bad6a758bce448caa6e29a5a08e`
- Deployment ID: `4hTYNCufvM2sErX6N5JCzxhV8vqN`
- Build result: **Ready** after 40 seconds
- Authoritative origin: `https://project-qmvs1.vercel.app` (unchanged)
- Application status: **Available**

The application built successfully and the stable origin now serves Next.js routes and assets. Exactly one manual redeployment was triggered. No environment-variable value, domain, DNS, Supabase, Microsoft 365, GitHub permission, Hobby project, or production resource was modified.

## Current Gate

Unauthenticated smoke testing passed. Security headers beyond HSTS remain an important, non-blocking hardening item for staging founder acceptance and a required production-acceptance item. The next gate is explicit founder approval to begin the fictional staging Founder Acceptance journey.
