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

## Operational Change Standard

| Change type | Examples | Approval | Validation | Rollback authority |
| --- | --- | --- | --- | --- |
| Standard | Repeated low-risk procedure with approved runbook and no production/data/security boundary change | Procedure owner within pre-approved scope | Runbook verification and evidence | Procedure owner; founder informed if rollback occurs |
| Major release | Staging/production release, migration, integration, callback, security, domain, email, architecture, or data-boundary change | Explicit founder approval after evidence review | Full checklist and observation | Founder / Release Manager; Security Officer may order containment |
| Emergency | Minimal action required to contain active harm or restore critical service | Founder or incident commander; retrospective approval if delay increases harm | Immediate targeted checks, then full regression | Incident commander within containment scope; database restore remains restricted |

## Emergency Change Procedure

1. Declare incident and severity.
2. State why normal process would increase harm.
3. Define the smallest reversible change, owner, evidence, and stop condition.
4. Preserve the last known-good state and recovery path.
5. Execute with a second reviewer when available; record single-founder execution explicitly.
6. Verify security, integrity, authentication, and core service.
7. Schedule retrospective review within two business days.

## Release Approval

Feature freeze does not imply release approval. Staging and production require separate decisions. Deployment does not imply acceptance until smoke tests, logs, security controls, and rollback evidence pass.
