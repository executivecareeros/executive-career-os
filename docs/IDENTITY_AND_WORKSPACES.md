# Executive Identity and Workspaces

> **Purpose:** Define the provider-independent identity, membership, workspace, permission, authentication, and enterprise boundaries of Executive Career OS.

## Identity Is Not Authentication

Executive Identity describes who the executive is within the product: a stable ID, profile, account state, preferences, capabilities, memberships, relationships, and attributable snapshots. Authentication will later prove control of an identity. It must not define or own the identity domain.

No login method, credential, provider subject, or access token becomes a domain identifier.

## Workspace

A Workspace is the ownership, collaboration, policy, and data-isolation context in which career records are used. Supported types include Personal, Executive Coach, Executive Search, Corporate, Enterprise, University, Family, and future custom workspaces.

Each Workspace has a profile, status, plan, owner, members, settings, localization, security policy, capabilities, limits, policies, and versioned metadata.

## Membership and Relationships

Membership links an Executive Identity to a Workspace through a role and explicit permission scope. Roles provide useful defaults but permissions remain inspectable. Trusted relationships model assistants, coaches, search consultants, family members, and advisors with limited, revocable scope and validity.

An invitation is not an active membership. Suspension and archive remain distinct from deletion.

## Permission Model

Canonical permissions cover Blueprint viewing/editing, Ledger viewing/appending, Compensation and Document access, Workspace management, invitations, Atlas management, Reports, exports, and deletion requests. Future enforcement should evaluate workspace policy, membership, delegated scope, capability, and sensitive-field policy together.

Denial must be explicit and auditable. Delegation must never imply ownership transfer.

## Repository Context

Repository operations can receive a WorkspaceContext containing Workspace ID, Executive ID, membership, role, permissions, language, timezone, capabilities, and current Blueprint, Knowledge, and Decision references. Providers must isolate records by this context without adding workspace fields to every domain model unnecessarily.

## Atlas Context

Atlas receives the current Workspace and Executive IDs, language, timezone, capabilities, permission scope, Blueprint revision, Knowledge Snapshot reference, and Decision Snapshot reference. Atlas must not infer authority from data availability. A fact being visible to a provider does not grant Atlas permission to use or share it.

## Authentication Boundary

Future contracts cover sessions, access and refresh tokens, credential providers, OAuth providers, enterprise single sign-on, passwordless methods, magic links, and passkeys. These interfaces are provider boundaries only.

Authentication establishes identity claims. Authorization applies Workspace policy. Neither changes historical ownership or domain IDs.

## Enterprise Boundary

Organizations may contain departments, teams, reporting structures, executive assistants, coaches, and search consultants. Delegated permissions, shared reports, and shared Atlas observations require explicit scope, expiry, revocation, and audit attribution.

Organization administrators must not automatically receive unrestricted access to sensitive personal career records. Enterprise policy and executive ownership require a deliberate future governance model.

## Future Synchronization

Synchronization should exchange versioned identity, membership, policy, and Career Passport records through repositories. It must preserve IDs, provenance, conflict history, ownership, and append-only semantics. Conflicts must be presented rather than resolved by last-write-wins where history or consent is material.

## Current Boundary

All workspace and identity records are fictional local demonstrations. There is no authentication, authorization enforcement, credential handling, backend, database, API, durable persistence, or external identity provider.
