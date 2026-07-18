# Source Portfolio

> Purpose: Classify every requested opportunity source by first-revenue value, access evidence, and implementation readiness.

- **Authority:** ODS 2.0 Product track and permanent Executive Opportunity Universe Directive
- **Status:** Active provider portfolio; supersedes the original three-provider Version 1 boundary
- **Evidence date:** 14 July 2026
- **Scope:** Product classification only; technical reachability does not constitute collection permission

## Classification Rules

- **NOW:** required for the smallest credible paid opportunity universe and supported by a controllable access path.
- **NEXT:** valuable after the first collection loop works or dependent on additional authorization, source qualification, or commercial evidence.
- **LATER:** no verified general collection right, disproportionate complexity, duplicate market coverage, or insufficient first-customer value.

Classification is a product priority, not permission to connect. Every live source still requires the Collection Engine eligibility gate. Compliant sources proceed under the standing delegation; only reserved founder gates require approval.

## Source Matrix

| Source | Classification | Version 1 treatment | Access and product rationale |
| --- | --- | --- | --- |
| Greenhouse | NOW | Structured employer-board collector | Official Job Board GET endpoints expose published jobs without authentication; strong employer-direct coverage |
| Lever | NOW | Structured employer-board collector | Official Postings API exposes published company jobs; model per company site and preserve global/EU origin |
| Ashby | NOW | Structured employer-board collector | Official public Job Postings API exposes current board jobs and optional compensation |
| Recruitee | NOW | Employer Careers Site API collector | Official unauthenticated Careers Site API exposes published jobs with structured location, description, and application links |
| Personio | NOW | Employer-enabled XML feed collector | Official public XML career feed exposes employer-published jobs when enabled, including multilingual feed support |
| Workable | NOW | Public employer-jobs collector | Official public account endpoint exposes published jobs and optional detailed descriptions without an API credential |
| Company career pages | NOW, bounded | Single-page collector for explicit Schema.org `JobPosting` evidence, plus structured ATS/feed routes | Essential target-company coverage without arbitrary crawling, redirect following, or link discovery |
| Recruiter email import | NOW | Executive uploads or forwards one message through an approved, consented intake path | Covers confidential opportunities; restricted evidence and retention required |
| Manual opportunity creation | NOW | Executive-confirmed structured form | Universal fallback and highest-control intake |
| Job URL import | NOW | One executive-supplied URL; identify known source or request confirmation | Removes copy/paste burden without promising broad collection |
| PDF job description import | NOW | Executive-supplied file, review, confirmation, and explicit retention choice | Common recruiter workflow and confidential mandate coverage |
| SmartRecruiters | NOW, live in isolated network staging | Employer-specific official Posting API connector | 102 verified employer schedules are enabled; first run and zero-change replay passed through the common engine with public postings, bounded concurrency, and source attribution |
| Teamtailor | NEXT | Authorized employer/partner feed | Official APIs require keys or partner/feed arrangements; not a universal anonymous source |
| Workday | TIER 1, Founder gate | Authorized employer tenant or provider-confirmed public collection interface | Official tenant Recruiting APIs exist, but no verified universal anonymous collection interface or collection right has been established |
| LinkedIn Jobs | TIER 1, Founder gate | Approved LinkedIn Talent Solutions partnership; link/reference import remains available | LinkedIn Talent access requires explicit partner approval and contractual acceptance; reachability is not permission |
| Welcome to the Jungle | LATER | Link import and outbound source reference | No verified open collection interface or license in current evidence; commercial/terms review required |
| Otta | LATER / alias review | Treat as a legacy or overlapping source identity until current independent access is verified | Avoid double-counting a branded source relationship without authoritative source evidence |
| Wellfound | LATER | Link import and outbound source reference | No verified open collection interface or license in current evidence; first-revenue value does not justify unsupported access |

## Current Coverage Position

Greenhouse, Lever, Ashby, Recruitee, Personio, and Workable cover a wider mix of technology, growth-company, European, and general employer career ecosystems through structured employer-direct publications. The bounded Company Career Site adapter adds target-company depth wherever an employer publishes explicit `JobPosting` structured data. Manual, URL, PDF, and recruiter-message intake cover confidential, unsupported, and relationship-led executive opportunities.

This portfolio tests the paid value proposition—one relevant universe, less search time, better explanation—without depending on a restricted job board or broad crawler.

## Source Evidence Reviewed — 14 July 2026

- [Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html): public GET access to published jobs.
- [Lever Postings API](https://github.com/lever/postings-api): company-site published postings, including global and EU endpoints.
- [Ashby Public Job Posting API](https://developers.ashbyhq.com/docs/public-job-posting-api): published board jobs and optional compensation.
- [SmartRecruiters Posting API](https://developers.smartrecruiters.com/docs/posting-api): published company postings with documented endpoints.
- [Personio careers XML feed](https://support.personio.de/hc/en-us/articles/207576365-Integrate-jobs-from-Personio-into-your-company-website-via-XML): employer-enabled published positions.
- [Recruitee Careers Site API](https://docs.recruitee.com/reference/intro-to-careers-site-api): job viewing without authorization.
- [Workable public jobs endpoint](https://workable.readme.io/reference/jobs-1): published account jobs without authentication.
- [Teamtailor API](https://docs.teamtailor.com/) and [Job Board documentation](https://partner.teamtailor.com/job_boards/): public-data scopes require a key; partner feeds are available by arrangement.
- [LinkedIn API access documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access): most Talent programs require explicit approval and agreement.
- [Workday developer documentation](https://developer.workday.com/api-overview): platform APIs exist, but current evidence does not establish a universal public jobs-collection endpoint.

Source terms and interfaces can change. Revalidate official documentation and terms at implementation approval; this architecture is not an access grant.

## Demand-led expansion order — 17 July 2026

The executable ranking in `frontend/lib/discovery/source-expansion.ts` prioritizes expected unique useful inventory, observed demand coverage, geographic coverage, reliability, access confidence, duplicate overlap, and effort. It does not treat brand recognition or raw provider count as value.

| Sequence | Source ecosystem | Access position | Next executable action |
| ---: | --- | --- | --- |
| 1 | SmartRecruiters | Official public employer posting interface; no credential required for public postings | Continue the admitted 102-employer staggered cohort and replace point-in-time inventory snapshots only after completed persistence |
| 2 | Workday | Authorized tenant or provider-confirmed interface | Confirm collection rights through an authorized tenant or partnership |
| 3 | SAP SuccessFactors | Authorized employer OData integration | Obtain an authorized tenant and validate data-use terms |
| 4 | Teamtailor | Authorized employer or partner feed | Obtain an authorized feed or partner credential |
| 5 | iCIMS | Authorized employer integration | Qualify an employer-authorized integration and contractual basis |
| 6 | Oracle Recruiting / Taleo | Authorized employer integration | Identify a supported employer publication interface |
| 7 | Executive search partner feeds | Contracted partner feed | Secure the first partner agreement and confidential-data terms |
| 8 | Public and international institution feeds | Official APIs, XML, JSON, or RSS | Select the highest-demand official feed and implement the structured-feed adapter |
| 9 | BambooHR | Employer-published feed or authorized API | Validate the public employer feed pattern and add a reusable adapter |
| 10 | Jobvite | Employer-published feed or authorized integration | Qualify a permitted employer-scoped endpoint |

The precise ordering is recalculated from demand and coverage inputs. Any contractual, paid, legal, or personal-data gate remains disabled until Founder approval.
