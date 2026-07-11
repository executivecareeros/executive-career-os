# Technical Debt Register
> **Purpose:** Preserve verified Release 0.1 debt without broad speculative refactoring.

## Durable Provider Verification

- Supabase migrations, RLS policies, triggers, and seeds require live local-runtime execution and adversarial cross-workspace tests.
- Supabase workspace/identity row mapping needs authenticated end-to-end verification.
- Multi-step atomic workflows require database functions or thin authenticated server operations.
- Generated database types are deferred until a real local or remote schema is available; no generated synchronization is claimed.
## High
- No automated behavioral test runner; lint, build, deterministic dataset checks, and browser inspection provide partial coverage only.
- No persistence boundary enforcing append-only Career Ledger or Blueprint revisions at runtime.
- No production security, privacy, tenant-isolation, retention, or deletion implementation.
## Medium
- Several source modules are densely formatted and oversized, increasing review and merge risk.
- Domain status concepts overlap across agents, discovery, knowledge, opportunities, applications, and entitlements; semantics are valid but need a future glossary and compatibility policy.
- Demo integrity validation uses source-level checks because datasets are TypeScript modules with application aliases and no lightweight runtime test harness.
- Atlas Knowledge context is structurally compatible but not yet included in decision evidence or confidence.
- Currency comparison and negotiation movement intentionally stop at equal-currency records; no FX policy exists.
## Low
- No custom not-found page; framework 404 behavior is functional but not product-specific.
- Some placeholder actions describe future behavior without a shared placeholder-action pattern.
- Architecture diagrams are textual; a versioned domain/dependency diagram would improve onboarding.
## Accepted Release Limitations
No live providers, persistence, authentication, billing, AI, background scheduling, or autonomous action are in Release 0.1.
