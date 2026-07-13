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

