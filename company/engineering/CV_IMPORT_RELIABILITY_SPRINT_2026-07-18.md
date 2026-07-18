# CV Import Reliability Sprint — 2026-07-18

## Executive outcome

A second, founder-authorized executive CV exposed a zero-role extraction failure caused by a different but common layout: employer and location on one line, title and dates on the next, slash-separated date ranges, one start-only current role, and multiple promotions under one employer. The production parser now supports this structure without weakening the Founder CV path.

The source CV and its personal contents were not added to the repository. Regression coverage uses a fictional, structurally equivalent fixture.

## Measured improvement

| Measure | Before | After |
|---|---:|---:|
| Roles recovered from the authorized validation CV | 0 | 12 |
| Employers recovered | 0 | 10 |
| Internal promotions retained | 0 | 3 roles under one employer |
| Role locations recovered | 0 | 12 |
| Education records recovered | 0 | 4 |
| Verified competencies recovered | 0 | 11 |
| Non-role section leakage into employment fields | Present risk | 0 observed |
| Unsupported languages or certifications invented | Not measured | 0 |

## Product corrections

- Handles employer/location and title/date paired lines.
- Handles `/`, dash, and `to` date ranges plus start-only current roles.
- Preserves promotions without duplicating the employer.
- Separates explicit employer descriptions from role responsibilities.
- Leaves unknown role descriptions, languages, certifications, and other absent facts blank.
- Adds editable location, employment type, leadership scope, geography, industries, technologies, and certifications to the confirmation experience.
- Persists the additional confirmed fields with the role evidence.
- Keeps raw CV files out of storage and Git.

## Validation

- Authorized CV structural validation: pass.
- Founder CV regression: pass.
- Fictional multi-layout regression: pass.
- TypeScript: pass.
- ESLint: pass.
- Production build: pass.

## Remaining limitation

Image-only scanned PDFs still require a separately approved OCR capability. They fail safely rather than inventing content. The next import-quality cycle should add more anonymized structural fixtures before considering OCR.

## Founder Backlog Dashboard

| Founder Request | Status | Progress | Priority | Next Action |
|---|---|---:|---|---|
| CV Upload & Profile Accuracy | 🟢 Advanced | 92% | Critical | Validate this CV in the live confirmation screen |
| Website Redesign | 🟢 Advanced | 91% | High | Continue real-user mobile validation |
| Homepage Redesign | 🟢 Advanced | 94% | High | Measure first-use clarity |
| Branding & Logo | 🟢 Advanced | 96% | High | Complete remaining surface audit |
| Company Intelligence | 🟢 Advanced | 90% | Critical | Continue verified enrichment |
| Atlas Improvements | 🟢 Advanced | 90% | Critical | Calibrate with confirmed profile facts |
| Executive Rooms | 🟢 Advanced | 89% | High | Validate live governance and participation |
| Executive Workspace | 🟢 Advanced | 88% | High | Confirm imported detail visibility |
| Knowledge Graph | 🟢 Advanced | 87% | Medium | Strengthen confirmed entity relationships |
| Trust Engine | 🟢 Advanced | 88% | Medium | Expand field-level evidence display |
