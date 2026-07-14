# Release Protocol

> Purpose: Control how Orendalis changes move from approved source to staging, production, and acceptance.

## Environments

- **Development:** local, reversible work with fictional or approved isolated data.
- **Staging:** production-like validation, isolated credentials and data, no implied public readiness.
- **Production:** customer-facing environment requiring separate explicit approval.

Environment credentials, data, callbacks, domains, and providers must remain separated.

## Release Gates

1. **Scope freeze:** release contents and exclusions are fixed.
2. **Source readiness:** review complete, branch state known, build and required tests pass.
3. **Data readiness:** migrations, RLS, backups, recovery, and compatibility validated.
4. **Security readiness:** access, secrets, dependencies, headers, privacy, and abuse risks reviewed.
5. **Operational readiness:** monitoring, support, incident, rollback, and owner available.
6. **Deployment approval:** exact environment, revision, sequence, and rollback approved.
7. **Deployment validation:** health and smoke tests pass.
8. **Acceptance:** founder or named owner validates the required journey.
9. **Closure:** release record, residual risks, incidents, and next actions preserved.

## Execution

Deploy one environment and phase at a time. Record exact revision and migration state. Stop on failed validation. Do not compensate for a failed release by changing unrelated provider, DNS, authentication, or production settings.

## Rollback

Before deployment, define trigger, decision owner, last-known-good revision, data implications, procedure, verification, and communication. When database reversal is unsafe, use an approved forward repair and preserve the original migration.

## Release Decision Vocabulary

- **Ready for staging:** all pre-staging gates passed.
- **Ready for acceptance:** deployment is healthy; user acceptance remains.
- **Accepted:** acceptance criteria passed.
- **Accepted with residual risk:** proper authority explicitly accepted named risks.
- **Return to development:** a blocker prevents acceptance.
- **Rolled back:** the release was withdrawn and verified.

Deployment success alone must never be reported as release acceptance.
