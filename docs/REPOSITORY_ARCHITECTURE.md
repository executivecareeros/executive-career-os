# Repository and Persistence Architecture

> **Purpose:** Define the provider-independent persistence boundary for Executive Career OS.

## Repository Pattern

Domain and decision logic depend on repository interfaces, not storage technologies. A repository exposes consistent find, query, create, update, archive, restore, append, existence, count, search, validation, and health operations. Results carry typed errors and provider metadata.

The current Memory provider loads fictional seed records and gives the application a deterministic runtime. Seed modules are provider inputs; they are not the long-term persistence boundary.

## Provider Independence

Repository operations support immediate or asynchronous results so local memory remains simple while remote providers can perform I/O. Provider contracts define Memory, Local Storage, IndexedDB, Supabase, PostgreSQL, REST, GraphQL, and Enterprise adapters without importing an SDK or changing domain models.

Business rules must not inspect provider kind. Provider selection belongs at composition time.

## Domain Repositories

Separate repository contracts cover Applications, Opportunities, Companies, Compensation, Career Ledger, Executive Blueprint, Knowledge, Discovery, Atlas decisions, Settings, Entitlements, and Documents. Shared query contracts provide filtering, sorting, pagination, search, counts, validation, and health.

## Append-Only Enforcement

Career Ledger entries, compensation history, Atlas decision snapshots, Blueprint history, Knowledge observations, Discovery results, and document versions use append-oriented repositories. Their memory implementation rejects `update` with an `APPEND_ONLY` error. Corrections, archive, and restore are represented as new domain events rather than destructive replacement.

Archive is not deletion. Providers must retain historical attribution and ordering.

## Transactions and Unit of Work

`UnitOfWork`, `RepositorySession`, and `TransactionScope` define future atomic coordination. A change set records created, updated, appended, archived, and restored entities. Commit and rollback return typed results. Audit entries, version stamps, and optimistic-concurrency tokens preserve accountability.

The Memory provider deliberately reports no transaction capability; transaction contracts are architectural until a provider can guarantee their semantics.

## Versioning and Concurrency

Providers must preserve entity IDs, domain versions, repository versions, and append ordering. Optimistic concurrency compares a version stamp before accepting mutable updates. Append-only streams reject replacement regardless of token validity.

## Caching

The cache boundary supports memory, persistent, Atlas, and Knowledge caches. Entries carry a version, creation time, and optional expiry. Invalidation may target key, prefix, or version. The deterministic memory cache is the only implementation and performs no background work.

Cache is never the source of truth. Historical and security-sensitive data must not be served beyond its authorization or version boundary.

## Migration Strategy

1. Register a provider and verify declared capabilities and health.
2. Run ordered, idempotent migrations from the recorded provider version.
3. Import seed or prior-provider records without changing domain IDs.
4. Validate references, append ordering, versions, and audit attribution.
5. Compare record counts and deterministic domain outputs.
6. Switch provider composition only after read validation.
7. Enable writes gradually, with rollback and reconciliation available.

Migrations must never rewrite history silently. Corrections and schema transformations remain distinguishable from business events.

## Future Persistence

Browser-local providers may suit private single-device use. Supabase or PostgreSQL adapters may support managed multi-device persistence. REST, GraphQL, and Enterprise adapters may bridge governed systems. Each must implement the same repository contracts and security boundary without leaking provider concepts into domain models.

No database, authentication, external API, ORM, or durable storage is present in this foundation.
