# Work Lifecycle

> Purpose: Provide one repeatable lifecycle for every Orendalis work item, from request to durable closure.

## 1. Intake

Capture the objective, requester, reason, desired outcome, constraints, urgency, and affected people or systems. Separate the requested outcome from suggested implementation.

## 2. Classification

Classify the work as documentation, product, design, engineering, security, data, infrastructure, incident, research, operational, or mixed. Assign risk:

- **Low:** local, reversible, no customer, data, security, financial, or production impact;
- **Moderate:** bounded behavior or workflow impact with tested rollback;
- **High:** authentication, authorization, personal data, migration, external provider, production, financial, legal, or broad customer impact;
- **Critical:** active incident, irreversible loss, safety, material breach, or company-threatening consequence.

## 3. Authority and Scope

Name the accountable owner, executor, reviewers, approval gates, in-scope work, explicit exclusions, and stop conditions. Resolve conflicts before implementation.

## 4. Discovery

Inspect the actual current state. Read authoritative records, repository guidance, dependencies, recent changes, and live state where authorized. Do not plan from remembered or hypothetical state.

## 5. Plan

Define ordered steps, dependencies, validation, rollback, documentation, and approval gates. Keep the plan proportional. A plan does not grant permission to cross a gate.

## 6. Execute

Make the smallest coherent change. Preserve unrelated work. Do not weaken controls to make validation pass. Record deviations as they occur.

## 7. Validate

Use the Quality Assurance Protocol. Validate the changed behavior, relevant regression surface, security and privacy boundaries, accessibility, performance, and operational readiness appropriate to risk.

## 8. Review and Acceptance

Present evidence, limitations, residual risks, rollback status, and outstanding actions. Obtain acceptance from the accountable owner and required specialists.

## 9. Release or Publish

Use the Release Protocol for software and external changes. Documentation-only work still requires link, consistency, sensitivity, and repository validation.

## 10. Close

Update authoritative documentation, decision history, issue status, and handoff. Confirm repository state and name the next action. Never describe blocked or partial work as complete.

## Required Status Vocabulary

- **Not started:** no execution began.
- **In progress:** authorized work is active.
- **Waiting:** a known external condition must change.
- **Blocked:** progress cannot continue without new authority, information, or remediation.
- **Failed:** success criteria were not met.
- **Complete:** all required work and validation passed.
- **Accepted:** the accountable owner approved the completed result.
- **Superseded:** a newer authoritative decision or record replaced it without erasing history.
