# Session Architecture

> Purpose: Record the lifecycle from Supabase authentication to workspace-scoped repository execution.

1. Supabase Auth verifies email/password credentials and returns a short-lived access token plus refresh token.
2. Server actions place tokens in HTTP-only cookies according to the Remember Me choice.
3. Proxy blocks protected routes in Supabase mode when neither session cookie exists.
4. Server session resolution validates the access token and refreshes it when required.
5. Active membership resolution produces `RepositoryContext` with executive and workspace scope.
6. Supabase repositories use the access token; PostgreSQL privileges and RLS enforce access.
7. Logout revokes the Supabase session where possible and always clears local cookies.

Proxy is an early usability boundary, not the authorization authority. Every sensitive server mutation resolves the session again, and PostgreSQL remains fail-closed.
