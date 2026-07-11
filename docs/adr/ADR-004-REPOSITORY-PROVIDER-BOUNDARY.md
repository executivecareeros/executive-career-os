# ADR-004: Repository Provider Boundary
**Status:** Accepted
## Decision
Domain consumers depend on repository contracts. Memory and Supabase are selected at composition time.
## Consequences
Supabase types and errors are mapped before reaching domain code. Future providers can be added without changing business models, but adapters must preserve workspace, history, and validation semantics.
