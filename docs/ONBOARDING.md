# Executive Onboarding

> Purpose: Describe the minimal, trust-first beginning of an executive’s Career Memory.

## Experience

Onboarding collects preferred name, current role, optional employer, country, preferred language, timezone, and long-term career ambition. Blueprint depth is intentionally deferred and gathered progressively.

Before onboarding can open, the provider email must be confirmed and the matching invitation accepted. Before provisioning, the executive explicitly accepts the Atlas Promise. The acceptance timestamp is retained on Executive Identity and in workspace settings.

## Atomic workspace creation

The authenticated provisioning repository function is idempotent and atomic. It creates or attaches:

- Executive Identity linked to the Supabase Auth user
- Personal Workspace
- active Owner membership
- default localized settings
- empty Executive Blueprint
- empty Career Ledger context
- initial Atlas ready context

The function derives the provider identifier from `auth.uid()`, checks `auth.users.email_confirmed_at`, requires an Accepted invitation for that user, accepts no caller-supplied identity or workspace ID, has a fixed search path, and grants execution only to authenticated users. A repeated call returns the existing personal workspace.

## Progressive memory

The welcome experience explains that Career Ledger, Executive Blueprint, and Atlas are ready without presenting invented career content. Future context is requested naturally as the executive uses the product.
> After Workspace creation, the executive may import professional history through the separate consent and review flow. Blueprint suggestions remain opt-in.
## Founder initialization

The founding user is established before normal invited onboarding through the one-time `/founder-bootstrap` flow. It creates only empty career contexts and a pending onboarding profile; it does not invent professional facts. All subsequent executives follow accepted-invitation provisioning.
