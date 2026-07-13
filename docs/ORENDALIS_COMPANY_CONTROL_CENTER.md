# Orendalis Company Control Center

> Purpose: Define the founder-only internal operating dashboard that unifies company evidence, exceptions, actions, and readiness without presenting unavailable data as fact.

## Product Boundary

The Company Control Center is an internal Orendalis capability, separate from the public Executive Career OS beta. The initial view is visibly marked **Internal — Founder Access**. It is a decision surface, not a substitute for accounting, legal advice, provider consoles, security monitoring, or product analytics.

## First Foundation

The `/company-control` route provides:

- Executive context and data-freshness disclosure
- Company health strip
- Demonstration Atlas Chief of Staff briefing
- Ranked founder actions
- Exception-only alerts
- Deadlines
- Company metric snapshot
- Fifteen department cards
- Microsoft support case summary
- Vendor and infrastructure health
- Data-source connection registry

The route uses the existing application shell and Atlas design language. It adds no external integration, write automation, customer-data access, or provider authority.

## Source-of-Truth Map

| Information | Authoritative source | Control Center behavior |
|---|---|---|
| Repository counts | Git and tracked source files | Baseline observation tied to a commit reference |
| Founder investment and cost | `company/founder-investment/` | Shows missing verified totals; never invents values |
| Subscriptions and domains | `company/assets/` | References records; does not duplicate ownership data |
| Risks and readiness | `company/operations/` | Summarizes open evidence and links to the source |
| Microsoft DKIM case | `company/operations/email/MICROSOFT_SUPPORT_CASE_LOG.md` | Displays safe case metadata only |
| Product and user activity | Future aggregate repositories | `Not Connected`; no personal data exposed |
| Revenue and billing | Future billing provider | `Not Connected`; never displays missing revenue as zero |
| Deployment and provider health | Future approved adapters | `Not Connected` until verified and tested |

When two sources disagree, the domain-specific authoritative source wins. The dashboard must surface the conflict instead of silently resolving it.

## Access Boundary

In Supabase mode, the route requires an authenticated session and an exact match with the server-only `COMPANY_CONTROL_FOUNDER_EMAIL` setting. If the setting is missing or the user does not match, the route returns not found. Local memory/demo mode exposes a demonstration view for development only.

Future roles are modeled but disabled. Additional founders, executives, department leaders, board members, advisers, auditors, and read-only viewers require explicit policy and implementation before access is granted.

## Health Semantics

Health is never inferred from absence. Supported states are `Healthy`, `Watch`, `At Risk`, `Critical`, `Unknown`, `Not Connected`, and `Not Applicable`. A department with no operational data is `Not Connected`, not healthy.

## Experience Principles

- Decisions and exceptions precede decorative statistics.
- Every value exposes source, freshness, confidence, and evidence class.
- Missing values remain missing.
- Status is communicated with text as well as color.
- Tables scroll within their container on narrow screens.
- Semantic headings, landmarks, captions, links, and focus styles support keyboard and assistive-technology use.

## Known Limitations

- The briefing is a deterministic demonstration generated from repository and operational records.
- Repository counts are a baseline snapshot, not live GitHub telemetry.
- Department detail pages are not created; cards use anchored progressive disclosure.
- No charts are shown because reliable trend series do not yet exist.
- Production authorization depends on correct Supabase mode and the founder email environment setting.
- No provider connection has been activated or tested in this foundation.

## Future Integration Plan

Integrations should be added one source at a time through the Company Data Source Registry. Each requires approved scopes, a read-only test, data minimization, freshness policy, failure behavior, audit evidence, and founder approval before activation. Write actions require a separate approval model.
