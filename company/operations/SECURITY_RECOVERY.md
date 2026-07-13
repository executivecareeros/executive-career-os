# Security and Credential Recovery

> Purpose: Define safe recovery paths for company accounts and credentials without recording secrets.

## Universal Recovery Rules

1. Use a trusted, patched device and independently typed provider URL.
2. Verify scope before rotating unrelated credentials.
3. Never ask anyone to share a password, MFA code, passkey, recovery code, or token.
4. Use provider-supported recovery and record only outcome, owner, time, and safe reference.
5. Revoke sessions and rotate affected credentials after access is restored.
6. Verify MFA, recovery methods, administrators, audit logs, billing, integrations, and recent changes.
7. Treat lost administrative access or suspicious recovery changes as a security incident.

## Recovery Register

| System | Recovery path | Current factual readiness | Verification after recovery |
| --- | --- | --- | --- |
| Password manager / secret custody | Founder-controlled provider recovery plus protected offline recovery material | Secure location referenced in policy but not independently verified | Access, MFA, emergency method, stored entries, recent activity, offline copy |
| GitHub | Account recovery, passkey/authenticator/recovery method, organization owner recovery, then Support | Orendalis organization documented with one owner; 2FA enforcement and backup owner unverified | Owner list, 2FA, recovery, audit log, apps, deploy keys, webhooks, visibility |
| Microsoft 365 | Microsoft account/admin recovery, MFA/passkey or recovery method, alternate contact, Support | One Business Basic account operational; recovery controls not fully evidenced; DKIM case open | Admin roles, MFA, sessions, mailbox/aliases, licenses, audit, health, cases |
| Supabase local | Recreate from migrations and fictional seed | Proven by deterministic replay/tests | Schema, RLS, tests, local Auth and seed |
| Supabase cloud | Provider account, MFA, organization owner, billing and Support | No project exists; recovery is planned only | Owners, MFA, keys, integrations, Auth, backups, RLS, logs, billing |
| Vercel | Account/team recovery, MFA/passkey/recovery method, verified email, team owner and Support | No project exists; recovery is planned only | Owners, MFA, integrations, domains, variables, deployments, billing, activity |
| Domain registrar | Porkbun recovery using verified contact and MFA, then registrar support | Domain ownership documented; detailed recovery readiness unverified | Lock, DNSSEC, nameservers, DNS, renewal, payment, contacts, sessions, API keys |

## Secret Rotation

Rotate when a credential is exposed or suspected, an authorized person/device is lost, provider policy requires it, or an exercise identifies weakness. Rotation itself can cause outages.

Sequence: inventory consumers, create replacement, update one environment at a time, deploy, verify, revoke old credential, review logs, and document safe metadata. Production and staging credentials rotate independently.

## MFA and Passkeys

Require MFA for provider administrators. Prefer passkeys or phishing-resistant methods where supported, with a separately protected recovery method. SMS may be a fallback but should not be the only administrative factor. Readiness is incomplete until a controlled access review confirms it.

## Device Loss

From a trusted replacement device, secure email and password manager first, revoke lost-device sessions, rotate credentials stored or accessible on it, review provider logs, use remote lock/wipe where already configured, and document potential exposure. Do not restore secrets from an untrusted or unencrypted backup.
