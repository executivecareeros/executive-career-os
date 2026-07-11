# Domain Register

> Purpose: Track ownership, DNS, security, renewal, and intended use for every company domain.

| Domain | Purpose | Registrar | Purchase | Expiry | Auto Renew | DNS Provider | DNSSEC | SSL | Redirects | Owner | Reminder | Transfer Lock | Nameservers | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| [PRIMARY_DOMAIN] | Public company/product | [REGISTRAR] | [DATE] | [DATE] | [YES/NO] | [DNS] | [STATUS] | [STATUS] | [ROOT/WWW] | [OWNER] | 90/60/30 days | [STATUS] | [VALUES] | Pending |

## Planned subdomains

| Subdomain | Intended purpose | Status | Hosting/service | DNS record | SSL | Owner | Notes |
|---|---|---|---|---|---|---|---|
| `www.[DOMAIN]` | Public website | Planned | [PROVIDER] | [PENDING] | [PENDING] | [OWNER] | Canonical redirect decision required |
| `app.[DOMAIN]` | Product application | Planned | [PROVIDER] | [PENDING] | [PENDING] | [OWNER] | |
| `beta.[DOMAIN]` | Private beta/staging | Planned | [PROVIDER] | [PENDING] | [PENDING] | [OWNER] | Access controls required |
| `api.[DOMAIN]` | Future API | Future | [PROVIDER] | [PENDING] | [PENDING] | [OWNER] | Do not expose before implemented |
| `docs.[DOMAIN]` | Product/developer documentation | Future | [PROVIDER] | [PENDING] | [PENDING] | [OWNER] | |
| `mail.[DOMAIN]` | Mail/transactional service | Planned | [PROVIDER] | [PENDING] | [PENDING] | [OWNER] | Provider instructions only |
| `status.[DOMAIN]` | Public service status | Future | [PROVIDER] | [PENDING] | [PENDING] | [OWNER] | Prefer independent hosting |

Never store transfer authorization codes or registrar credentials in this file.
