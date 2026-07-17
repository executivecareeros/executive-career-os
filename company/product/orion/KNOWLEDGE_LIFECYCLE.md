# Knowledge Lifecycle

Last updated: 2026-07-17 · Owner: Governance Owner · Version: 1

## States

| State | Meaning | May guide current work |
|---|---|---|
| Draft | Proposed observation; not reviewed | No |
| Under Review | Evidence, provenance, reasoning, and scope are being challenged | No |
| Approved | Explicitly approved and within review/expiry limits | Yes |
| Superseded | Replaced by a later governed record | No |
| Retired | No longer applicable | No |
| Archived | Closed historical record retained for audit | No |

## Permitted transitions

`Draft → Under Review → Approved → Superseded or Retired → Archived`

Rejected review returns through a new governed draft rather than mutating the reviewed revision. Direct approval, direct archival, and reopening closed records are prohibited. A replacement is a distinct versioned record that references the learning it supersedes.

## Immutability and reuse

Each transition appends a revision with its approval history. The current view selects the highest revision; audit views retain every revision. Reuse is a read-only projection of current approved records and always reports zero historical recommendation changes and zero automatic model updates.
