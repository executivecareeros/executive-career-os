# Luna Handover

Version: 1.0  
Basis: Project Phoenix II release-candidate hardening

## Current architecture

The product is a Next.js application backed by Supabase Auth and workspace-scoped PostgreSQL data. Canonical executive profile state is derived from confirmed import sessions and professional experience. Atlas, Workspace, Opportunities, Applications, Companies, and Compensation consume authenticated workspace evidence. The Opportunity Coverage Engine supplies the shared provider, normalization, canonicalization, provenance, freshness, lifecycle, retry, health, and quality layer.

## Current providers

Production-capable adapters use the shared engine. Greenhouse is the first live scheduled cohort. Provider catalog and expansion contracts also cover Lever, Ashby, Workday, SmartRecruiters, Teamtailor, Recruitee, Personio, Workable, company career sources, manual sources, documents, URLs, recruiter submissions, and approved future providers. A provider is not live until scheduled execution and health evidence exist.

## Scheduler

The Vercel scheduler calls the server-authenticated opportunity-refresh endpoint with a staging-only secret. The isolated network staging project completed two idempotent Greenhouse runs. Job claiming prevents concurrent duplicate execution. Monitor completion, stale claims, provider errors, canonical counts, duplicates, and freshness.

## Deployment

- Application: Vercel `orendalis-staging`, released through the established exact-commit validation process.
- Network scheduler: isolated Vercel project with no production domain.
- Database and Auth: Supabase `orendalis-staging`, Frankfurt.
- Verify exact commit, alias, HTTPS, authentication, runtime logs, and executive journey after every deployment.

## Open risks

- The live provider cohort is narrow relative to global coverage goals.
- Company intelligence is sparse where sources omit employer facts.
- Application creation is executive-driven; Pursue is deliberately not represented as an employer application.
- Compensation normalization is displayed only when recorded; no conversion is inferred.
- Final browser acceptance depends on a real authenticated executive session.

## Known limitations

- No paid or contract-restricted provider is activated without Founder approval.
- Unknown remote scope, work authorization, salary, and company facts remain unknown.
- Application detail fixtures remain production-isolated until a real record-backed detail workflow exists.
- Dormant demonstration modules are available only outside production and resolve to truthful boundaries in production.

## Future roadmap

1. Increase lawful provider and employer coverage measured by canonical freshness and executive relevance.
2. Improve eligibility and confidence ranking using confirmed profile fields.
3. Expand company evidence and application timelines without inference.
4. Reduce landing-to-first-useful-opportunity time.
5. Improve Atlas explanations and daily-return value from observed behavior.

## Coding standards

Follow `company/engineering/ORENDALIS_ENGINEERING_HANDBOOK.md`: typed shared contracts, workspace-scoped repositories, deterministic tests, explicit unknown states, server-only secrets, append-only history, and small reversible changes.

## Severity ownership

- **P0:** security or workspace-isolation failure, authentication outage, data loss/corruption, invented production facts, broken canonical profile/save, or complete executive-journey outage. Contain immediately; escalate to Sol when foundations are involved.
- **P1:** major workflow, navigation, ranking, persistence, provider-health, accessibility, or trust failure with a safe workaround. Luna owns repair unless architecture changes.
- **P2:** contained copy, layout, performance, or low-frequency defect that does not compromise truth or task completion. Luna prioritizes by executive and business impact.

## Sol escalation

Escalate for architecture, platform boundaries, provider-framework contracts, search architecture, Atlas architecture, RLS/security, scaling, AI orchestration, infrastructure, or production-critical incidents requiring foundational change. Provide evidence, affected contracts, safe containment, options, and the smallest requested decision.

## Luna ownership

Luna owns UI, UX, frontend, backend, routine features, mobile, provider adapters within the shared engine, employer expansion, GOCI improvement, performance, accessibility, continuous deployment, bug fixing, and ongoing product evolution. Luna acts autonomously inside the handbook and stops only at genuine Founder or Sol gates.
