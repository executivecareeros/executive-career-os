# Incident Severity and Response

> Purpose: Provide a consistent incident classification, response expectation, founder notification rule, and recovery target.

Severity is based on actual or credible impact, not effort or visibility. When uncertain, start higher and downgrade with evidence.

| Severity | Definition and examples | Acknowledge | Founder notification | Recovery expectation |
| --- | --- | --- | --- | --- |
| Severity 1 — Critical | Cross-user data exposure; account/domain compromise; destructive data loss; production unavailable to all users; integrity cannot be trusted | Immediately; target within 15 minutes | Immediate, regardless of hour; founder is incident commander until delegated | Contain immediately; target safe service or controlled shutdown within 1 hour. Security and integrity override availability. |
| Severity 2 — High | Major authentication failure; production materially degraded; staging blocks a release; backup/restore failure; security control missing with exposure; company email unavailable during a critical operation | Target within 30 minutes | Immediate during waking hours; urgent channel outside hours for production, security, data, domain, or communication impact | Target containment within 2 hours and safe recovery within 4 hours, subject to provider dependency. |
| Severity 3 — Moderate | Limited feature failure; isolated user/workspace issue without exposure; repeated build failure; noncritical provider degradation; operational deadline at risk | Target within 4 business hours | Same business day through the operations log; interrupt founder only if impact increases | Workaround or recovery by next business day; schedule durable correction. |
| Severity 4 — Low | Cosmetic defect, documentation mismatch, minor internal-tool issue, or improvement with no material user/security impact | Target within 2 business days | Weekly operational review unless time-sensitive | Prioritize through the normal backlog; no emergency change. |

## Incident Declaration

Record incident ID, severity, declared time, owner, affected environment, confirmed facts, unknowns, containment, next update time, and linked runbook. Never include passwords, tokens, recovery codes, private message content, or unnecessary personal data.

## Notification Rules

- Severity 1: immediate founder notification and continuous incident ownership.
- Severity 2: immediate founder notification and updates at least hourly until stable.
- Severity 3: same-day notification and updates at meaningful changes.
- Severity 4: include in the next normal operational review.
- Privacy or legal notifications are decided by the Privacy Officer from confirmed scope.
- Provider status pages inform diagnosis but do not replace internal verification.

## Closure and Review

Close only after service, security, integrity, and affected workflows are verified; monitoring is stable; evidence is preserved; follow-up is assigned; and the next review is recorded.

Postmortem is mandatory for Severity 1 and Severity 2, and for any lower-severity event involving recovery, data integrity, credential exposure, repeated failure, or a runbook gap.
