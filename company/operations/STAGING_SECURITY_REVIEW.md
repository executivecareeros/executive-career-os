# Staging Security Review

> Purpose: Record the security evidence available from the first staging deployment attempt without overstating application readiness.

## Observed

- HTTPS is active on Vercel hostnames.
- Vercel responses include HSTS with a two-year maximum age, subdomain coverage, and preload.
- Deployment protection redirects unauthenticated requests to Vercel SSO on the unique deployment hostname.
- The staging origin serves only Vercel's platform-level `404` because the application was not built.
- No secrets were displayed or added during this validation.
- No DNS, Microsoft 365, Supabase, or production resource was changed.

## Not Yet Testable

Application CSP, content-type, referrer, permissions, frame protections, cookies, authentication redirects, static assets, runtime errors, and route authorization cannot be accepted until the Next.js application is served. This review does not approve staging security or founder acceptance.

## Corrected Deployment Review — 13 July 2026

### Verified

- **Informational:** HTTPS and HSTS are active (`max-age=63072000; includeSubDomains; preload`).
- **Informational:** public registration fails closed without a founder-issued invitation.
- **Informational:** onboarding, beta workflow, and Company Control redirect unauthenticated visitors to login.
- **Informational:** no stack trace, environment value, service-role behavior, or critical browser/runtime error was observed.
- **Informational:** static assets are served from deployment-scoped Next.js paths with immutable caching.

### Findings

- **Important:** responses do not currently emit an application Content Security Policy.
- **Important:** explicit `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and frame-protection headers were not observed.
- **Non-blocking for this gate:** founder-only authorization cannot be fully exercised without the separately approved fictional authenticated journey.
- **Non-blocking for this gate:** source-map secret inspection was limited to public-response and repository secret-pattern checks; no leak was observed.

No blocking defect was identified for beginning supervised staging Founder Acceptance. The important headers must be addressed before production acceptance.
