# Application Control, Mobile Authentication, and LinkedIn Launch Pack — 2026-07-18

## 1. Outcome
Application records can be removed from the active Applications surface without deleting protected decision evidence; session-only authentication remains session-only after refresh; the public mobile header presents a clear Sign in action; and a visually verified LinkedIn Company Page launch pack was delivered to the Founder.

## 2. Highest-ROI Finding
The apparent application was an immutable Pursue decision projection, while refresh logic silently converted non-remembered sessions into persistent sessions. Correcting the product boundary and session contract created more trust than adding another application feature.

## 3. Founder Value Delivered
The Founder can remove the visible record directly beside Prepare next step, review a clearer 390px arrival header, and use a ten-page ready-to-publish LinkedIn launch package.

## 4. Implementation
- Added workspace-scoped hiding of a finalized Pursue record from active Applications.
- Preserved Career Ledger, reasoning snapshot, and audit evidence.
- Preserved the original Remember me choice through token refresh.
- Kept the mobile Sign in action at a 44px minimum target and hid the competing header registration CTA below `sm`.

## 5. User-Facing Changes
Delete record now appears beside Prepare next step. Confirmation copy states exactly what was removed and what remains protected.

## 6. Internal Changes
A private remember-session cookie records persistence intent; refresh no longer upgrades a session-only login.

## 7. ODS 4.0 Compliance
Pass: smallest effective change, evidence preserved, Unknown legal/company fields not inferred, English-only brand, no architecture expansion.

## 8. Founder Backlog Changes
FB-001 and FB-020 evidence updated; percentages remain unchanged pending Founder acceptance.

## 9. Architecture Review
No new storage system, route family, or provider dependency. Existing canonical opportunity payload and workspace boundaries are reused.

## 10. Company Intelligence Review
Not affected.

## 11. Opportunity Intelligence Review
Immutable opportunity reasoning remains preserved.

## 12. Atlas Review
Not affected; protected reasoning evidence is not deleted.

## 13. Website and UX Review
Mobile arrival competition reduced to one header action. Live 390px acceptance remains required after deployment.

## 14. Branding and Logo Review
The Founder-approved Quiet Ascent original Option 5 is used in the LinkedIn launch pack with its approved meaning and canonical palette.

## 15. Executive Rooms Review
Not affected.

## 16. Performance Evidence
No new network request on page render. The delete action adds one scoped read and one scoped update only when invoked. Live latency is Unknown until deployed telemetry is observed.

## 17. Security Review
Pass: authentication required; workspace ID required; opportunity ID format bounded; immutable audit and decision evidence retained; no secrets or private executive data added to the LinkedIn package.

## 18. Observability Review
Existing application and deployment logs apply. No new event instrumentation added.

## 19. CFO Cost Review
Infrastructure cost: unchanged. LinkedIn document and free Page setup require no payment. Premium LinkedIn Page features remain a separate Founder approval gate.

## 20. AI Token Usage
Application runtime target remains 0. No new product AI dependency introduced.

## 21. Tests and Validation
- Application removal/session/mobile source contracts: pass.
- Collected decision database regression: pass.
- Public acquisition: pass.
- TypeScript: pass.
- ESLint: pass.
- Production build: pass (134 routes).
- DOCX render: pass, ten pages visually inspected with no blank, clipped, or overlapping pages.

## 22. Risks
The mobile and Remember me behaviors need authenticated live acceptance after deployment. LinkedIn legal entity, headquarters, size, type, and founding year remain Founder-confirmation fields.

## 23. Technical Debt Added
None.

## 24. Technical Debt Removed
Removed persistence escalation during refresh and ambiguous active-record removal behavior.

## 25. Rollback Plan
Revert the sprint commit. The hiding marker is non-destructive; removing the UI/filter restores presentation without data recovery.

## 26. Commit
Pending at report creation.

## 27. Repository Status
Validated working tree pending intentional commit.

## 28. Staging Status
Pending deployment.

## 29. Production Status
Pending deployment.

## 30. Screenshots or Visual Evidence
LinkedIn launch pack render: ten-page contact-sheet review. Live 390px route evidence pending deployment.

## 31. Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Website Redesign | 🟠 Founder Review Required | 82% | High | Validate the deployed 390px arrival and full route consistency |
| Homepage Redesign | 🟠 Founder Review Required | 90% | High | Complete Founder comprehension and conversion review |
| Branding & Logo | 🟠 Founder Review Required | 86% | High | Validate live header/favicon and publish the LinkedIn identity |
| Company Intelligence | 🟠 Founder Review Required | 94% | Critical | Expand verified official enrichment |
| Atlas Improvements | 🟡 In Progress | 65% | Critical | Extend canonical context and validate usefulness |
| Executive Rooms | 🟡 In Progress | 96% | High | Complete multi-executive live acceptance |
| Executive Workspace | 🟡 In Progress | 78% | High | Validate active-record removal and the full application lifecycle |
| Knowledge Graph | 🟡 In Progress | 73% | Medium | Expand evidence-backed entity relationships |
| Trust Engine | 🟡 In Progress | 67% | Medium | Complete live evidence and confidence coverage |

## 32. Top 10 Highest-ROI Remaining Tasks
1. Live mobile/auth/application deletion acceptance.
2. Landing-to-first-useful-opportunity conversion measurement.
3. Company official-domain enrichment.
4. Atlas recommendation calibration.
5. Opportunity duplicate correction.
6. Search acceptance across one-field filters.
7. Full application lifecycle validation.
8. Real multi-executive Rooms validation.
9. Legal/privacy launch readiness.
10. Founder LinkedIn Page publication after factual-field confirmation.

## 33. Recommended Next Sprint
Deploy and complete the authenticated 390px product journey, because the changes are user-facing and Founder acceptance—not additional implementation—is the next evidence gate.

## 34. Questions Requiring Founder Decision
Confirm the legal entity name, headquarters, company-size band, organization type, and founding year before entering those fields on LinkedIn.

## 35. Final CTO Recommendation
Deploy the validated changes, test Delete record and Remember me in production, then use the prepared free LinkedIn Page package without purchasing premium features.
