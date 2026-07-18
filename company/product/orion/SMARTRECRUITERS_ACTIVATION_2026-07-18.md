# SmartRecruiters Live Activation — 18 July 2026

## Outcome

The first verified SmartRecruiters cohort is live in isolated network staging through the existing Opportunity Coverage Engine. No provider-specific persistence path or new infrastructure was created.

## Discovery and admission

- 102 verified SmartRecruiters employers.
- 16,336 advertised active postings at discovery time; this is source potential, not canonical inventory.
- 102 schedules enabled with official employer career-page locators.
- Maximum 250 records per employer run.
- Three-job scheduler capacity, staggered in 15-minute groups.
- Official public Posting API, no credentials, public employer postings only.

## Durable evidence

- First employer: 250 discovered and 250 changed.
- Replay: 250 rediscovered and 0 changed.
- Two additional employers: 500 changed.
- Aggregate: four successful runs, 1,000 discovered, 750 changed, zero current failures.
- 750 active canonical SmartRecruiters opportunities at capture.
- Total active canonical inventory: 24,014.

## Expansion defect removed

Employer schedule registration now deduplicates by normalized official careers URL as well as source key. This prevents legacy `global:*` keys and current provider-derived keys from scheduling the same employer twice. A regression test covers the legacy-key replay.

## Validation

SmartRecruiters connector, source factory, scheduler security/durability, provider expansion, connector operations, TypeScript, ESLint, and production build passed. The remaining cohort continues automatically; future inventory is not claimed until measured.
