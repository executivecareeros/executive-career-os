# Quality Assurance Protocol

> Purpose: Define how Orendalis proves that a change works, remains safe, and delivers the intended experience.

## Test Layers

Use the layers relevant to risk:

- static analysis and type safety;
- unit and deterministic domain tests;
- integration and repository tests;
- database, migration, RLS, and privilege tests;
- authentication and authorization tests;
- route and API tests;
- end-to-end user journeys;
- accessibility and keyboard checks;
- responsive desktop, tablet, and mobile checks;
- performance and reliability observations;
- security and privacy adversarial checks;
- rollback and recovery exercises;
- founder or customer acceptance.

## Test Data

Use fictional, isolated, deterministic data unless the authorized acceptance task explicitly requires the authenticated founder’s own staging account. Never use customer or production data casually. Test artifacts must not leak secrets or personal information.

## Defects

Every material defect records severity, environment, reproduction, expected behavior, actual behavior, evidence, probable subsystem, security or data impact, workaround, owner, regression risk, and resolution validation.

Severity:

- **Critical:** material security, privacy, data loss, unauthorized access, or unusable essential service;
- **High:** blocks a core journey or creates a serious trust or integrity failure;
- **Medium:** meaningful friction or incorrect behavior with a viable workaround;
- **Low:** limited defect with minor impact;
- **Suggestion:** improvement without incorrect behavior.

## Acceptance Gates

Tests passing does not equal user acceptance. Acceptance requires:

- defined criteria met;
- no unresolved critical or high defect unless explicitly accepted by proper authority;
- truthful empty and error states;
- relevant accessibility and responsive behavior;
- no unexplained console or server errors;
- residual risks documented;
- accountable owner decision.

## Failed or Skipped Validation

Never conceal a skipped check. State what was not run, why, the risk created, and what must happen before the next gate. A check blocked by unavailable infrastructure is not a pass.
