# Executive Onboarding

> Purpose: Describe the minimal, trust-first beginning of an executive’s Career Memory.

## Experience

Onboarding collects preferred name, current role, optional employer, country, preferred language, timezone, and long-term career ambition. Blueprint depth is intentionally deferred and gathered progressively.

Before provisioning, the executive explicitly accepts the Atlas Promise. The acceptance timestamp is retained on Executive Identity and in workspace settings.

## Atomic workspace creation

The authenticated provisioning repository function is idempotent and atomic. It creates or attaches:

- Executive Identity linked to the Supabase Auth user
- Personal Workspace
- active Owner membership
- default localized settings
- empty Executive Blueprint
- empty Career Ledger context
- initial Atlas ready context

The function derives the provider identifier from `auth.uid()`, accepts no caller-supplied identity or workspace ID, has a fixed search path, and grants execution only to authenticated users. A repeated call returns the existing personal workspace.

## Progressive memory

The welcome experience explains that Career Ledger, Executive Blueprint, and Atlas are ready without presenting invented career content. Future context is requested naturally as the executive uses the product.
