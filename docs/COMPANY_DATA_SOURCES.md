# Company Data Sources

> Purpose: Define the provider-independent registry and approval boundary for every future source feeding the Orendalis Company Control Center.

## Registry Contract

Each source exposes name, provider, connection state, authorization state, last synchronization, freshness, scopes, owner, health, error, imported record count, next update, and source reference.

## Current Sources

| Source | State | Authority | Current use |
|---|---|---|---|
| Local Git repository snapshot | Connected manually | No provider authorization | Baseline engineering counts |
| Company operational documents | Partially Connected | No provider authorization | Risks, readiness, assets, finance gaps |
| Microsoft support case log | Partially Connected | Safe recorded metadata | Case `2607130050001139` |
| Supabase | Not Connected | Approval Required | No live aggregate metrics |
| GitHub API | Not Connected | Approval Required | No live repository telemetry |
| Vercel | Not Connected | Approval Required | No deployment claims |
| Microsoft 365 / Outlook | Not Connected | Approval Required | No mailbox monitoring |
| Porkbun / DNS | Not Connected | Approval Required | No live domain monitoring |
| Product analytics | Not Connected | Approval Required | No user or activation metrics |
| Billing provider | Not Connected | Approval Required | No revenue metrics |

## Adapter Boundary

Future adapters translate provider responses into canonical observations. Atlas and UI components consume only normalized Company Intelligence contracts. Provider tokens, identifiers, retry semantics, and payload types remain inside adapters.

Potential adapters include internal repositories, Supabase, GitHub, Vercel, Microsoft 365, Outlook, Microsoft Support, Porkbun, DNS/RDAP, analytics, billing, support, marketing, accounting, bank exports, calendar, and task systems.

## Approval Sequence

1. Define the business purpose and minimum fields.
2. Review provider terms, privacy, cost, and data location.
3. Approve the minimum read-only scopes.
4. Store credentials in provider-managed or approved secret storage.
5. Test against non-destructive data.
6. Verify normalization, freshness, duplicate handling, and failure states.
7. Record the source owner and recovery process.
8. Obtain founder approval before live activation.

Write capability requires a separate review and cannot be inferred from read approval.

## Freshness

Freshness is calculated from the observation timestamp and approved maximum age. `Current`, `Aging`, `Stale`, `Unknown`, and `Not Connected` are distinct. A source failure preserves the last observation with stale status; it must not replace it with zero.

## Security and Privacy

- Aggregate user metrics only on the main dashboard.
- No mailbox bodies, secrets, tokens, phone numbers, or private user records in the repository.
- No broad OAuth scopes without independent approval.
- Record sync outcomes and errors without copying sensitive payloads.
- Revoke unused connections.

## Failure and Recovery

Adapters must use bounded retries and stable correlation identifiers. Duplicate events collapse before alerting. A failed source reports `Error` or stale data and identifies the last successful synchronization. Recovery requires retesting before a source returns to healthy.
