# Staging Authentication Configuration

> Purpose: Record the safe, factual Supabase Auth URL configuration for the isolated staging environment.

## Configuration

- Site URL: `https://project-qmvs1.vercel.app`
- Allowed staging redirects:
  - `https://project-qmvs1.vercel.app/auth/confirm`
  - `https://project-qmvs1.vercel.app/reset-password`
  - `https://project-qmvs1.vercel.app/register`
- Allowed local redirects:
  - `http://localhost:3000/auth/confirm`
  - `http://localhost:3000/reset-password`
  - `http://localhost:3000/register`

No wildcard, production callback, OAuth provider, SMTP provider, user, or application deployment was introduced. The Vercel origin is assigned and canonical for current staging configuration, but it has not served a deployment yet. Any future hostname change requires an Auth URL review before use.
