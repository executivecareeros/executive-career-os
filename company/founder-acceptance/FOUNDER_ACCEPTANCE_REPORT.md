# Founder Acceptance Report — Release 0.6 RC1

> Purpose: Record what the founder directly observed while completing the fictional Executive Opportunity Decision journey.

## Session

- Release candidate: Release 0.6 RC1
- Commit under test: `d80cbaf26330fff875da2b7bc4c2dd681d97c4fe`
- Environment: Local Supabase and local Next.js
- Data classification: Fictional only
- Founder: Cüneyt Şen
- Observer: Codex, acting as Founder Acceptance Director
- Started: 13 July 2026
- Completed: 13 July 2026
- External services changed: No
- Invitations sent externally: No

## Journey Evidence

| Stage | Status | Expected behavior | Observation | Friction, confusion, trust, UX, or delight evidence |
|---|---|---|---|---|
| Invitation | Blocked | Founder creates one expiring invitation and sees its secret once. | Public registration was denied and a valid, expiring local invitation opened the invited-registration screen. The application exposes no founder invitation-creation control, so the acceptance invitation required a local database fixture. | The access boundary is clear and reassuring. Founder self-service invitation operations cannot be accepted through the product; see FA-001. |
| Registration | Passed | Only the matching invited email can register. | The founder's first submission displayed `Invitation is invalid.` The invitation remained valid and Pending. A controlled retry with the exact invited email created the fictional account and reached Welcome. | The invitation link does not preserve or identify the invited email. The generic error clears both fields and led to repeated failure; see FA-002. |
| Email verification | Blocked | Verification succeeds without exposing tokens. | The local Supabase configuration has automatic email confirmation enabled. Registration created an immediately authenticated account, so no verification message or link could be evaluated. | The page promises email verification, but this RC1 environment cannot prove that journey; see FA-003. |
| Login | Passed | Verified account starts a secure session. | The fictional account authenticated successfully, rendered the secure Welcome screen, and accepted the still-pending invitation. | Copy is calm and appropriately positions the Career Ledger. No password or token was recorded. |
| Onboarding | Passed | Accepted invitation provisions one durable Workspace. | The founder completed the fictional profile and accepted the Atlas Promise. Welcome then showed Workspace, Career Ledger, Executive Blueprint, and Atlas as Ready. | A validation mistake in one field erased every previously entered field and forced full re-entry; see FA-004. The Atlas Promise and readiness summary were clear and confidence-building. |
| Professional history | Passed | Confirmed fictional history persists after return. | The founder saved one fictional current-role record. The stage badge changed to Complete and the persisted count became 1. A reload retained the record. | The original page left the completed entry form open and did not guide the founder forward. At the founder's request, FA-007 was corrected: the stage now collapses to a durable confirmation and Blueprint becomes the current stage. |
| Blueprint | Passed | Minimum Blueprint is saved as a preserved revision. | The founder saved the fictional career vision, preferences, compensation floor, travel limit, leadership level, and constraints. The Blueprint badge changed to Complete and an active revision persisted. | The original form remained open and empty after success. At the founder's request, FA-008 was corrected: Blueprint now collapses to a confirmed-revision summary and Opportunity becomes the current stage. |
| Opportunity | Passed | One fictional opportunity and context persist. | The founder saved the fictional executive role, company, location, source, recruiter context, compensation range, facts, unverified claims, constraints, and notes. Opportunity changed to Complete, collapsed, and Atlas assessment became the current stage. | The progressive transition worked naturally after the earlier workflow corrections. |
| Atlas assessment | Passed after correction | Atlas uses only persisted Workspace evidence and preserves unknowns. | Deterministic reasoning preserved confirmed Blueprint, Opportunity, Ledger, and Compensation evidence. FA-011 replaced the original raw JSON with an executive assessment. In the second journey the founder reported that it seemed fine so far. | The corrected view states Wait, Moderate confidence, eight open questions, evidence, conflicts, trade-offs, alternatives, and change conditions in plain language. |
| Decision | Passed after correction | Finalization atomically creates a stable decision. | The selected Wait action created a decision commit and changed Decision Finalized to Complete. | FA-013 removed active rerun/finalization controls after success and added an immutable-preservation acknowledgement. |
| Career Ledger | Passed | One immutable Ledger event exists. | The atomic decision operation reported that the decision snapshot, Career Ledger entry, and follow-up task were created together. The decision commit persisted after logout and return. | The interface does not yet offer a focused link from the workflow confirmation to the Ledger event. |
| Feedback | Passed after correction | Feedback persists privately and appears only in founder triage. | One factual Useful Insight submission persisted privately and remained complete after return. | FA-014 collapsed the completed form and advanced Lifecycle as the current stage. Founder-triage visibility remains covered by automated isolation tests rather than direct founder interaction. |
| Logout | Passed | Session ends and protected pages require sign-in. | Sign out cleared the session and displayed the login screen. | No credential was recorded in acceptance documents. |
| Return later | Passed after correction | Saved workflow resumes after a new session. | The first return incorrectly opened first-time Welcome. FA-015 preserved a validated local return path; retest returned directly to `/beta-workflow`. | Decision, feedback, export, and closure state all persisted. |
| Export request | Passed | Supervised request persists with honest retention status. | Export was recorded as Submitted with founder review and documented retention exceptions. | No export file was generated; this is intentionally a supervised request framework. |
| Account closure request | Passed | Supervised request persists without promising instant deletion. | Account Closure was recorded as Submitted. The note explicitly withheld authorization for immediate deletion. | The account remained usable because this stage records a request rather than executing closure. |

## Automated Prerequisite Evidence

Automated RC1 validation passed before founder interaction: lint, production build, invitation acceptance and replay protection, stale-version rollback, atomic decision idempotency, and feedback/lifecycle isolation. The first sandboxed build attempt could not reach Google Fonts; the same unchanged build passed when network access was allowed. These results are prerequisites, not founder acceptance.

## Evidence Captured

- `screenshots/01-public-registration-blocked.png` — registration without an invitation is denied.
- `screenshots/02-invited-registration.png` — valid fictional invitation opens the intended registration experience; the password field is intentionally empty.
- `screenshots/03-invitation-invalid.png` — sanitized in-product failure state after the founder submission.
- `screenshots/04-welcome-authenticated.png` — authenticated Welcome screen after successful controlled registration and login.
- `screenshots/05-onboarding-empty.png` — onboarding scope and Atlas Promise before data entry.
- `screenshots/06-onboarding-ready.png` — successful Workspace readiness state after the founder re-entered the fictional profile.
- `screenshots/07-beta-workflow-entry.png` — direct entry to the otherwise undiscoverable decision workflow.
- `screenshots/08-history-form-stable.png` — fictional history fields retained after the verified development-origin correction.
- `screenshots/09-history-collapsed-blueprint-current.png` — confirmed history collapsed and Blueprint identified as the current stage.
- `screenshots/10-blueprint-remained-open.png` — Blueprint marked Complete while its empty form remained open.
- `screenshots/11-blueprint-collapsed-opportunity-current.png` — corrected Blueprint summary with Opportunity identified as the current stage.
- `screenshots/12-opportunity-complete-assessment-current.png` — Opportunity collapsed successfully and Atlas assessment identified as the current stage.
- `screenshots/14-atlas-executive-assessment.png` — corrected executive-readable Atlas recommendation and confidence summary.
- `screenshots/15-completed-returned-workflow.png` — completed workflow after logout and successful return, including preserved lifecycle requests.

## Corrected During Acceptance

FA-006 was corrected after the founder asked that the timed form reset be fixed before continuing. Before correction, untouched values cleared within 45 seconds while the development server recorded repeated page reloads. After adding the documented `127.0.0.1` development origin, the same values remained intact for 50 seconds and only the intentional page request was recorded. Production behavior and business logic were unchanged.

FA-007 was corrected after the founder confirmed the history record but remained on the completed entry form. The completed form now renders as a compact preserved-record summary, Blueprint is labeled as the current stage, and successful history submissions redirect to the Blueprint anchor. Persistence logic was unchanged.

FA-008 applied the same accepted progression behavior after the founder saved Blueprint. The completed form now renders as a preserved-revision summary, Opportunity is labeled as the current stage, and successful Blueprint submissions redirect to the Opportunity anchor.

FA-011 replaced the raw persisted reasoning JSON with an executive-readable assessment. The deterministic engine and snapshot were not changed. The decision control now defaults to Atlas's displayed recommendation and remains disabled until reasoning exists.

FA-012 standardized all six stage headings in title case. FA-013 and FA-014 made successful decision and feedback stages visibly final and advanced the next stage. FA-015 corrected returning-user routing by preserving a validated local route and bypassing first-time Welcome for established Workspaces.

## Founder Suggestions Preserved

- FA-009 records the founder-approved CV/resume import. The professional-history stage now creates editable, explicitly reviewed drafts from PDF, DOCX, TXT, Markdown, CSV, and JSON without retaining the raw file.
- FA-010 records the request for examples in blank fields. Concise placeholders were added to history, Blueprint, opportunity, feedback, and lifecycle inputs without entering or fabricating user data.

## Acceptance Result

Completed with blockers. The evidence supports **RETURN TO DEVELOPMENT**; see `RELEASE_DECISION.md`.
