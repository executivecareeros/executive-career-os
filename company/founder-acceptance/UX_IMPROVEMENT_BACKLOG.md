# UX Improvement Backlog

> Purpose: Prioritize verified experience issues discovered during founder acceptance without expanding product scope.

## Critical

### UX-001 — Core Beta Journey is unavailable to the bootstrapped founder

- Evidence: Dashboard `Continue Beta Journey` opens `/beta-workflow`, which reports `Workflow unavailable` and `Beta workflow was not provisioned for this invitation.`
- Impact: Professional History, Blueprint, Opportunity, Atlas Assessment, Decision, Career Ledger, and Feedback cannot be completed naturally.
- Expected correction: The authorized founder's existing Workspace should enter the same guided journey without weakening invitation or authentication controls.
- Acceptance: The founder reaches Professional History from the dashboard and completes the full journey without typing a URL.

### UX-002 — Fictional records appear as personal founder intelligence

- Evidence: Workspace, Blueprint, Opportunities, Atlas, Reasoning, Archive, Tasks, and Productivity display fictional members, career goals, decisions, deadlines, and 55 ledger entries.
- Impact: The system appears to invent career history and recommendations, directly contradicting the trust promise.
- Expected correction: New live workspaces show truthful empty states. Demonstration scenarios must be isolated from authenticated personal state.
- Acceptance: A new founder sees zero personal records until they create or confirm them.

### UX-014 — Returning founder is redirected to blank onboarding

- Evidence: After a successful logout and login, the requested `/company-control/invitations` return path was ignored and the bootstrapped founder arrived at a blank `/onboarding` form. Selecting the product logo opened the existing Dashboard.
- Impact: The product simultaneously treats the same founder as new and established, making durable Career Memory appear unreliable.
- Expected correction: Resolve onboarding completion from authoritative founder Workspace state and honor the validated protected return destination.
- Acceptance: Logout, login, and return restore the founder to the requested protected page without showing onboarding again.

## High

### UX-003 — Company Control contains stale staging facts

- Evidence: The live staging page still claims staging resources have not been created and Vercel/Supabase are not connected.
- Impact: Founder operational decisions cannot rely on the control surface.
- Expected correction: Remove or clearly mark superseded snapshots and show only current factual status.

### UX-004 — Atlas defaults to technical diagnostics

- Evidence: Reason codes, evidence identifiers, engine status, agent health, and architecture language dominate the assistant view.
- Impact: Atlas feels like software telemetry rather than an executive Chief of Staff.
- Expected correction: Lead with recommendation, rationale, evidence quality, unknowns, and next action; move diagnostics behind an explicit founder/debug control.

### UX-005 — Navigation is too broad for a first executive journey

- Evidence: The sidebar exposes more than twenty modules, including repositories and operational surfaces.
- Impact: The user must distinguish core career work from system architecture and future modules.
- Expected correction: Prioritize Today, Career Profile, Opportunities, Atlas, Decisions, and Settings; keep founder operations separately grouped.

## Medium

### UX-006 — Invitation Management reports stale delivery mode

- Evidence: The page states `Email delivery is not connected` and disables resend although verified staging transactional email is operational.
- Impact: Founder cannot trust invitation delivery status.

### UX-007 — Tablet layout clips Invitation Management

- Evidence: Captured staging viewport clips the page heading and right-hand Delivery panel.
- Impact: Controls and status are partially unavailable at a common device width.

### UX-008 — Page transitions are slow and unexplained

- Evidence: Most inspected authenticated routes required approximately four seconds to become inspectable.
- Impact: The product feels heavy and may appear stalled.
- Expected correction: Measure route latency, reduce avoidable work, and show a restrained loading state when delay remains.

### UX-009 — Brand and product naming are inconsistent

- Evidence: The interface alternates among Orendalis, Executive Career OS, Atlas Executive OS, Executive Career Agent, and AI Assistant.
- Impact: The executive cannot form a clear mental model of the company, product, and Atlas role.

### UX-010 — Company Control lacks executive prioritization

- Evidence: Approximately sixty headings compete on one page.
- Impact: Important operational decisions are buried in inventory and historical detail.

### UX-015 — Primary action lacks a visible keyboard focus indicator

- Evidence: The focused `Continue Beta Journey` link exposed neither an outline nor a box-shadow focus treatment during the keyboard check.
- Impact: Keyboard users may not know which action will be activated.
- Expected correction: Apply a consistent high-contrast `:focus-visible` treatment across interactive controls.

## Low

### UX-011 — Technical vocabulary leaks into executive copy

- Evidence: Phrases such as `deterministic workspace`, `architecture observability`, `DATA_COMPLETENESS`, and `evidence systems operational` appear in primary views.
- Impact: Copy sounds engineered rather than advisory.

### UX-012 — Login introduces an unapproved public-registration path

- Evidence: Login includes `Begin your Career Memory` linking to registration despite private access positioning.
- Impact: The pathway may confuse invited-access expectations even if server authorization remains secure.

## Nice-to-have

### UX-013 — Preserve a compact evidence drill-down

Keep Atlas evidence, unknowns, trade-offs, alternatives, and change conditions available through progressive disclosure after the executive summary.
