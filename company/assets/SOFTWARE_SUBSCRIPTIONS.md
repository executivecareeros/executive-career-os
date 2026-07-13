# Software Subscriptions

> Purpose: Control SaaS cost, renewal risk, ownership, and vendor dependency.

> **Superseded current-state notice — 13 July 2026:** The authoritative subscription view is `company/operations/access-and-environments/SUBSCRIPTION_AND_BILLING_REGISTER.md`. Planned Vercel, local-only Supabase, and Google Workspace entries below reflect an earlier planning stage. Vercel Pro and Supabase Pro staging now exist; Microsoft 365 Business Basic is the selected email platform.

| Provider | Purpose | Plan | Seats | Monthly Cost | Annual Cost | Renewal | Billing Account | Criticality | Alternative | Cancellation Difficulty | Status |
|---|---|---|---:|---:|---:|---|---|---|---|---|---|
| GitHub | Source control | [VERIFY] | [ ] | [VERIFY] | [VERIFY] | [DATE/N/A] | [OWNER] | Critical | GitLab/self-hosted | Medium—export and permissions | Active—verify |
| Supabase | Database/authentication | [VERIFY] | [ ] | [VERIFY] | [VERIFY] | [DATE] | [OWNER] | Critical | PostgreSQL/other provider | High—data/auth migration | Local active; production pending |
| Vercel | Next.js hosting | [PLANNED] | [ ] | [VERIFY] | [VERIFY] | [DATE] | [OWNER] | Critical | Other Next.js host | Medium | Planned |
| Google Workspace | Company email | [PLANNED] | [ ] | [VERIFY] | [VERIFY] | [DATE] | [OWNER] | High | Microsoft 365 | Medium—mail migration | Planned |
| Sentry | Error monitoring | [PLANNED] | [ ] | [VERIFY] | [VERIFY] | [DATE] | [OWNER] | High | Other monitoring | Low/Medium | Planned |
| PostHog | Product analytics | [PLANNED] | [ ] | [VERIFY] | [VERIFY] | [DATE] | [OWNER] | Medium | Plausible/manual | Medium—event history | Planned |

Review official current pricing before recording cost. Attach invoices in the secure accounting location, not Git.
