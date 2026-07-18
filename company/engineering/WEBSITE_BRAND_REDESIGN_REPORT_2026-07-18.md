# Website and Brand Redesign — Engineering Report

> Date: 2026-07-18 · ODS 4.0 · Founder review candidate

## 1. Outcome
A new ORENDALIS visual system and original Intelligence Orbit mark are implemented across the public website, authentication, shared application shell, navigation, cards and actions.

## 2. Highest-ROI Finding
The old beige/black system made actions and hierarchy ambiguous. A smaller semantic palette and predictable navigation layer improved clarity more than adding decorative content.

## 3. Founder Value Delivered
The first viewport now explains the Opportunity Universe, Atlas, evidence, privacy and the next action without internal terminology.

## 4. Implementation
Implemented the Intelligence Orbit mark, Midnight/Cobalt/Mint palette, Geist display hierarchy, redesigned landing page, authentication frame, sidebar, mobile header, page headers, cards and primary/secondary actions.

## 5. User-Facing Changes
Visitors now see one clear promise, CV and opportunity entry points, an Atlas briefing preview, three product principles and an explicit trust statement. Signed-in executives receive a calmer white navigation layer and consistent controls.

## 6. Internal Changes
The token layer now establishes semantic canvas, surface, ink, muted, border, action, signal and Atlas colors. No application workflow or data behavior changed.

## 7. ODS 4.0 Compliance
The redesign prioritizes executive judgment, evidence visibility, simplicity, accessibility, zero runtime AI and reusable components.

## 8. Founder Backlog Changes
FB-001 70→82%; FB-002 80→90%; FB-003 75→86%; FB-004 100→95% because a new mark requires Founder acceptance; FB-005 75→82%.

## 9. Architecture Review
No architecture changed. Shared components and CSS tokens carry the system; page-specific forks were avoided.

## 10. Company Intelligence Review
No data or logic changed. The visual system is ready to present confidence, freshness and provenance consistently.

## 11. Opportunity Intelligence Review
No ranking or reasoning changed. Opportunity actions inherit clearer primary/secondary states.

## 12. Atlas Review
Atlas received a distinct but related direction mark. Its brand remains advisory and visually subordinate to ORENDALIS.

## 13. Website and UX Review
Desktop local renders of `/` and `/login` passed visual inspection. Hierarchy, actions, contrast, spacing and English-only surfaces were verified. Full 390px and authenticated route acceptance remain pending.

## 14. Branding and Logo Review
The Intelligence Orbit uses a complete orbit for career context, an ascending evidence path for direction and a mint origin point for executive agency. It is original, legible, compact and code-native.

## 15. Executive Rooms Review
No change.

## 16. Performance Evidence
Production build remains 126 routes. No client image bundle or external runtime font request was added; Next.js self-hosts existing Geist assets.

## 17. Security Review
No auth, permission, data, provider or infrastructure boundary changed.

## 18. Observability Review
No new telemetry. Homepage comprehension and conversion remain Unknown until measured with target users.

## 19. CFO Cost Review
No provider, font-license, infrastructure or runtime AI cost added. The logo is native SVG and the interface uses existing dependencies.

## 20. AI Token Usage
Runtime AI tokens: 0.

## 21. Tests and Validation
Passed: public acquisition, Project Simplicity, Executive Experience Contract (100% coverage), ESLint, TypeScript and production build (126 routes). Desktop browser render passed for homepage, login and authenticated shell.

## 22. Risks
Founder may prefer a different mark direction. Remaining legacy route-specific colors may still drift. Mobile, keyboard, contrast and screen-reader acceptance are not yet complete.

## 23. Technical Debt Added
The social preview PNG still requires regeneration after Founder accepts the mark.

## 24. Technical Debt Removed
Removed the visible public language selector, Georgia display dependency, beige/black control ambiguity and inconsistent accent semantics from shared surfaces.

## 25. Rollback Plan
Revert the redesign commit. No schema, data or infrastructure rollback is required.

## 26. Commit
Prepared as `Redesign ORENDALIS executive experience`; final hash reported after commit.

## 27. Repository Status
Expected clean after commit and push.

## 28. Staging Status
Not yet deployed in this cycle.

## 29. Production Status
Unchanged.

## 30. Screenshots or Visual Evidence
Current local desktop renders reviewed on commit candidate: public `/`, authenticated `/`, and `/login`, 1280×720. Historical screenshots were not used.

## 31. Top 10 Highest-ROI Remaining Tasks
1. Founder selects or accepts the Intelligence Orbit mark.
2. Deploy to isolated staging.
3. Validate public and authenticated journeys at 390px.
4. Complete keyboard/focus acceptance.
5. Complete WCAG contrast and screen-reader audit.
6. Reconcile remaining legacy route colors with semantic tokens.
7. Regenerate social preview after mark approval.
8. Measure 30-second homepage comprehension with target executives.
9. Measure landing-to-first-useful-opportunity time.
10. Run Founder visual acceptance across desktop and mobile.

## 32. Recommended Next Sprint
**Website Redesign Acceptance.** Deploy the candidate to staging, run desktop/390px/keyboard/accessibility checks and collect Founder visual decisions before polishing low-value details.

## 33. Questions Requiring Founder Decision
Accept the Intelligence Orbit direction or request one bounded alternative round. Choose only after viewing it in the homepage, authentication and application shell contexts.

## 34. Final CTO Recommendation
Deploy this candidate to staging for Founder review. Preserve the system unless user testing identifies concrete comprehension or accessibility defects.

## 35. Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Website Redesign | Founder Review Required | 82% | High | Validate staging desktop and 390px journey |
| Homepage Redesign | Founder Review Required | 90% | High | Measure 30-second comprehension |
| Branding & Logo | Founder Review Required | 86% | High | Review Intelligence Orbit mark and complete route matrix |
| Company Intelligence | Founder Review Required | 92% | Critical | Review populated company briefings |
| Atlas Improvements | In Progress | 70% | Critical | Complete unified conversation/history UX |
| Executive Rooms | Planned | 5% | High | Conduct safe MVP discovery |
| Executive Workspace | In Progress | 65% | High | Integrate remaining workspace capabilities |
| Knowledge Graph | In Progress | 55% | High | Add remaining entity relationships |
| Trust Engine | In Progress | 45% | High | Unify product-wide trust facts |
