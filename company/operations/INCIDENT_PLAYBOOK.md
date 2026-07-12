# Incident Playbook

> Purpose: Protect people, data, trust, and service continuity through disciplined incident response and learning.

## Incident Types

- Security incident or suspected unauthorized access.
- Service outage or severe degradation.
- Production release failure.
- Data corruption, loss, or cross-user exposure.
- Email sending, receiving, authentication, or administration failure.
- Domain, registrar, certificate, or DNS failure.
- Vendor compromise or critical dependency outage.

## Response Priorities

1. Protect people and prevent further exposure or corruption.
2. Preserve evidence, timestamps, logs, and decision records.
3. Establish incident owner, severity, scope, and communication channel.
4. Contain with the least destructive reversible action.
5. Restore from a verified last-known-good state.
6. Validate security, data integrity, and user-visible behavior.
7. Communicate facts, uncertainty, impact, and next update time.

## Scenario Guidance

| Scenario | Immediate action | Recovery principle |
| --- | --- | --- |
| Security | Restrict compromised access, rotate affected secrets through approved systems, preserve evidence | Do not destroy evidence or overstate containment |
| Service outage | Confirm scope and provider status; pause risky changes | Restore verified service before optimizing |
| Production failure | Stop rollout and identify last-known-good version | Use documented deployment rollback and validate dependencies |
| Data corruption | Stop writes where safe; preserve copies and logs | Restore only from verified backups with integrity checks |
| Email failure | Verify mailbox, provider health, DNS, authentication, and routing boundaries | Avoid random DNS edits; use the approved rollback snapshot |
| Domain/DNS | Secure registrar access and freeze unrelated changes | Restore exact known-good records and verify propagation |

## Rollback

Every material change requires a documented rollback trigger, owner, last-known-good state, order of operations, validation steps, and stopping condition. A rollback must not introduce an incompatible database or security state. Destructive production actions require explicit authority.

## Communication

Communicate promptly, calmly, and accurately. Distinguish confirmed facts from investigation. Do not speculate, assign blame, expose sensitive details, or claim resolution before validation. Give an owner and next update time.

## Postmortem

For material incidents, record timeline, impact, detection, contributing conditions, response, recovery, evidence, what worked, what failed, corrective actions, owners, dates, and verification. Use blameless analysis without removing accountability. Update playbooks, risks, tests, and architecture decisions where required.

