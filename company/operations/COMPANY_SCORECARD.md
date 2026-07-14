# Company Scorecard

> Purpose: Provide a concise monthly view of company health without rewarding activity that does not create durable value.

Month: `[YYYY-MM]`  
Owner: `[NAME/ROLE]`  
Status scale: `Healthy`, `Watch`, `At Risk`, `Unknown`

| Area | Outcome measure | Current | Status | Evidence | Owner | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| Engineering | Reliability, quality, delivery, and debt trend | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |
| Product | Executive decision value and validated learning | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |
| Business | Strategy progress and material commercial evidence | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |
| Operations | Reviews completed, actions closed, and controls current | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |
| Infrastructure | Availability, recovery, capacity, and vendor health | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |
| Customers | Outcomes, feedback, support, retention, and trust | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |
| Finance | Cash, runway, costs, obligations, and ledger completeness | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |
| Security | Access, incidents, vulnerabilities, and overdue controls | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |
| Documentation | Authoritative records current, consistent, and owned | `[ ]` | Unknown | `[ ]` | `[ ]` | `[ ]` |

## Monthly Conclusion

- Overall status: `[ ]`
- Material changes: `[ ]`
- Top risks: `[ ]`
- Decisions required: `[ ]`
- Commitments for next month: `[ ]`

Use measured outcomes where possible. Label estimates and unknowns. Never convert missing evidence into a favorable status.

## Release 0.6 Readiness Snapshot — 2026-07-13

> Historical snapshot. It is preserved as evidence of the pre-staging state and must not be used as current operational status. Current state is recorded in `company/releases/release-0.9/OPERATIONAL_READINESS_REPORT.md`.

| Area | Current | Status | Evidence | Next action |
| --- | --- | --- | --- | --- |
| Product | Durable invitation-to-lifecycle beta route implemented locally | Watch | `docs/BETA_WORKFLOW_PERSISTENCE.md` | Complete founder acceptance in staging |
| Infrastructure | No staging or production acceptance environment | Unknown | `docs/PRODUCTION_ACCEPTANCE.md` | Founder approval required before external setup |
| Security | Invitation, atomic finalization, and feedback/lifecycle isolation pass locally; production acceptance absent | At Risk | `docs/BETA_DATA_LIFECYCLE.md` | Keep real data blocked |
| Recovery | No restore exercise | At Risk | `docs/BACKUP_AND_RESTORE_VERIFICATION.md` | Approve staging, then run isolated restore |
| Operations | Design-partner procedures created; no invitations sent | Watch | `company/beta/` | Preserve No-Go until critical gates pass |
| Customers | No design partners active | Unknown | No live source | Do not display zero as measured customer evidence |
| Legal | Participant materials are drafts requiring review | At Risk | `company/beta/DATA_HANDLING_NOTICE.md` | Founder and qualified legal review |
