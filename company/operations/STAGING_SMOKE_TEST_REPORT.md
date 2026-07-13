# Staging Smoke Test Report

> Purpose: Preserve smoke-test evidence from the first staging deployment attempt.

## Result — 13 July 2026

**Failed before application-level testing.**

| Route | Result |
| --- | --- |
| `/` | Vercel `404: NOT_FOUND` |
| `/login` | Vercel `404: NOT_FOUND` |
| `/register` | Vercel `404: NOT_FOUND` |
| `/forgot-password` | Vercel `404: NOT_FOUND` |
| `/reset-password` | Vercel `404: NOT_FOUND` |
| `/onboarding` | Vercel `404: NOT_FOUND` |
| `/beta-workflow` | Vercel `404: NOT_FOUND` |
| `/company-control` | Vercel `404: NOT_FOUND` |
| Unknown route | Vercel `404: NOT_FOUND` |

The failure occurs before Next.js routing. Responsive, keyboard, authentication-redirect, static-asset, and application-console checks could not be performed. No user, invitation, seed data, or real personal data was created.

## Classification

- Subsystem: Vercel project build configuration
- Severity: High for staging acceptance
- Regression risk: Low if corrected only by setting the existing project root to `frontend` and verifying framework detection before one redeployment
- Application defect identified: None; the application was not built or served

## Corrected Deployment Validation — 13 July 2026

| Route | Result |
| --- | --- |
| `/` | `307` to `/login?next=%2F`; no loop |
| `/login` | `200`; login interface rendered |
| `/register` without invitation | `200`; public registration explicitly blocked |
| `/forgot-password` | `200`; recovery interface rendered |
| `/reset-password` without recovery session | `200`; recovery validation shown |
| `/onboarding` without session | `307` to login |
| `/beta-workflow` without session | `307` to login |
| `/company-control` without founder session | `307` to login |
| Unknown route without session | `307` to login under the authentication boundary |

- Stable origin: `https://project-qmvs1.vercel.app`
- Deployment: `4hTYNCufvM2sErX6N5JCzxhV8vqN`
- Source: `cf9e1b4`
- Next.js JavaScript and CSS assets returned `200` with immutable caching.
- Browser console reported no warnings or errors during the route journey.
- Vercel runtime logs showed the expected `200` and `307` results with no error messages.
- Supabase dashboard reported the staging project Healthy in Frankfurt.
- No environment-variable error, redirect loop, Vercel `NOT_FOUND`, user, invitation, seed data, or production endpoint was observed.

**Result:** unauthenticated staging smoke test passed. Authenticated founder acceptance remains a separate approval gate.
