# Session Architecture

> Purpose: Record the lifecycle from Supabase authentication to workspace-scoped repository execution.

1. Invitation-only registration requests a Supabase confirmation message without accepting the invitation or creating a session.
2. `/auth/confirm` verifies the single-use token, revalidates the invitation and invited email, then stores a session only after both checks pass.
3. Supabase Auth sign-in returns a short-lived access token plus refresh token only for an eligible confirmed account.
4. Server actions place tokens in HTTP-only cookies according to the Remember Me choice.
5. Proxy blocks protected routes in Supabase mode when neither session cookie exists.
6. Server session resolution validates the access token, requires `email_confirmed_at`, and refreshes only a confirmed session.
7. Active membership resolution produces `RepositoryContext` with executive and workspace scope.
8. Supabase repositories use the access token; PostgreSQL privileges and RLS enforce access.
9. Logout revokes the Supabase session where possible and always clears local cookies.

Proxy is an early usability boundary, not the authorization authority. Every sensitive server mutation resolves the session again, and PostgreSQL remains fail-closed.

Invitation cookies are single-purpose and removed after acceptance or a mismatched returning login. Callback acceptance is strict; ordinary login cannot be poisoned by stale invitation state. All generated URLs use the configured application origin to preserve cookie scope and prevent caller-controlled redirects.
## Founder bootstrap session

The founder bootstrap uses the same HTTP-only Supabase session lifecycle as every other authenticated route. The callback returns to `/founder-bootstrap`; the server and database independently require a confirmed email. No service-role session or browser-accessible administrative token is introduced.
