# Atlas 2.2A Founder Product Corrections

Date: 2026-07-17  
Owner: Sol  
Status: Product corrections validated; coverage expansion continues

## Founder observations

| Observation | Disposition | Evidence |
|---|---|---|
| Opportunity coverage is too narrow and engineering-heavy | Continuing | The live network remains 1,042 canonical opportunities, including 157 classified executive opportunities. Greenhouse, Lever, and Ashby are live; Recruitee, Personio, Workable, and company-career adapters remain expansion-ready but may not be counted as live without run evidence. |
| Atlas is not immediately visible | Implemented | Every collected opportunity now opens with an Atlas Executive Briefing containing recommendation, confidence, strengths, risks, unknowns, and the next investigation action. |
| Opportunity Review starts with the wrong context | Implemented | The review order is Role, Responsibilities, Business impact, Leadership expectations, Career opportunity, Required capabilities, then Company analysis and provenance. |
| Matching underuses executive background | Implemented | Best Match now uses confirmed role titles, industries, technologies, and responsibilities alongside geographic eligibility and preferences. Legacy notes and unknown fields are not promoted into evidence. |
| Scores cluster too closely | Implemented | Duplicate professional-fit terms were removed from the weighted score. Role-family, capability, and industry evidence now create deterministic separation; hard eligibility caps still override fit. |
| Product interactions and brand behavior need polish | Implemented in scope | Recommendation cards are the default authenticated view, actions have visible transition feedback, and both desktop and mobile ORENDALIS marks return Home. A broader visual redesign was deliberately deferred because it would exceed the correction scope. |

## Validation

- Commercial leadership ranks above an otherwise equivalent engineering role for a confirmed commercial executive profile.
- A US-residence-only role remains capped at 20 and below eligible EU opportunities.
- Atlas review preserves Confirmed, Estimated, and Unknown evidence labels.
- Atlas Decision Workspace persistence and immutable review history remain unchanged.
- TypeScript, ESLint, focused Atlas suites, founder-correction acceptance checks, and production build pass.

## Remaining highest-value work

Increase live executive opportunity coverage through measured, lawful employer cohorts. Provider adapters or fixture certification alone are not inventory growth and must never be reported as such.
