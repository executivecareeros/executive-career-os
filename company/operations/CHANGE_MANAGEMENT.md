# Change Management

> Purpose: Ensure material company and technical changes are reviewed, tested, reversible where possible, approved, and documented.

## Change Classes

- **Routine:** Low-risk, reversible, established procedure, no sensitive impact.
- **Material:** Customer, production, financial, legal, data, security, vendor, or architectural impact.
- **Emergency:** Delay creates greater immediate harm; retrospective review is mandatory.

## Proposal Standard

A material change proposal states purpose, owner, scope, affected systems and people, evidence, alternatives, dependencies, cost, security/privacy implications, risks, success criteria, rollback, validation, communication, and decision deadline.

## Review and Approval

1. Confirm the change class and decision owner.
2. Complete architecture review for new boundaries, data models, providers, integrations, or irreversible dependencies.
3. Define proportionate testing, including regression, security, access, data integrity, and recovery.
4. Prepare and verify rollback before production change.
5. Obtain explicit approval for cost, production, security, legal, public, ownership, or irreversible actions.
6. Execute within the approved scope and window.
7. Validate success and preserve evidence.
8. Update authoritative documentation and decision history.

## Approval Gates

| Gate | Required evidence |
| --- | --- |
| Scope | Clear objective, owner, boundaries, and affected assets |
| Architecture | Reviewed design and ADR when the decision is durable |
| Security and privacy | Threat, access, data, and compliance assessment |
| Testing | Passing results appropriate to risk |
| Rollback | Trigger, procedure, owner, and last-known-good state |
| Operational readiness | Monitoring, support, communication, and recovery |
| Release approval | Named authority confirms evidence and residual risk |

Emergency changes must be minimal, logged in real time where possible, validated immediately, and reviewed after stabilization. Emergency status does not authorize unrelated work.

