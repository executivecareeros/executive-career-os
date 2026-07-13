# Release 0.6 Private Beta Readiness

> Purpose: Define and audit the single Executive Opportunity Decision journey required before Orendalis may invite 3–5 executive design partners.

## Beta Promise

The release is limited to one journey: create and verify an account, establish a minimal professional and Blueprint context, enter one opportunity, receive an evidence-backed Atlas assessment, inspect uncertainty and trade-offs, choose a next action, preserve a decision snapshot, and provide structured feedback.

Atlas remains decision support. It does not predict hiring success, make applications, provide legal or financial authority, or act without approval.

## Current-State Workflow Matrix

| User step | Current route | Current component or service | Current repository | Persistence | Production readiness | Security dependency | Known limitation | Required correction |
|---|---|---|---|---|---|---|---|---|
| Register | `/register` | `registerAction`, `supabaseAuth.signUp` | Supabase Auth | Provider-backed in Supabase mode | Partial | Production Supabase, redirect allowlist, invitation control, rate limits | Registration is open when route is reachable; no founder invitation gate | Add founder-controlled invitation enforcement and production acceptance tests |
| Verify email | Provider redirect to `/login` | Supabase Auth verification redirect | Supabase Auth | Provider-backed | Unverified | Mail delivery, redirect URL, DKIM/email readiness | No production verification evidence | Test on staging with controlled fictional identity |
| Login / Remember Me | `/login` | `loginAction`, secure cookie helpers | Supabase Auth | Provider-backed | Partial | Secure cookies, HTTPS, session refresh, revocation | No staging or production acceptance evidence | Run end-to-end acceptance and fail-closed tests |
| Password recovery | `/forgot-password`, `/reset-password` | Recovery and reset server actions | Supabase Auth | Provider-backed | Partial | Redirect allowlist and mail delivery | Invalid/expired link experience not accepted | Add browser acceptance and provider tests |
| Workspace provisioning | `/onboarding` | `onboardingAction`, `SupabaseOnboardingRepository` | `provision_personal_workspace` RPC | Provider-backed | Locally runtime-tested | Auth identity, RLS, idempotent function | No production acceptance | Apply migrations to isolated staging and verify retry behavior |
| Secure onboarding | `/onboarding` | Single onboarding form | Supabase profile and workspace | Partial | Needs refinement | Consent/version recording | Does not explain beta mode, corrections, retention, support, or completion time | Narrow first-session content and record versioned acceptance |
| Import or manual history | `/import`, `/import/history` | `ImportWorkspace` | Client state only | None | Not ready | File policy, privacy, workspace isolation | Starts with fictional demo records; extraction and consent are not persisted | Remove demo defaults in authenticated mode; persist only reviewed records through repositories |
| Review and confirmation | `/import/review` | `ImportWorkspace` review UI | Client state only | None | Not ready | Provenance, consent, append-only ledger | Cross-route client state is not durable; confirmation does not write | Add server-backed review session and atomic confirmed append |
| Minimum Blueprint | `/blueprint` | `BlueprintWorkspace` | Demonstration dataset | Demo only | Not ready | Workspace isolation and revision history | No authenticated minimal-Blueprint write journey | Add minimal fields, completeness gate, and append-only revision persistence |
| Add one opportunity | `/opportunities` | `OpportunitiesWorkspace` | Demonstration dataset | Demo only | Not ready | Workspace isolation | No create route or form | Add one guided, repository-backed opportunity form |
| Company context | Opportunity/company pages | Demo company components | Demonstration dataset | Demo only | Not ready | Workspace isolation | Cannot attach user-confirmed company facts | Capture minimal company facts inside guided decision record |
| Compensation context | `/compensation` and opportunity detail | Demo compensation timeline | Demonstration dataset | Demo only | Not ready | Separate compensation permission | No opportunity-specific authenticated entry; currencies can be incompatible | Add voluntary, explicit-currency inputs and unknown handling |
| Atlas assessment | `/reasoning`, opportunity details | Deterministic reasoning engine and demo workspace | Demo reasoning data; Supabase snapshot repository exists | Architecture available | Partial | Confirmed evidence only, workspace isolation | UI does not run from the partner's persisted record | Wire persisted inputs through deterministic engine and save output |
| Explainability | `/reasoning` | `ReasoningWorkspace` | Demo reasoning record | Demo only | Partial design | Evidence provenance | Artifacts are strong but not tied to user data | Bind every artifact to confirmed inputs and source references |
| Next action | `/decision-workspace`, tasks | Demo productivity workspace | Demo data | Demo only | Not ready | User approval | No persisted selection | Persist explicit Apply/Wait/Reject/Monitor/Negotiate/Network First choice |
| Decision snapshot | No guided completion route | `AtlasRepository`, reasoning repository contracts | Append-only Supabase tables/repositories | Architecture available | Not accepted | Append-only enforcement, correlation IDs | No end-to-end UI transaction | Add atomic snapshot append and test overwrite/delete denial |
| Career Ledger | `/archive` | Ledger panels | Demonstration dataset | Demo UI; append-only database exists | Partial architecture | Append-only RLS | Guided journey does not append a decision event | Append decision event in the accepted transaction |
| Structured feedback | None | None | None | None | Not ready | Workspace isolation, privacy, screenshot policy | No user form or founder triage | Add minimal isolated feedback repository, form, and founder-only triage |
| Account settings | `/settings` | Placeholder product page | None | None | Not ready | Identity, session, consent | No beta support, export, deletion, or closure controls | Keep collection blocked until lifecycle controls exist |
| Export and deletion | No user workflow | Documentation boundaries only | No accepted runtime workflow | None | Blocker for real personal data | Identity verification, retention, audit | Warning text is insufficient | Implement or technically prevent real-personal-data collection |

## Scope Freeze

### In scope

- Authentication and invitation-only access
- Narrow onboarding and consent
- Manual or safe deterministic history import with review
- Minimum viable Blueprint
- One opportunity evaluation with company and compensation context
- Deterministic Atlas assessment and explainability
- Next-action selection and immutable decision snapshot
- Structured feedback and founder support

### Out of scope

Automatic applications, live discovery, autonomous email or calendar actions, WhatsApp automation, billing, public campaigns, enterprise workspaces, team collaboration, hidden AI reasoning, large knowledge feeds, public APIs, mobile apps, and broad Atlas Operations integrations.

## Readiness Classification

Current decision: **D. NOT READY**.

The architecture is substantial, but the central user journey is not durably connected after onboarding. Staging, production isolation acceptance, backup/restore proof, monitoring, lifecycle controls, legal review, and founder acceptance also lack evidence.

## Critical Gates

1. Invitation-only authentication and staging acceptance
2. Persistent reviewed import and minimal Blueprint
3. Persistent single-opportunity decision workspace
4. Append-only decision and ledger transaction
5. Isolated feedback submission and founder triage
6. Export, deletion, retention, consent withdrawal, and account closure control
7. Production database isolation evidence
8. Successful backup and restore exercise
9. Minimum monitoring and incident alerts
10. Founder-approved legal and consent materials
11. Founder acceptance using fictional data

No real personal data may be collected until these gates are evidenced or collection is technically blocked.
