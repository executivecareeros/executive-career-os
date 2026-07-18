# Opportunity Factory P0 Acceleration — 2026-07-18

## Highest-value constraint removed

The live factory used only 6 of 12 validated provider executions and 18 of 50 verified-source qualifications per cycle. Production defaults now use both existing hard ceilings. No duration, retry, canonical identity, workspace isolation or source-verification control was relaxed.

## Measurable capacity change

| Measure | Before | After | Change |
|---|---:|---:|---:|
| Provider refreshes per 15-minute cycle | 6 | 12 | 2.0× |
| Verified employer qualifications per cycle | 18 | 50 | 2.78× |
| Theoretical provider refreshes per day | 576 | 1,152 | +576 |
| Theoretical source qualifications per day | 1,728 | 4,800 | +3,072 |
| AI-token usage | 0 | 0 | unchanged |

These figures describe bounded processing capacity, not guaranteed inventory growth. Actual yield depends on unique active public sources, provider health, canonical duplicates and runtime completion.

## 250,000-employer acquisition model

A service-controlled global target registry now defines evidence-backed employer candidates, independent country quotas up to 1,000, deterministic acquisition priority, official-domain identity, source evidence, career-source qualification state and active-opportunity yield. Its global ceiling is 250,000 targets and its first operational inventory objective is 3,000,000 active canonical opportunities.

Targets rank by evidence relevant to acquisition efficiency: employer scale, official identity, careers URL, structured publication surface, executive-hiring evidence and international operation. Rank is an acquisition priority, not a claim about prestige or employer quality. Countries with fewer than 1,000 qualifying employers remain truthfully below quota.

## Safety and quality

- Only verified public employer sources enter schedules.
- Existing provider APIs and employer-published feeds remain authoritative.
- Repeated schedules and opportunities remain idempotent.
- Provider failures remain isolated and retry bounded.
- One role reported by multiple sources remains one canonical opportunity.
- No LinkedIn scraping, credentials, cookies, access-control bypass, paid data or AI tokens were introduced.

## Validation

- Global target selection and country quota tests passed.
- Scheduler security and durability tests passed.
- Employer-source preparation and replay tests passed.
- Transaction-safe batch persistence tests passed.
- TypeScript and lint passed.

## Next highest-return action

Apply the target-registry migration, deploy the higher-throughput scheduler, and measure the first full 24-hour cycle. The next engineering expansion is a lawful target-source resolver that maps country-ranked employers to supported ATS feeds and qualified first-party career systems.

## Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| Global employer expansion | 🟢 P0 Factory Acceleration | 97% | Critical | Apply registry migration and measure 24-hour canonical yield |
| Opportunity Intelligence | 🟢 Advanced | 87% | Critical | Calibrate ranking on expanded inventory |
| Company Intelligence | 🟡 Founder Review Required | 94% | Critical | Enrich newly qualified enterprise employers |
| Executive Search | 🟢 Advanced | 92% | Critical | Validate relevance as the inventory grows |
| Role-first opportunity pages | 🟡 Founder Review Required | 92% | Critical | Validate the new hierarchy on desktop and mobile |
