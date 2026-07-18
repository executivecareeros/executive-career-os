# Opportunity Industry Truth Sprint — 18 July 2026

## Outcome

Removed unsupported employer-industry inference from role descriptions. Explicit provider industry metadata remains authoritative; missing industry evidence now remains `Not specified` rather than being guessed from technologies or functions mentioned in a vacancy.

## Production evidence

- Atlas dock versus Next-navigation overlap: `false`.
- Measured live clearance between Next navigation and Atlas dock: `77px`.
- Staging heuristic industry classifications remaining: `0`.
- Staging Lightspeed opportunities incorrectly labelled Artificial Intelligence: `0`.
- Staging explicit verified-provider classifications preserved: `6,730`.

## Validation

- Executive search and industry classification tests: pass.
- Employer Intelligence tests: pass.
- Opportunity Intelligence tests: pass.
- Lint: pass.
- TypeScript and 133-route production build: pass.
- Migration `202607180019_remove_inferred_employer_industries.sql`: applied successfully to staging.

## Highest remaining friction

Increase verified provider industry coverage and continue lawful employer/opportunity expansion without reintroducing inferred facts.

## Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
| --- | --- | ---: | --- | --- |
| Canonical Company Intelligence (FB-018) | Founder Review Required | 94% | Critical | Expand verified industry metadata |
| Evidence-backed Opportunity Intelligence (FB-019) | Founder Review Required | 84% | Critical | Calibrate ranking after truth cleanup |
| Global employer expansion (FB-036) | Scheduler Healthy | 93% | Critical | Continue measured source expansion |
| Atlas Everywhere (FB-011) | In Progress | 55% | Critical | Connect durable conversation history |
| Public launch readiness (FB-035) | In Progress | 60% | Critical | Complete authenticated acceptance |
