# Backup and Recovery

> Purpose: Define how critical company records are preserved and restored.

## Backup register

| Asset | Primary | Backup method | Frequency | Retention | Recovery owner | Last restore test | Target priority |
|---|---|---|---|---|---|---|---|
| GitHub source/history | GitHub | Protected secondary clone/archive under company control | Regular and before releases | Long-term | [OWNER] | [DATE] | 1 |
| Production database | Supabase | Provider backup/PITR plus approved export where required | Provider schedule | [POLICY] | [OWNER] | [DATE] | 1 |
| Company documentation | Git repository | Secondary encrypted archive | Regular | Long-term | [OWNER] | [DATE] | 2 |
| Password/account recovery | Password manager/provider | Secure offline recovery process | On change | Current only | [OWNER] | [DATE] | 1 |
| Domain control | Registrar/DNS | Recovery email, MFA, backup admin, asset register | On change/quarterly | Current only | [OWNER] | [DATE] | 1 |

## Recovery order

Protect people and evidence first. Then restore domain/DNS, identity/authentication, database integrity, source/deployment, user communications, and secondary tools. Never restore production data into insecure development systems. A backup is not proven until a controlled restore test succeeds.

## Emergency contacts

Founder: [CONTACT] · Security: [CONTACT] · Database: [CONTACT] · Legal/privacy: [CONTACT] · Provider support: [PORTALS]
