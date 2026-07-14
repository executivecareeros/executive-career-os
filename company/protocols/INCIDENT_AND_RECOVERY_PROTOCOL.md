# Incident and Recovery Protocol

> Purpose: Govern detection, containment, recovery, communication, and learning when Orendalis service or trust is threatened.

## Priorities

1. protect people and prevent further harm;
2. contain unauthorized access, corruption, or exposure;
3. preserve evidence and time sequence;
4. restore the safest essential service;
5. communicate facts without speculation;
6. learn and improve controls.

## Severity

- **Severity 1:** material breach, data loss, broad unauthorized access, or critical service failure;
- **Severity 2:** serious degradation or security risk affecting a core function;
- **Severity 3:** contained service issue with workaround and limited impact;
- **Severity 4:** minor operational issue without meaningful customer or security impact.

Use the current operational severity and incident playbooks for response targets and provider-specific procedures.

## Incident Lifecycle

1. declare incident, severity, timestamp, owner, and affected boundary;
2. stop non-essential change;
3. contain using the smallest safe action;
4. preserve logs and evidence without spreading sensitive content;
5. assess people, data, access, service, legal, and provider impact;
6. select and approve recovery procedure;
7. restore and validate independently;
8. communicate confirmed status and limitations;
9. monitor for recurrence;
10. complete postmortem and corrective actions.

## Recovery Standard

Recovery is not complete until integrity, authorization, data boundaries, essential journeys, monitoring, and rollback state are verified. A service being reachable is insufficient.

## Postmortem

For Severity 1 and 2, and any repeated Severity 3, record timeline, impact, detection, contributing conditions, decisions, what worked, what failed, corrective owners and dates, protocol or test changes, and residual risk. Focus on system improvement, not blame.
