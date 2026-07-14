# Definition of Ready

> Purpose: Define the evidence required before Release 0.9 may invite its first design partner.

## Product and Evidence

| Gate | Status | Evidence / required action |
| --- | --- | --- |
| Founder journey accepted in isolated staging | Complete | `company/founder-acceptance/FOUNDER_ACCEPTANCE_RERUN.md` |
| Workspace and Atlas isolation accepted | Complete | Founder-acceptance isolation reports |
| Feedback identifies the deployed release and revision | Complete | Release evidence helper and deterministic test |
| Company Control reflects current staging and release state | Complete | Current application presentation and authoritative environment register |
| Invitation controls are founder-only and single-use | Complete | Existing invitation and authorization tests |

## Operational Activation Gates

| Gate | Status | Required evidence |
| --- | --- | --- |
| Authentication email reaches Inbox without administrator release | Blocked | One controlled delivery acceptance showing unassisted receipt |
| Staging backup and restore rehearsal | Blocked | Completed rehearsal record with recovery result |
| External monitoring and notification path | Blocked | Verified health check and founder notification test |
| Critical-provider recovery evidence | Blocked | Safe recovery checklist completed without storing secrets |
| Legal/privacy materials for design-partner data mode | Blocked | Founder-approved materials and consent boundary |
| Migration-history baseline reconciled | Blocked | Database owner confirms a safe forward migration path |
| Founder activation approval | Blocked | Explicit approval after every preceding gate is complete |

## Ready Decision

Release 0.9 is **not ready to activate design partners**. Operational reporting readiness may pass independently, but it does not waive these activation gates.
