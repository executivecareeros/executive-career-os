# Beta Workflow Persistence

> Purpose: Define the authoritative, durable Release 0.6 Executive Opportunity Decision workflow.

## Authoritative Map

| Step | Route | Command or service | Repository boundary | Table or function | RLS or permission | Persistence and retry | Audit or failure state |
|---|---|---|---|---|---|---|---|
| Invitation | Founder operation | `create_beta_invitation` | Database function | `workspace_invitations` | `Invite Members` | Secret returned once; digest retained | `beta_invitation_audit_events`; invalid expiry rejected |
| Registration | `/register?invite=…` | `registerAction` | Invitation inspection | `inspect_beta_invitation` | Anonymous inspection reveals status only | Pending token retained in secure HTTP-only cookie for verification return | Missing, expired, revoked, accepted, or mismatched invite blocks signup |
| Acceptance | `/login` | `acceptRememberedInvitation` | Invitation repository service | `accept_beta_invitation` | Authenticated identity email must match | Row lock and terminal state prevent replay | Accepted event; replay is explicit |
| Onboarding | `/onboarding` | `onboardingAction` | `SupabaseOnboardingRepository` | `provision_invited_beta_workspace` | Accepted invite required | Idempotent personal Workspace provisioning | Workflow state created after successful provisioning |
| Professional history | `/beta-workflow` | `saveHistoryAction` | `SupabaseBetaWorkflowRepository` | Import session, record, decision, experience, audit | Active Workspace member | Confirmed manual entry persists; no raw file retained | Rejected records are never inserted into accepted history |
| Blueprint | `/beta-workflow` | `saveBlueprintAction` | Same repository | Blueprint root and append-only revision | Active Workspace member | New revision appended; prior revision preserved | Active revision ID stored in workflow state |
| Opportunity | `/beta-workflow` | `saveOpportunityAction` | Same repository | Company, opportunity, provenance, optional compensation | Active member; compensation permission | Facts, unknowns, claims, currency, and provenance persist | No conversion; omitted compensation remains unknown |
| Atlas assessment | `/beta-workflow` | `runReasoningAction` | Same repository and deterministic reasoning engine | `atlas_reasoning_snapshots` | Active Workspace member | Exact input references and engine/rules versions persist | Missing required references stop the run |
| Decision | `/beta-workflow` | `finalizeDecisionAction` | `finalize_beta_decision` | Decision snapshot, Ledger, task, commit, audit | Active Workspace member | One transaction with idempotency and optimistic opportunity version | Any failed validation rolls back all writes |
| Feedback | `/beta-workflow` | `submitFeedbackAction` | Beta repository | `beta_feedback` | Executive self-write/read; founder Workspace triage | Durable submission; retry creates a distinct report | Cross-Workspace and peer reads denied |
| Lifecycle | `/beta-workflow` | `submitLifecycleAction` | Beta repository | `beta_lifecycle_requests` | Executive self-write/read; founder review | Duplicate active request prevented by unique index | Status explains supervised retention review |

## Demonstration Isolation

Authenticated repository contexts are marked non-demo. The beta route never imports `frontend/data` demonstration datasets. Existing product demonstration routes remain available only outside the authoritative beta journey and must not be presented as persisted participant state.

## Current Boundary

Manual professional-history entry is implemented. File extraction UI outside `/beta-workflow` remains demonstration-only and is not an accepted beta ingestion path. The beta route therefore meets the workflow through essential manual history, not document upload.
