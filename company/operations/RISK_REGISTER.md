# Risk Register

> Purpose: Maintain a living record of material uncertainty, exposure, ownership, mitigation, and review.

Likelihood and impact use `Low`, `Medium`, `High`, or `Critical`. Status uses `Open`, `Monitoring`, `Mitigating`, `Accepted`, or `Closed`.

| ID | Category | Risk | Likelihood | Impact | Mitigation / Control | Owner | Review Date | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | Business | Product value is not sufficiently validated with executives | Medium | High | Founder-led research, private beta evidence, explicit success criteria | Founder | Monthly | Open |
| R-002 | Technical | Architectural breadth exceeds current operational capacity | Medium | High | Maintain boundaries, prioritize measured needs, review technical debt | Founder / Engineering | Quarterly | Monitoring |
| R-003 | Operational | Critical processes depend on undocumented founder knowledge | High | High | Operating manuals, decision logs, recovery records, delegated owners | Founder | Monthly | Mitigating |
| R-004 | Security | Single administrative account or device creates access concentration | Medium | Critical | MFA/passkeys, recovery controls, backup authority, access reviews | Founder / Security | Monthly | Mitigating |
| R-005 | Legal | Privacy, employment, company, or product obligations are incomplete | Medium | High | Maintain legal register and seek qualified jurisdiction-specific counsel | Founder | Quarterly | Open |
| R-006 | Financial | Unknown recurring costs and limited runway visibility impair decisions | Medium | High | Complete investment ledger, subscription register, cash forecast | Founder / Finance | Monthly | Mitigating |
| R-007 | Vendor | GitHub, Microsoft, Supabase, Vercel, registrar, or AI-provider dependency disrupts operations | Medium | High | Provider-independent architecture, exports, rollback, recovery, status monitoring | Functional owner | Quarterly | Monitoring |
| R-008 | Single founder | Founder unavailability stops critical decisions and recovery | Medium | Critical | Authority matrix, continuity plan, backup administrator, secure recovery | Founder | Quarterly | Open |
| R-009 | Security | Production data or secrets are exposed through configuration or access error | Low | Critical | Least privilege, RLS, secret controls, reviews, tests, incident plan | Security / Engineering | Monthly | Mitigating |
| R-010 | Operational | Microsoft DKIM synchronization delays email migration | Medium | Medium | Preserve current routing, change freeze, timed recheck, support escalation after threshold | Founder / Operations | 2026-07-14 | Monitoring |
| R-011 | Product | The primary beta journey is locally durable but lacks staging and founder acceptance evidence | Medium | Critical | Execute the fictional founder acceptance script in isolated staging before invitations | Founder / Product | Before staging | Mitigating |
| R-012 | Privacy | Lifecycle request intake exists, but export packaging and destructive execution are not accepted | High | Critical | Limit all preparation to fictional or sanitized data until technical and legal controls pass | Founder / Security | Before real data | Mitigating |
| R-013 | Reliability | Backup and restore capability has policy but no successful exercise | High | Critical | Run an isolated provider-backed restore exercise with fictional data before beta | Founder / Infrastructure | Before production acceptance | Open |
| R-014 | Operations | No accepted production monitoring or founder alert path exists | High | High | Approve a minimal provider, configure safe signals, and test escalation before invitations | Founder / Infrastructure | Before staging acceptance | Open |
| R-015 | Delivery | CI is defined but has not executed in the GitHub organization | Medium | High | Run required checks after founder-approved repository integration; do not treat configuration as evidence | Founder / Engineering | Before staging | Open |

Add evidence references without secrets. Closed risks remain in history with closure date and rationale.
## Founder bootstrap risks

| Risk | Likelihood | Impact | Mitigation | Owner | Review |
|---|---|---|---|---|---|
| Fresh environment cannot establish its first Owner | Low after staging acceptance | Critical | One-time verified, configured-email bootstrap with atomic creation and immutable shutdown audit | Founder / Security | Before staging acceptance |
| Bootstrap is replayed or used by another account | Low | Critical | Auth-derived identity, verified-email equality, advisory lock, singleton audit constraint, and permanent configuration lock | Security | After first bootstrap |
| SQL Editor history causes earlier migrations to be rerun | Medium | High | Apply only `202607130011`, verify checksum, preserve manual inventory, and baseline before automated pushes | Database Owner | Before migration |
