# Career Passport

> **Purpose:** Define a portable, executive-owned package for moving verified career context across workspaces and future providers.

## Definition

A Career Passport is a versioned manifest of career records selected by the executive for export, verification, or import. It is not a public profile, identity credential, résumé, or provider account.

The Passport may include explicit scopes for Identity, Executive Blueprint, Career Ledger, Compensation, Documents, Decision snapshots, and Knowledge references. Inclusion is deliberate; the Passport does not export an entire workspace by default.

## Ownership

The executive owns the Passport and determines its scope. A Workspace or organization may help prepare or verify it but does not acquire ownership. Passport ownership is not transferable through a membership, subscription, or authentication provider.

## Versioning

Each Passport identifies its schema version, creation time, source Workspace, superseded version, record count, scopes, and permissions. A newer Passport does not erase an earlier export or silently alter imported history.

## Export and Import

An export records the request, format, included scopes, status, and expiry. An import validates schema, integrity, ownership claims, IDs, references, and conflicts before applying records. Import conflicts remain visible and must not use blind last-write-wins resolution.

## Integrity and Signature

Integrity contracts provide content and manifest hashes. A future signature may identify an algorithm, key, signer, and signing time. These structures support verification but do not themselves establish truth or authorization.

No signing or cryptography is implemented by this foundation.

## Permission and Privacy

Passport permissions distinguish reading, importing, exporting, and verifying. Workspace permissions still apply at the destination. A Passport cannot grant greater access than the owner or receiving policy permits.

Sensitive scopes—especially Compensation, personal constraints, Documents, and Decision history—require explicit selection, clear recipients, retention controls, and revocation where technically possible.

## Encryption Boundary

The Passport declares whether encryption is required and who is expected to hold keys: the executive, Workspace, or external provider. Encryption policy, key generation, custody, recovery, rotation, and revocation remain future security responsibilities.

## Future Synchronization

A Passport can become a provider-independent synchronization package. Synchronization must preserve domain IDs, versions, provenance, Career Ledger order, Blueprint revisions, and decision snapshot attribution. It must remain auditable and reversible before destructive changes.

## Current Boundary

Career Passport is a domain contract only. There is no file creation, encryption, signature, import execution, synchronization, authentication, or persistent storage.
