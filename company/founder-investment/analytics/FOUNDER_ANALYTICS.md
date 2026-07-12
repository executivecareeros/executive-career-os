# Founder Analytics

> Purpose: Summarize measured repository output and clearly bounded estimates of founder effort.

## Analytical Snapshot

Snapshot: repository `HEAD` before this analytics commit, following commit `a6244b0`.

| Metric | Value | Classification | Confidence |
| --- | --- | --- | --- |
| Commits | 43 | Measured | Very High |
| Versioned releases | 5 (`0.1`–`0.5`) | Measured from unique release labels | Very High |
| Release-labeled commits | 11 | Measured | Very High |
| Sprint-labeled commits | 15 | Measured | Very High |
| Tracked Markdown documents | 180 | Measured | Very High |
| Tracked Markdown words | 54,777 | Measured | Very High |
| Documentation-equivalent pages | Approximately 110 at 500 words per page | Estimated | Medium |
| TypeScript/TSX files | 234 | Measured | Very High |
| TypeScript/TSX lines | 2,439 | Measured physical lines | Very High |
| Page routes | 37 | Measured from `page.tsx` | Very High |
| API routes | 1 | Measured from `route.ts` | Very High |
| React component files | 66 | Measured `.tsx` files under `frontend/components` | Very High |
| Database migrations | 7 | Measured | Very High |
| Database tables | 31 | Measured `CREATE TABLE` statements | Very High |
| ADRs | 10 | Measured | Very High |
| Architecture-named documents | 3 | Measured filenames containing `ARCHITECTURE` in `docs/` | Very High |
| Test scripts | 7 | Measured `test-*.mjs` files | Very High |
| Validation scripts | 2 | Measured `validate-*.mjs` files | Very High |

## Founder Effort Estimate

| Estimate | Value | Classification | Confidence | Reasoning |
| --- | --- | --- | --- | --- |
| Total founder effort | 280–440 hours; midpoint 360 | Estimated from repository evidence | Low | The repository demonstrates unusually dense architecture, implementation, validation, infrastructure, and company-documentation output, but commit timestamps do not measure active work and some work may predate commits. |
| Engineering-equivalent days | 35–55 days at eight hours per day | Estimated | Low | Direct conversion of the total range; it is not elapsed calendar duration. |
| Documentation effort | 90–145 hours | Estimated | Low | 54,777 tracked words across 180 documents, including strategic, operational, architecture, security, and product material; drafting speed and revision time are unknown. |
| Implementation and validation effort | 150–235 hours | Estimated | Low | 234 TypeScript/TSX files, 38 routes, 66 component files, 31 tables, seven migrations, and nine test/validation scripts. |
| Infrastructure and company operations | 40–60 hours | Estimated | Low | Domain, GitHub organization, Microsoft 365 migration, DKIM work, brand research, launch planning, and company records are evidenced but not time-tracked. |

These ranges are analytical suggestions, not founder-certified time entries. They must not be used for payroll, tax, capitalization, valuation, or equity decisions without founder confirmation and professional advice.

## Counting Rules

- Counts use tracked repository content unless explicitly stated otherwise.
- A versioned release is a unique `Release 0.x` label, not every commit carrying that label.
- A route is a Next.js `page.tsx` or `route.ts` file.
- A React component file is a `.tsx` file under `frontend/components`; this avoids guessing how many component functions a file contains.
- Tests and validations are executable files in `frontend/scripts`, not individual assertions.
- Database tables are literal `CREATE TABLE` statements in versioned migrations.

