# Development Metrics

> Purpose: Provide reproducible repository measurements without presenting file counts as quality or business value.

## Inventory

| Area | Count | Method | Confidence |
| --- | --- | --- | --- |
| Commits | 43 | `git rev-list --count HEAD` | Very High |
| Markdown documents | 180 | Tracked `*.md` files | Very High |
| Architecture documents | 3 | Top-level `docs/*ARCHITECTURE*.md` | Very High |
| ADRs | 10 | `docs/adr/ADR-*.md` | Very High |
| TypeScript/TSX files | 234 | Source files under `frontend`, excluding generated/dependency directories | Very High |
| TypeScript/TSX physical lines | 2,439 | Line count across the same source files | Very High |
| React component files | 66 | `frontend/components/**/*.tsx` | Very High |
| Page routes | 37 | `frontend/app/**/page.tsx` | Very High |
| API routes | 1 | `frontend/app/**/route.ts` | Very High |
| Total application routes | 38 | Page plus API route files | Very High |
| Database migrations | 7 | `supabase/migrations/*.sql` | Very High |
| Database tables | 31 | Case-insensitive `CREATE TABLE` statements | Very High |
| Test scripts | 7 | `frontend/scripts/test-*.mjs` | Very High |
| Validation scripts | 2 | `frontend/scripts/validate-*.mjs` | Very High |

## Documentation Volume

| Measure | Value | Classification |
| --- | --- | --- |
| Markdown words | 54,777 | Measured |
| Markdown lines | 6,297 | Measured |
| Page-equivalent at 500 words/page | Approximately 110 | Estimated; Medium confidence |

## Interpretation Limits

File, line, route, table, and commit counts describe repository scale. They do not directly measure correctness, maintainability, user value, security, or founder effort. Compact files and consolidated commits can contain substantial work; large files and frequent commits do not necessarily represent higher value.

