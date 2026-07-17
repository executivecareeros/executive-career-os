# Learning Governance

Last updated: 2026-07-17 · Owner: Governance Owner · Status: Active architecture

## Admission gates

Institutional learning is admitted only when all gates pass:

1. Evidence exists and has traceable provenance.
2. Every evidence item has an identified reviewer and review time.
3. Reasoning explains what was observed and why it matters.
4. Scope prevents a local finding from becoming a universal rule.
5. Confidence is explicit, including `Unknown`.
6. A named reviewer completes review.
7. A named approver records approval time and reasoning.
8. A review due date or expiration controls continued reuse.

Free text, unreviewed feedback, outcomes without review, assumptions, correlations presented as causes, and unsupported generalizations do not qualify.

## Authority and history

The ledger is append-only. Every lifecycle action creates a new revision; older revisions remain immutable. Approval, supersession, retirement, and archival require explicit recorded authority. There are no silent updates, automatic approvals, confidence adjustments, model tuning, or recommendation rewrites.

The Governance Owner may approve bounded operational or product learning within existing authority. Founder approval remains required where an ODS gate is reserved for legal, financial, security, external-provider, irreversible, or material customer commitments.

## Review cadence

Records cease contributing to current guidance when expired or review-due. Review confirms, supersedes, retires, or archives the record using new evidence; it never edits the historical revision.
