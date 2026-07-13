# Founder Bootstrap Architecture

> Purpose: Define the single-use mechanism that establishes the first founder-owned Workspace in a fresh Orendalis environment.

## Problem and boundary

The original flow required a Workspace to issue an invitation, an accepted invitation to provision a Workspace, and an existing Owner membership to access Company Control. A fresh environment therefore had no secure first step.

`bootstrap_initial_founder(boolean)` is the only exception to invitation-first provisioning. It is not an administrative user-creation API. The authenticated caller supplies only explicit Atlas Promise acceptance. PostgreSQL derives the user ID and verified email from Supabase Auth and compares it with a protected, single-row database configuration.

## Transaction

One serialized transaction creates the Executive Identity, personal Workspace, active Owner membership, default settings, empty Executive Blueprint, system-only Career Ledger initialization, evidence-empty Atlas context, and immutable bootstrap audit event. Any failure rolls back every write.

An advisory transaction lock serializes concurrent attempts. The singleton audit constraint permits exactly one successful bootstrap. A retry by the same Auth user returns `ALREADY_BOOTSTRAPPED`; every other later caller receives `CLOSED`.

## Lifecycle

1. An environment administrator configures the founder email through `configure_initial_founder_email(text)` in a privileged database session.
2. The founder registers or signs in at `/founder-bootstrap` and verifies the email through Supabase Auth.
3. The founder explicitly accepts the Atlas Promise.
4. The database verifies the fresh-state preconditions and commits atomically.
5. Company Control becomes available. Invitation-only access remains the sole path for later users.

The configuration locks after success and cannot be changed by browser roles. No service-role key is present in the browser or application configuration.
