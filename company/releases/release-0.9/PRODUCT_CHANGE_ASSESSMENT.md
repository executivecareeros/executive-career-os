# Release 0.9 Product Change Assessment

> Purpose: Determine which application changes are genuinely required before the first design partner and which can remain operational processes.

## Evidence Reviewed

The application currently provides founder-only invitation creation, list, status, expiry, acceptance, and revocation; single-use email-bound registration; guided onboarding and decision journey; structured feedback; founder-only feedback and lifecycle triage; workspace isolation; persistence; and logout/return behavior. Release 0.8 acceptance and regression evidence passed for the founder staging journey.

## Required Before Partner 1

| Change | Classification | Why required | Business value | Estimated effort | Confidence |
| --- | --- | --- | --- | --- | --- |
| Replace hard-coded feedback product version `0.6` with the deployed release/revision source | Data integrity defect; Low engineering risk | Release 0.9 feedback would otherwise be attributed to the wrong product version, weakening evidence and regression analysis | Trustworthy learning evidence and traceable remediation | 0.5–1 engineering day including tests | High |
| Replace stale Release 0.6, no-staging, and pre-creation statements in Company Control with factual Release 0.9 operational state | Founder operations defect; Moderate product risk | Company Control is the founder’s invitation and feedback surface; stale readiness claims could produce incorrect invitation decisions | Safer wave gates, lower operating confusion, and reliable founder control | 1–2 engineering days including responsive and regression validation | Medium |

These corrections require a separately approved implementation, staging deployment, and acceptance pass. They do not require a new domain, database schema, provider, or architecture.

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

The operating design is complete, but Release 0.9 is not ready to activate. Two bounded product corrections are required before the first invitation. Therefore the release decision is **RELEASE 0.9 REQUIRES PRODUCT CHANGES**.
