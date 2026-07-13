# Private Beta Go/No-Go Checklist

> Purpose: Prevent design-partner invitations until product, security, recovery, legal, and operational evidence is complete.

## Product Journey

- [x] Invitation-only registration is implemented and locally tested.
- [x] Fictional email verification, callback, replay denial, resend behavior, onboarding, and durable return pass through local provider capture.
- [x] Authoritative manual history persists without demo defaults.
- [x] Minimum Blueprint persists with revision history.
- [x] One opportunity can be created and evaluated through the beta route.
- [x] Atlas persists evidence, conflicts, trade-offs, gaps, confidence, alternatives, and change conditions.
- [x] Next action and immutable decision snapshot persist atomically in local tests.
- [x] Structured feedback is isolated and founder-triageable.

## Security and Data

- [ ] Staging RLS and workspace-isolation matrix passes.
- [ ] Production acceptance environment passes with fictional identities.
- [x] Append-only update/delete attempts fail locally.
- [x] Compensation permission boundary passes locally.
- [ ] Export, deletion, retention, withdrawal, and closure execution is accepted; supervised request intake exists.
- [ ] Secret scan and browser-token review pass in an accepted CI/staging run.

## Reliability

- [ ] Backup and restore exercise succeeds.
- [ ] Monitoring and founder alerts are tested.
- [ ] Failure and recovery scenarios are accepted.
- [ ] CI required checks pass.
- [ ] Full desktop, tablet, mobile, and keyboard journey pass. Email verification passed desktop and 390-pixel mobile inspection; tablet and complete keyboard-only journey remain open.

## Legal and Operations

- [ ] Founder approves all participant materials.
- [ ] Qualified legal review is recorded where required.
- [ ] Support and incident routes work.
- [ ] Microsoft email dependency is resolved or a safe accepted alternative exists.
- [ ] Founder completes fictional-profile acceptance.

## Decision

- Decision: **FOUNDER ACCEPTANCE ONLY — no design-partner use**
- Founder:
- Date:
- Evidence reference:
- Accepted residual risks:

Unchecked critical gates cannot be waived silently.

Local Supabase mail capture proves the product verification path only. It is not a safe accepted alternative for real participants and does not satisfy the Microsoft/external-delivery gate.
