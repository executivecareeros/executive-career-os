# Company Metric Registry

> Purpose: Establish canonical company metrics so departments and providers cannot calculate or display the same concept inconsistently.

## Required Definition

Every metric defines a canonical key, department, description, unit, calculation, numerator and denominator where applicable, source, frequency, owner, target, warning and critical thresholds, data classification, and display rules.

Every observation records value or explicit unavailability, previous value, status, direction, period, measurement time, source reference, freshness, confidence, value kind, owner, notes, and demonstration status.

## Initial Registry

| Canonical key | Department | Definition | Source | Current state |
|---|---|---|---|---|
| `users.registered.total` | Product | Distinct registered workspace accounts | Product analytics | Not Connected |
| `users.activated.total` | Product | Accounts meeting the approved activation definition | Product analytics | Not Connected |
| `users.active.weekly` | Customer Success | Users completing an approved meaningful action in seven days | Product analytics | Not Connected |
| `users.activation.rate` | Product | Activated eligible accounts / eligible registered accounts | Product analytics | Not Connected |
| `beta.participants.total` | Customer Success | Accepted and active private-beta participants | Product analytics | Not Connected |
| `support.cases.open` | Customer Support | Open cases in approved case sources | Operational case log | Partially Connected |
| `engineering.repository.commits` | Engineering | Commits reachable from the baseline revision | Git snapshot | Measured baseline |
| `engineering.routes.pages` | Engineering | Next.js page route files | Repository snapshot | Measured baseline |
| `engineering.database.migrations` | Engineering | Tracked SQL migration files | Repository snapshot | Measured baseline |
| `engineering.validation.scripts` | Engineering | Named validation scripts | Repository snapshot | Measured baseline |
| `finance.spending.monthly` | Finance | Verified expenditure by explicit currency | Founder Investment Ledger | Founder Input Required |
| `finance.commitments.annual` | Finance | Verified recurring commitments by explicit currency | Subscription records | Founder Input Required |
| `finance.revenue.current` | Finance | Verified recognized revenue | Billing provider | Not Connected |
| `finance.runway.months` | Finance | Verified cash / verified monthly net burn | Finance records | Cannot Calculate |

## Display Rules

- Missing data is never zero.
- Currency is always explicit and incompatible currencies are not aggregated without an approved conversion policy.
- Percentages expose numerator, denominator, period, and eligibility rules.
- Repository volume is not labeled product success.
- Architecture complete, locally tested, staging verified, production verified, and customer validated remain separate states.
- A stale metric cannot support a healthy status without an explicit exception.

## Threshold Governance

Thresholds are absent until an accountable owner approves them. The engine supports above-is-worse and below-is-worse rules, but the registry must not fabricate targets. Threshold changes require versioning and an audit record.

## Future Metrics

The registry can extend to onboarding, imported histories, completed Blueprints, Atlas decisions, retention, invitations, sales pipeline, marketing, support, deployment, security, legal, and vendor health. Definitions must be approved before collection or display.
