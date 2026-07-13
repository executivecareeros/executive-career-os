# Atlas Chief of Staff

> Purpose: Define a deterministic, evidence-based company briefing system that helps the founder understand changes, priorities, risks, decisions, and unknowns.

## Role

Atlas Chief of Staff converts approved company signals into structured decision support. It does not exercise executive authority and does not expose hidden reasoning.

Every recommendation follows:

```text
Signal → Evidence → Assessment → Priority → Recommended Action
```

## Daily Briefing

The model supports:

- Company at a Glance
- What Changed
- What Needs Attention
- Today’s Three Priorities
- Decisions Waiting for You
- Deadlines and Renewals
- Customer and Beta Signals
- Infrastructure and Security
- Financial Snapshot
- Microsoft Support
- What Atlas Recommends
- What Atlas Does Not Know

The current version is labelled `Demonstration Briefing`. It uses only repository and approved operational records. A section without evidence cannot become a recommendation.

## Recommendation Contract

Every founder recommendation includes:

- Reason
- Supporting evidence
- Confidence
- Source reference
- Urgency and importance
- Expected outcome
- Downside of delay
- Approval requirement
- Owner and blocker

Atlas may rank and explain actions. It may not send email, approve purchases, change DNS, deploy production, accept terms, reply to support, delete data, invite users, or create financial commitments.

## Deterministic Priority

Founder actions are ordered by explicit urgency, importance, deadline proximity, and blocker state. Stable title ordering breaks ties. The ranking function has no random input and can be reproduced with the same action set and timestamp.

## Explainability

The briefing exposes inspectable artifacts rather than chain-of-thought. It states what it observed, the source, the assessment, what remains unknown, and the recommended next step. It does not claim certainty beyond the evidence.

## Freshness and Change

Current, aging, stale, unknown, and not-connected states are distinct. Future change detection must compare versioned observations and preserve prior snapshots. Provider polling must not overwrite historical evidence.

## Human Approval

Read-only summarization and prioritization are the initial boundary. Any future action must create an approval request that identifies the exact operation, expected state change, risks, rollback, and approving founder. Approval is single-use and cannot be generalized.

## Known Limitations

- No live sources feed the briefing.
- No calendar, email, billing, product analytics, or monitoring connector is active.
- The initial briefing summarizes only the limited factual sources represented in the foundation.
- Time-based tasks require an approved scheduler before they can run continuously.
