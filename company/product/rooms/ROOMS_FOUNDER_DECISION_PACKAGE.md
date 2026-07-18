# Executive Rooms Founder Decision Package

## Decision required

Approve whether Orendalis may proceed from design to a private, invite-only Executive Rooms proof after five executive use cases are validated, and select the retention policy.

## Recommended option

Approve the bounded MVP with the 90-day archive window and 12-month minimum-body moderation/security audit described in `ROOMS_RETENTION_AND_DELETION.md`. This proves executive value with the smallest privacy, moderation, cost, and product-complexity surface.

## Alternatives

1. Short-lived rooms: remove participant-visible content 30 days after closure; lower privacy exposure but weaker continuity.
2. Permanent rooms: retain until manual deletion; strongest continuity but unacceptable trust and cost risk without legal review.
3. Defer runtime: continue validating use cases without product build; lowest risk but delays evidence.

## Evidence still required before approval

- Five executive use cases validated with target users.
- Privacy and legal review of retention, deletion, moderation, and administrator access.
- Confirmation that the permission matrix and threat mitigations are acceptable.
- Prototype operating-cost estimate.

No runtime build, schema change, room data, or user invitation is authorized until this gate is explicitly approved.
