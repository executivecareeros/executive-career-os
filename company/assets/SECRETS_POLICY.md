# Secrets Policy

> Purpose: Prevent credential exposure and define controlled production access and rotation.

## Rules

1. Never commit passwords, API keys, private keys, tokens, recovery codes, database credentials, or signing secrets.
2. Never send secrets through public chat, email, tickets, screenshots, documents, or messaging applications.
3. Store application configuration in scoped environment variables and credentials in an approved password/secret manager.
4. Browser-safe publishable configuration is not equivalent to a privileged secret; server-only secrets must never use a public prefix.
5. Grant production access only to named people with a current operational need, unique identity, MFA, and least privilege.
6. Review access quarterly and immediately after role changes or incidents.
7. Rotate credentials on suspected exposure, personnel changes, vendor incidents, or scheduled policy intervals.

## Emergency rotation

1. Pause affected functionality and assign an incident owner.
2. Preserve logs and evidence; do not hide the exposure.
3. Revoke or rotate the credential at the issuing provider.
4. Update approved secret stores for each environment.
5. Redeploy/restart only affected services and test authentication, RLS, and core flows.
6. Review access logs and affected data; consult security/legal professionals where appropriate.
7. Record timeline, scope, new credential identifier—not value—and preventive action.

No secret value belongs in this repository.
