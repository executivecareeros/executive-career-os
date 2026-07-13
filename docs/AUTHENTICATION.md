# Authentication

> Purpose: Define how secure Supabase authentication attaches to Executive Identity and workspace-scoped repositories.

## Boundary

Authentication proves control of credentials. Executive Identity remains the stable career-domain identity; the Supabase user identifier is stored only as its provider-specific `auth_user_id`. Authentication never replaces the identity model.

Email/password registration, email verification, sign-in, password recovery, logout, refresh, session cookies, and protected routing use Supabase Auth. OAuth, social providers, passkeys, magic links, and service-role credentials are not present.

Invitation acceptance and session creation occur only after Supabase reports `email_confirmed_at`. The database independently checks the provider user before accepting an invitation or provisioning a Workspace. An unverified access token therefore cannot cross the server or database boundary.

## Session lifecycle

Access and refresh tokens are stored in secure, HTTP-only, same-site cookies. “Remember me” persists the refresh cookie for 30 days; otherwise it is a browser-session cookie. Server code validates the access token with Supabase and refreshes it when necessary. Invalid or expired sessions fail closed and return the executive to sign-in. The browser never receives a service-role secret.

Next.js Proxy performs the early route gate in Supabase mode. Server actions perform the authoritative session checks before mutations. Memory-demo mode remains unprotected for the deterministic product demonstration.

## Repository context

After authentication, the active membership resolves the executive ID, workspace ID, membership ID, role, and request correlation fields. The access token creates authenticated Supabase repositories; PostgreSQL RLS remains the final authorization boundary. Missing sessions or memberships produce no context and never fall back silently.

## Configuration

Set `NEXT_PUBLIC_DATA_ACCESS_MODE=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and one approved `NEXT_PUBLIC_APP_URL`. Server-only aliases may be used on the server. Configure Supabase Auth site URL and allow only the approved `/auth/confirm` and password-recovery destinations. Never configure a service-role value in a public variable.

Local acceptance enables provider confirmation and captures fictional messages in Supabase Mailpit. This is simulated local delivery, not accepted external delivery.
