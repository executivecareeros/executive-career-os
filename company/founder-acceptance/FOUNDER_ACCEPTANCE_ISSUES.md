# Founder Acceptance Issue Register

> Purpose: Preserve every verified defect, trust concern, friction point, confusion, and executive-experience concern discovered during RC1 acceptance.

## Severity

`Critical`, `High`, `Medium`, `Low`, and `Suggestion` follow `company/beta/ISSUE_SEVERITY.md`. Impact determines severity.

## Register

### FA-001 — Founder cannot create or manage a private-beta invitation in the product

- Severity: High
- Status: Resolved
- Stage: Invitation
- Reproduction steps:
  1. Sign in as the configured founder.
  2. Open the founder Company Control surface.
  3. Attempt to create an expiring invitation for a fictional Executive Design Partner.
- Expected result: A founder-only control creates one expiring invitation, displays its secret once, and exposes status without revealing the secret again.
- Actual result: The founder-only Company Control surface now creates, lists, and revokes invitations; shows a secure development link once; and records Pending, Accepted, Expired, and Revoked states.
- Evidence or screenshot: Founder retest on 13 July 2026 created a fictional invitation in Company Control, opened its generated link, registered the matching fictional account, completed onboarding, and observed the invitation change to Accepted. The same route returned 404 for the invited non-founder account.
- Probable subsystem: Founder operations / invitation administration
- Regression risk: Medium. Adding a control could weaken authorization or expose invitation secrets unless it reuses the existing permissioned server contract.
- Trust impact: High for private-beta operations because the founder cannot independently invite the first Executive Design Partner through the approved product.
- Workaround: None required for development-mode invitation delivery. Email resend remains explicitly unavailable until verified email infrastructure is connected.
- Retest evidence: Passed on 13 July 2026. Deterministic tests also cover creation, listing, duplicate prevention, expiry, revocation, replay prevention, state transitions, founder authorization, and unauthorized access.

### FA-002 — Invitation registration loses email context and gives a non-recoverable generic error

- Severity: Medium
- Status: Open
- Stage: Registration
- Reproduction steps:
  1. Open a valid invitation link.
  2. Submit without the exact invited email or return to the form after an invalid submission.
  3. Observe the error and form state.
- Expected result: The experience safely identifies which email class must be used, preserves non-sensitive form context where appropriate, and explains how to recover without revealing whether another address is invited.
- Actual result: The page reports only `Invitation is invalid.` and clears the email field. The valid token remains Pending, but the invitee has no in-product recovery guidance.
- Evidence or screenshot: `screenshots/03-invitation-invalid.png`. A controlled retry with the exact fictional email reached Welcome.
- Probable subsystem: Registration form / invitation inspection error handling
- Regression risk: Low to Medium. Error improvements must preserve protection against invitation and account enumeration.
- Trust impact: Medium. A valid invite appears broken and encourages repeated submissions.
- Workaround: Re-enter the exact invited email and password.
- Retest evidence: Pending.

### FA-003 — RC1 acceptance environment bypasses email verification

- Severity: High
- Status: Open
- Stage: Email verification
- Reproduction steps:
  1. Register a fictional account with a valid invitation in the local RC1 environment.
  2. Observe the post-registration authentication state.
- Expected result: Registration pauses until the fictional mailbox verification link is used, after which login becomes available.
- Actual result: Local Supabase automatically confirms the account and returns an authenticated session. No verification email or verification link is exercised.
- Evidence or screenshot: `screenshots/04-welcome-authenticated.png`; local auth configuration reported automatic confirmation enabled.
- Probable subsystem: Acceptance environment / local Supabase auth configuration
- Regression risk: High if staging is approved without independently proving verification and redirect handling.
- Trust impact: High for release assurance; this does not prove a production authentication defect, but it leaves a required security journey unaccepted.
- Workaround: Execute the verification stage in an isolated staging auth environment with confirmation enabled.
- Retest evidence: Pending.

### FA-004 — One onboarding validation error erases every completed field

- Severity: Medium
- Status: Open
- Stage: Onboarding
- Reproduction steps:
  1. Complete the onboarding fields with fictional information.
  2. Enter an invalid value in one field, observed by the founder in Preferred language.
  3. Submit the form and return to correct the error.
- Expected result: The invalid field is identified inline and all valid entries remain available for correction and resubmission.
- Actual result: All entered fields are cleared, forcing the executive to restart onboarding from the beginning.
- Evidence or screenshot: Founder observation on 13 July 2026. `screenshots/06-onboarding-ready.png` records successful completion after full re-entry; the reset state was not captured at the moment it occurred.
- Probable subsystem: Onboarding server action / form-state and validation-error handling
- Regression risk: Medium. A correction must preserve server validation and avoid putting professional data into URL query parameters.
- Trust impact: Medium. Losing carefully entered executive context suggests that longer future forms may also be fragile.
- Workaround: Re-enter every field and resubmit.
- Retest evidence: Pending.

### FA-005 — The accepted beta decision workflow is not discoverable after onboarding

- Severity: High
- Status: Open
- Stage: Transition from Onboarding to Professional History
- Reproduction steps:
  1. Complete invited onboarding.
  2. Select `Enter Executive Career OS`.
  3. Attempt to begin the Release 0.6 Executive Opportunity Decision journey from the dashboard or navigation.
- Expected result: A clear next action opens the accepted decision journey.
- Actual result: The founder lands on a general dashboard whose primary action is professional-history import. No navigation item or dashboard action exposes `/beta-workflow`; direct URL navigation is required.
- Evidence or screenshot: `screenshots/06-onboarding-ready.png`; source and rendered navigation contain no beta-workflow destination.
- Probable subsystem: Post-onboarding information architecture / application navigation
- Regression risk: Low if the existing workflow is linked without duplicating layout or weakening route protection.
- Trust impact: High for founder acceptance because an invited design partner cannot independently find the core RC1 journey.
- Workaround: Navigate directly to `/beta-workflow`.
- Retest evidence: Pending.

### FA-006 — Local acceptance form resets itself while the founder is typing

- Severity: High
- Status: Confirmed Fixed
- Stage: Professional History
- Reproduction steps:
  1. Open `/beta-workflow` through `http://127.0.0.1:3000` in the local acceptance environment.
  2. Enter values without submitting.
  3. Wait while the development live-update connection retries.
- Expected result: Unsaved form values remain until the founder submits, navigates away, or deliberately reloads.
- Actual result: Values cleared within 45 seconds. The development server recorded repeated full-page requests and warned that the `127.0.0.1` origin was blocked from development assets.
- Evidence or screenshot: Founder observation on 13 July 2026 and controlled reproduction. `screenshots/08-history-form-stable.png` records the corrected retest state.
- Probable subsystem: Local Next.js development-server origin configuration
- Regression risk: Low. The correction uses Next.js `allowedDevOrigins` and applies only to development-origin requests.
- Trust impact: High during acceptance because silently losing executive input makes the workflow unusable and untrustworthy.
- Workaround: Use `localhost` instead of `127.0.0.1`, or apply the documented development-origin configuration.
- Retest evidence: After the correction, the same fictional Organization and Executive role values remained intact for 50 seconds. The server recorded only the intentional page load and no further blocked-origin warning.

### FA-007 — Completed history form remains open instead of advancing the executive

- Severity: Medium
- Status: Confirmed Fixed
- Stage: Professional History to Blueprint
- Reproduction steps:
  1. Save the first confirmed professional-history record.
  2. Observe the workflow immediately after the successful save.
- Expected result: The completed stage becomes a concise confirmation and the next required stage receives focus.
- Actual result: The empty history-entry form remained fully open above Blueprint, making the workflow feel like an undifferentiated data-entry page.
- Evidence or screenshot: Founder observation on 13 July 2026. `screenshots/09-history-collapsed-blueprint-current.png` records the corrected state.
- Probable subsystem: Beta-workflow progression and post-save presentation
- Regression risk: Low. The correction reads the existing completion state and does not change persistence.
- Trust impact: Medium. The successful save was visible in badges, but the page did not clearly acknowledge completion or direct the executive forward.
- Workaround: Manually scroll to Blueprint.
- Retest evidence: The history stage now shows `Stage complete`, reports one preserved record, hides the entry form, labels Blueprint `Current stage`, and successful saves target `#blueprint`.

### FA-008 — Completed Blueprint form remains open instead of advancing to Opportunity

- Severity: Medium
- Status: Confirmed Fixed
- Stage: Blueprint to Opportunity
- Reproduction steps:
  1. Save a valid minimum Executive Blueprint revision.
  2. Observe the workflow immediately after the successful save.
- Expected result: The saved Blueprint becomes a concise preserved-revision confirmation and Opportunity receives focus.
- Actual result: The Blueprint badge changed to Complete, but the empty Blueprint form remained open and was still labeled `Current stage`.
- Evidence or screenshot: `screenshots/10-blueprint-remained-open.png` records the defect; `screenshots/11-blueprint-collapsed-opportunity-current.png` records the corrected state.
- Probable subsystem: Beta-workflow progression and post-save presentation
- Regression risk: Low. The correction reads the existing completion state and preserves the revision contract.
- Trust impact: Medium. The successful save was technically visible but the interface contradicted the stage state.
- Workaround: Manually scroll past the completed form to Opportunity.
- Retest evidence: Blueprint now shows `Stage complete`, hides the entry form, labels Opportunity `Current stage`, and successful saves target `#opportunity`.

### FA-009 — Support reviewed professional-history import from CV and resume files

- Severity: Suggestion
- Status: Confirmed Fixed
- Stage: Professional History
- Reproduction steps: Begin the professional-history stage and look for a way to provide an executive CV or career document in PDF or Word format.
- Expected result: A document produces a reviewable draft while preserving source evidence, consent, correction, and explicit confirmation before Career Memory entry.
- Actual result: The professional-history stage now accepts PDF, DOCX, TXT, Markdown, CSV, and JSON files up to 5 MB. Extraction creates editable role drafts. Reject and Uncertain records are not saved, and the raw file is discarded after extraction.
- Evidence or screenshot: Founder suggestion on 13 July 2026.
- Probable subsystem: Secure import / document intelligence / professional-history review
- Regression risk: Medium. File size, extension, signature, text limits, authenticated access, filename sanitization, review decisions, and server-side record validation are enforced. Full malware scanning is not available in this local architecture.
- Trust impact: Positive future convenience, but automatic ingestion without review would reduce trust.
- Workaround: Enter essential history manually when a source is a legacy DOC or an image-only scanned PDF.
- Retest evidence: Deterministic extraction tests, lint, TypeScript, and the production build pass. Legacy DOC requires conversion to DOCX or PDF; scanned PDFs require future OCR. Interactive founder retest remains pending.

### FA-010 — Blank workflow fields do not explain the expected answer format

- Severity: Low
- Status: Confirmed Fixed
- Stage: Professional History, Blueprint, Opportunity, Feedback, and Lifecycle
- Reproduction steps: Open an incomplete workflow stage and review its blank text and number fields.
- Expected result: Concise examples clarify format and level of detail without pre-populating data or implying a recommended answer.
- Actual result: Labels were present, but most fields provided no examples.
- Evidence or screenshot: Founder suggestion on 13 July 2026; `screenshots/07-beta-workflow-entry.png` records the original blank workflow.
- Probable subsystem: Beta-workflow content design
- Regression risk: Low. Examples must remain fictional, concise, and distinguishable from saved values.
- Trust impact: Low to Medium. Examples reduce hesitation and improve the quality of evidence entered.
- Workaround: Use an external acceptance guide for examples.
- Retest evidence: Placeholder examples were added to all text and number inputs in the five relevant workflow stages. They do not submit as values.

### FA-011 — Atlas exposes raw reasoning JSON instead of an executive assessment

- Severity: High
- Status: Confirmed Fixed
- Stage: Atlas Assessment
- Reproduction steps:
  1. Complete History, Blueprint, and Opportunity.
  2. Run the deterministic Atlas assessment.
  3. Review the rendered result.
- Expected result: Atlas explains its recommendation, confidence, evidence, unknowns, conflicts, trade-offs, alternatives, and change conditions in calm executive language.
- Actual result: A scrollable raw JSON block exposed internal property names, identifiers, arrays, and reason structures. The founder reported: `i just see codes.`
- Evidence or screenshot: Founder-provided screenshot on 13 July 2026. It was not copied into the repository because it contained unrelated surrounding desktop context. `screenshots/14-atlas-executive-assessment.png` records the corrected view.
- Probable subsystem: Beta-workflow Atlas presentation layer
- Regression risk: Medium. Presentation must remain a faithful view of the persisted deterministic output and must not invent narrative or hide uncertainty.
- Trust impact: High. Raw developer output makes Atlas unusable for executive decision-making and obscures the evidence standard.
- Workaround: Manually interpret the persisted JSON with engineering assistance.
- Retest evidence: The second fictional founder journey rendered recommendation, priority, confidence, confirmed evidence, questions, conflicts, trade-offs, six alternatives, and change conditions without raw JSON. The founder reported that the assessment seemed fine so far.

### FA-012 — Workflow stage headings use inconsistent capitalization

- Severity: Low
- Status: Confirmed Fixed
- Stage: Complete Decision Workflow
- Reproduction steps: Compare the six numbered workflow stage headings.
- Expected result: Every stage heading follows the same title-case convention.
- Actual result: Stage 2 used title case while the other stage headings used sentence case.
- Evidence or screenshot: Founder observation on 13 July 2026 during the second fictional acceptance journey.
- Probable subsystem: Workflow content design
- Regression risk: Low. This is a presentation-only correction.
- Trust impact: Low. Inconsistent typography made the workflow feel less deliberately designed.
- Workaround: None required.
- Retest evidence: All six stage headings now use title case consistently.

### FA-013 — Immutable decision remains actionable after successful finalization

- Severity: Medium
- Status: Confirmed Fixed
- Stage: Decision
- Reproduction steps: Finalize the fictional Wait decision and inspect the completed Atlas stage.
- Expected result: The decision control closes, the immutable result is acknowledged, and Feedback becomes the current stage.
- Actual result: The workflow status changed to complete and displayed a decision commit, but the decision selector, finalization button, and reasoning rerun remained active.
- Evidence or screenshot: Second fictional founder journey on 13 July 2026.
- Probable subsystem: Beta-workflow post-decision presentation
- Regression risk: Medium. The database idempotency constraint prevented duplicate commits, but the interface invited an invalid repeated intent.
- Trust impact: Medium. An action described as immutable should visibly become final.
- Workaround: Do not press the finalization button again after a commit identifier appears.
- Retest evidence: Completed decisions now show a preservation confirmation, hide rerun and finalization controls, and label Feedback as the current stage.

### FA-014 — Completed feedback form remains open instead of advancing to Lifecycle

- Severity: Medium
- Status: Confirmed Fixed
- Stage: Feedback
- Reproduction steps: Submit factual structured feedback after finalizing the fictional decision.
- Expected result: Feedback closes with a preservation acknowledgement and Lifecycle becomes the current stage.
- Actual result: The status changed to complete and the submission count increased, but the empty feedback form stayed active and Lifecycle had no current-stage label.
- Evidence or screenshot: Second fictional founder journey on 13 July 2026.
- Probable subsystem: Beta-workflow post-feedback presentation
- Regression risk: Low. Feedback persistence and triage behavior are unchanged.
- Trust impact: Medium. The interface did not communicate successful progression clearly.
- Workaround: Read the top status badges and manually continue to Lifecycle.
- Retest evidence: Completed feedback now collapses to a private-submission confirmation and Lifecycle is labeled as current.

### FA-015 — Returning executive is routed into first-time onboarding

- Severity: High
- Status: Confirmed Fixed
- Stage: Logout and Return Later
- Reproduction steps: Complete the fictional workflow, sign out, and sign back into the same account.
- Expected result: Authentication returns the executive to the route they left, with the durable Workspace and workflow state restored.
- Actual result: Authentication succeeded, but the executive landed on the first-time Welcome screen inviting creation of another Workspace.
- Evidence or screenshot: Second fictional founder journey on 13 July 2026.
- Probable subsystem: Authentication redirects and logout return-path handling
- Regression risk: Medium. Invitation registration must continue routing new executives through Welcome and onboarding.
- Trust impact: High. A returning executive can reasonably interpret the first-time screen as lost data.
- Workaround: Navigate directly to Beta Workflow after signing in.
- Retest evidence: Logout preserved `/beta-workflow` as a validated local return path. Signing back into the same fictional account returned directly to the workflow with Decision, Feedback, and Lifecycle complete and both lifecycle requests intact.

## New-Issue Template

Each issue must use this structure:

### FA-XXX — Title

- Severity:
- Status: Open / Confirmed Fixed / Retest Required / Closed
- Stage:
- Reproduction steps:
- Expected result:
- Actual result:
- Evidence or screenshot:
- Probable subsystem:
- Regression risk:
- Trust impact:
- Workaround:
- Retest evidence:

Never include credentials, invitation secrets, verification links, session tokens, or unnecessary personal data.
