# Founder Action Model

> Purpose: Define how Orendalis identifies, ranks, explains, approves, and audits work requiring founder attention.

## Action Contract

Each action contains a stable ID, title, department, urgency, importance, due date, reason, evidence, blocker, recommended next step, owner, source link, status, and approval requirement.

Supported urgency values are `Immediate`, `Today`, `This Week`, `Monitor`, `Future`, and `No Action`. Status values are `Open`, `Blocked`, `Awaiting Response`, `In Progress`, `Completed`, and `Deferred`.

## Ordering

The deterministic rank uses:

1. Urgency
2. Importance
3. Deadline proximity or overdue state
4. Blocker state
5. Stable alphabetical tie break

The ranking is advisory. It does not change ownership or authorize execution.

## Evidence Requirement

An action must reference at least one approved source. Recommendations explain the reason, expected outcome, downside of delay, uncertainty, and whether approval is required. Missing evidence lowers confidence or prevents recommendation.

## Task Integration

The Company Task contract extends the existing action model with one-time, recurring, follow-up, and approval types plus related entity references. Future adapters may read the productivity domain, but this foundation does not mutate existing executive-career tasks.

## Approval Boundary

Atlas may prepare and prioritize tasks. It may not automatically:

- Send email or support replies
- Approve purchases or create financial commitments
- Change DNS or Microsoft settings
- Deploy production
- Accept legal terms
- Delete data
- Invite users

Future state-changing actions require a single-use approval that identifies exact scope, risk, rollback, and expected outcome.

## Audit Model

Every meaningful future action records actor, action, timestamp, source, previous state, new state, reason, approval, correlation ID, and audit reference. A failed action is an auditable outcome, not an absent record.

## Initial Actions

The demonstration control center derives three factual priorities from existing records:

- Monitor the open Microsoft DKIM support case.
- Complete verified subscription, cash, and burn inputs.
- Close private-beta readiness evidence gaps.

These actions do not claim that work has occurred. They link back to the operational source and remain read-only.
