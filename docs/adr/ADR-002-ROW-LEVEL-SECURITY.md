# ADR-002: Row Level Security
**Status:** Accepted
## Decision
Enable RLS on every exposed table and scope user-owned records through active workspace membership and explicit permissions.
## Consequences
Browser access cannot bypass workspace isolation. Policy correctness becomes security-critical and requires runtime testing before production use.
