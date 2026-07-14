# Security and Privacy Protocol

> Purpose: Protect executives, company assets, personal data, identity, and service integrity throughout Orendalis work.

## Principles

- least privilege and need-to-know;
- deny by default;
- separate environments and credentials;
- minimize collection and disclosure;
- encrypt in transit and at rest where supported;
- preserve auditability without exposing sensitive content;
- require human approval for material agent or external action;
- design recovery before dependency.

## Required Reviews

Security and privacy review is mandatory for authentication, authorization, sessions, invitations, account recovery, personal data, documents, exports, deletion, retention, external providers, AI providers, email, DNS, storage, database, privileged functions, public routes, and production changes.

## Secrets

Secrets belong only in approved secret managers or provider configuration. Never place them in Git, Markdown, screenshots, chat, issue trackers, browser URLs, test output, shell history, or client-visible variables. Use placeholders in documentation. Rotate and investigate any exposed secret.

## Identity and Access

Use individual accounts, MFA, passkeys where supported, recovery factors, least privilege, and periodic access review. Shared credentials are prohibited. Founder-only functions require server-enforced authorization, not navigation hiding.

## Data Boundaries

Classify public, internal, confidential, personal, highly sensitive, credential, and regulated data. Career history, compensation, family constraints, decisions, interviews, recruiter interactions, documents, and Atlas memory are confidential personal data; sensitive constraints and credentials receive the strongest handling.

## Secure Change Gate

For material changes record threat, assets, actors, trust boundaries, abuse cases, permissions, logging, retention, failure modes, and recovery. Validate tenant isolation and negative authorization—not only successful access.

## Privacy Rights

Collection requires purpose. Retention, correction, export, consent withdrawal, deletion, and account closure must be explainable and auditable. Do not promise deletion when legal or security retention applies; explain the boundary before action.

## Vulnerability and Incident Handling

Do not publish exploitable detail before containment. Preserve evidence, limit access, rotate affected credentials, assess scope, follow the Incident Protocol, and document corrective action.
