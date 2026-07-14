# Release 0.9 Product Change Assessment

> Purpose: Determine which application changes are genuinely required before the first design partner and which can remain operational processes.

## Evidence Reviewed

The application currently provides founder-only invitation creation, list, status, expiry, acceptance, and revocation; single-use email-bound registration; guided onboarding and decision journey; structured feedback; founder-only feedback and lifecycle triage; workspace isolation; persistence; and logout/return behavior. Release 0.8 acceptance and regression evidence passed for the founder staging journey.

## Required Corrections

| Change | Classification | Status | Evidence |
| --- | --- | --- | --- |
| Replace hard-coded feedback product version `0.6` with the deployed release/revision source | Data integrity defect; Low engineering risk | Complete | Deterministic release-evidence helper and test |
| Replace stale Release 0.6, no-staging, and pre-creation statements in Company Control with factual Release 0.9 operational state | Founder operations defect; Moderate product risk | Complete | Company Control and authoritative operational registers reconciled |

These corrections do not change architecture, workflow, schema, providers, or external state. Deployment remains a separate approval gate.

## Valuable but Not Required for the First Ten

| Change | Classification | Operational fallback | Business value | Estimated effort | Confidence |
| --- | --- | --- | --- | --- | --- |
| Send or resend invitation from Company Control through the verified email provider | Workflow polish | Founder sends the generated link through approved email | Faster delivery and fewer manual mistakes | 1–2 engineering days, subject to existing provider design | Medium |
| Add design-partner lifecycle states beyond invitation status | Founder operations enhancement | Secure off-repository participant register using participant codes | Clearer active/completed/withdrawn cohort control | 1–2 engineering days if implemented without schema expansion; otherwise reassess | Low |
| Expose a release-specific aggregate wave scorecard | Reporting enhancement | Founder uses the Release 0.9 scorecard process and safe aggregates | Faster weekly and wave review | 2–4 engineering days depending on existing data availability | Low |
| Allow feedback after the first journey rather than only the terminal workflow step | Product-learning enhancement | Support email, return interview, and founder observation | Better longitudinal evidence | 1–2 engineering days plus privacy and UX review | Medium |

## Not Recommended

- analytics or session-replay providers;
- CRM, customer-success, or survey platforms;
- new participant or research database domains;
- automated recruitment or bulk invitations;
- generic chat or new Atlas architecture;
- public registration;
- product changes created solely to make ten-person metrics look complete.

## Decision

The required evidence-integrity corrections are complete. Operational readiness is **PASS**; design-partner activation remains blocked by the Definition of Ready gates.
