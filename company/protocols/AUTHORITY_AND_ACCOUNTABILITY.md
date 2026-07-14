# Authority and Accountability

> Purpose: Define who may decide, execute, verify, approve, stop, and accept Orendalis work.

## Roles

| Role | Accountability |
| --- | --- |
| Founder | Mission, capital, ownership, material risk, public commitments, production authority, and final exceptions |
| Product Owner | User problem, outcome, scope, priority, acceptance criteria, and product decision |
| Technical Owner | Design integrity, implementation, technical risk, maintainability, and rollback feasibility |
| Security and Privacy Owner | Threat, access, data handling, privacy, incident containment, and security acceptance |
| Quality Owner | Test strategy, evidence, defects, regression, and acceptance recommendation |
| Release Manager | Release contents, gates, deployment sequence, rollback readiness, and release record |
| Operator | Approved execution, observation, evidence capture, and escalation |
| Reviewer | Independent challenge of evidence, assumptions, risk, and correctness |
| AI Agent | Scoped analysis or execution under the AI Agent Protocol; never the source of authority |

One person may hold several roles in a small company, but the record must identify which role they are exercising. Where independence is impossible, explicitly record the single-person control and strengthen evidence or require founder review.

## RACI Rule

Every material work item has:

- one **Accountable** decision owner;
- one or more **Responsible** executors;
- named **Consulted** specialists where required;
- identified **Informed** stakeholders.

There is never more than one accountable owner for the same decision.

## Stop Authority

Any contributor may stop work when they identify:

- potential harm to people, data, security, privacy, legal position, or production;
- missing approval or unclear authority;
- evidence contradicting the plan;
- an unrecoverable step without explicit acceptance;
- secret or personal-data exposure;
- a failed validation gate.

Stopping work in good faith is protected. Resumption requires the accountable owner to resolve or explicitly accept the issue within their authority.

## Delegation

Delegation must state scope, duration, systems, permitted actions, prohibited actions, spending limit, escalation path, and revocation method. Delegation does not transfer ultimate accountability and must not rely on shared credentials.

## Acceptance

The executor cannot unilaterally redefine success. The accountable owner accepts the outcome against agreed criteria. For production, security, privacy, financial, or legal changes, the applicable specialist gate must also pass.
