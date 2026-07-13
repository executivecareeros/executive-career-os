# Founder Acceptance Rerun

Purpose: Record the factual Release 0.6 staging acceptance rerun after founder-workflow and data-isolation remediation.

## Scope

- Environment: Orendalis staging
- Date: 14 July 2026
- Deployed revision: `a84bb2b`
- Test identity: verified founder account
- Career content: fictional acceptance data only

## Deployment and Migration

- GitHub `main` and local `main` matched before the final deployment.
- Vercel served the remediated application at the established staging hostname.
- Only `202607140001_founder_beta_workflow.sql` was applied to staging during this operation.
- Historical migrations were not replayed in staging.
- The founder-workflow provisioning function and trigger exist.
- Row-level security remains enabled on `beta_workflow_states`.
- Exactly one workflow state was associated with the existing founder bootstrap record at validation time.

## Journey Results

| Check | Result |
| --- | --- |
| Founder sign-in | Passed |
| Post-login return | Passed |
| Guided journey discoverability | Passed |
| Professional History | Passed |
| Executive Blueprint | Passed |
| Opportunity | Passed |
| Atlas assessment | Passed |
| Immutable decision | Passed |
| Career Ledger creation | Passed |
| Follow-up task creation | Passed |
| Private feedback | Passed |
| Refresh persistence | Passed |
| Logout protection | Passed |
| Login return to requested page | Passed |

The journey reached 8 of 8 complete. Completed stages remained collapsed, the next stage was explicit, and the persisted state survived refresh, logout, and sign-in return.

## Defect Found During Rerun

The first deployed isolation layer prevented demonstration records from appearing, but confirmed founder records were not reflected on the standalone Workspace, Atlas, Blueprint, Opportunities, Career Ledger, Tasks, and Today pages. Those pages incorrectly showed empty states after the workflow had created records.

The defect was corrected in `a84bb2b`. The affected pages now show summaries derived from the authenticated founder's persisted workflow context while continuing to isolate demonstration datasets.

## Decision

Founder Acceptance passed. No release-blocking defect remained at the end of the rerun.
