# Source Portfolio

> Purpose: Classify every requested opportunity source by first-revenue value, access evidence, and implementation readiness.

- **Authority:** ODS 1.0 Product track
- **Status:** Version 1 source decision complete
- **Evidence date:** 14 July 2026
- **Scope:** Product classification only; technical reachability does not constitute collection permission

## Classification Rules

- **NOW:** required for the smallest credible paid opportunity universe and supported by a controllable access path.
- **NEXT:** valuable after the first collection loop works or dependent on additional authorization, source qualification, or commercial evidence.
- **LATER:** no verified general collection right, disproportionate complexity, duplicate market coverage, or insufficient first-customer value.

Classification is a product priority, not permission to connect. Every live source still requires the Collection Engine eligibility gate and founder approval.

## Source Matrix

| Source | Classification | Version 1 treatment | Access and product rationale |
| --- | --- | --- | --- |
| Greenhouse | NOW | Structured employer-board collector | Official Job Board GET endpoints expose published jobs without authentication; strong employer-direct coverage |
| Lever | NOW | Structured employer-board collector | Official Postings API exposes published company jobs; model per company site and preserve global/EU origin |
| Ashby | NOW | Structured employer-board collector | Official public Job Postings API exposes current board jobs and optional compensation |
| Company career pages | NOW, bounded | Approved company registry using structured ATS/feed routes; direct URL import when unsupported | Essential for target-company discovery, but no arbitrary crawling in Version 1 |
| Recruiter email import | NOW | Executive uploads or forwards one message through an approved, consented intake path | Covers confidential opportunities; restricted evidence and retention required |
| Manual opportunity creation | NOW | Executive-confirmed structured form | Universal fallback and highest-control intake |
| Job URL import | NOW | One executive-supplied URL; identify known source or request confirmation | Removes copy/paste burden without promising broad collection |
| PDF job description import | NOW | Executive-supplied file, review, confirmation, and explicit retention choice | Common recruiter workflow and confidential mandate coverage |
| Personio | NEXT | Employer-specific XML feed after eligibility verification | Official XML feed exists but is enabled per employer and may vary by language/configuration |
| Recruitee | NEXT | Employer careers-site API connector | Official Careers Site API exposes jobs without authorization; add after core collectors prove normalization |
| SmartRecruiters | NEXT | Employer-specific Posting API connector | Official posting interface exists; access behavior and terms must be confirmed per intended use |
| Teamtailor | NEXT | Authorized employer/partner feed | Official APIs require keys or partner/feed arrangements; not a universal anonymous source |
| Workday | NEXT, constrained | Per-company supported career-site pattern or authorized employer integration | Workday has platform APIs, but no verified universal public job-listing interface for all tenants |
| LinkedIn Jobs | LATER unless partnership approved | Link/reference import only; no automated collection | LinkedIn Talent API access generally requires explicit partner approval and contractual restrictions; reachability is not permission |
| Welcome to the Jungle | LATER | Link import and outbound source reference | No verified open collection interface or license in current evidence; commercial/terms review required |
| Otta | LATER / alias review | Treat as a legacy or overlapping source identity until current independent access is verified | Avoid double-counting a branded source relationship without authoritative source evidence |
| Wellfound | LATER | Link import and outbound source reference | No verified open collection interface or license in current evidence; first-revenue value does not justify unsupported access |

## Why the NOW Portfolio Is Commercially Sufficient

Greenhouse, Lever, and Ashby cover many technology and growth-company career sites through structured employer-direct publications. The bounded company registry adds target-company depth. Manual, URL, PDF, and recruiter-message intake cover confidential, unsupported, and relationship-led executive opportunities.

This portfolio tests the paid value proposition—one relevant universe, less search time, better explanation—without depending on a restricted job board or broad crawler.

## Source Evidence Reviewed — 14 July 2026

- [Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html): public GET access to published jobs.
- [Lever Postings API](https://github.com/lever/postings-api): company-site published postings, including global and EU endpoints.
- [Ashby Public Job Posting API](https://developers.ashbyhq.com/docs/public-job-posting-api): published board jobs and optional compensation.
- [SmartRecruiters Posting API](https://developers.smartrecruiters.com/docs/posting-api): published company postings with documented endpoints.
- [Personio careers XML feed](https://support.personio.de/hc/en-us/articles/207576365-Integrate-jobs-from-Personio-into-your-company-website-via-XML): employer-enabled published positions.
- [Recruitee Careers Site API](https://docs.recruitee.com/reference/intro-to-careers-site-api): job viewing without authorization.
- [Teamtailor API](https://docs.teamtailor.com/) and [Job Board documentation](https://partner.teamtailor.com/job_boards/): public-data scopes require a key; partner feeds are available by arrangement.
- [LinkedIn API access documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access): most Talent programs require explicit approval and agreement.
- [Workday developer documentation](https://developer.workday.com/api-overview): platform APIs exist, but current evidence does not establish a universal public jobs-collection endpoint.

Source terms and interfaces can change. Revalidate official documentation and terms at implementation approval; this architecture is not an access grant.
