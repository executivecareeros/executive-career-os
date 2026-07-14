# Tier 1 Opportunity Coverage Decision — 14 July 2026

## Decision

Four mandatory Tier 1 ecosystems have a compliant production adapter: Greenhouse, Lever, Ashby, and employer-published Company Career Sites. LinkedIn Jobs and Workday remain mandatory Tier 1 priorities behind explicit Founder Approval Gates; neither is silently omitted or represented as active.

## Tier 1 Assessment

| Ecosystem | Strategy | Technical feasibility | Legal / contractual position | Operational risk | Expected executive coverage | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Greenhouse | Official employer Job Board API | High | Public read interface documented by provider | Low | High | Implemented |
| Lever | Official employer Postings API | High | Public employer-posting interface documented by provider | Low | High | Implemented |
| Ashby | Official public Job Posting API | High | Public employer-posting interface documented by provider | Low | Moderate | Implemented |
| Company Career Sites | Founder-supplied public HTTPS leaf page; collect only explicit `JobPosting` JSON-LD | High | Bounded public structured evidence; no crawling, redirect following, authentication, or link discovery | Moderate | High | Implemented |
| LinkedIn Jobs | Approved LinkedIn Talent Solutions partnership | Moderate after access | Explicit partner approval and agreement required; current interfaces concern posting rather than an open jobs-collection feed | High | High | Founder approval required |
| Workday | Authorized employer tenant or provider-confirmed public collection interface | Moderate | Official tenant Recruiting APIs exist, but no verified universal anonymous job-collection interface was found | High | High | Founder approval required |

## Company Career Site Boundary

The approved adapter:

- accepts only a founder-supplied public HTTPS URL;
- performs one bounded HTML request and does not follow redirects;
- rejects local, private-name, IP-address, non-HTML, oversized, and malformed inputs;
- reads only explicit Schema.org `JobPosting` JSON-LD;
- does not crawl links, search results, sitemaps, or other pages;
- emits source evidence through the common Coverage Engine;
- preserves one canonical Opportunity when another provider reports the same role.

Recurring automated crawling, general HTML extraction, authenticated access, or collection contrary to a site policy is outside this approval.

## Founder Approval Gates

### LinkedIn Jobs

- **Gate:** contractual acceptance and provider-terms acceptance.
- **Blocker:** LinkedIn states that most Talent programs require explicit approval; Job Posting access is for approved Talent Solutions partners and requires an agreement.
- **Fastest compliant path:** apply for LinkedIn Talent Solutions partner access, review the agreement and permitted data uses, then implement only the interface LinkedIn authorizes.

### Workday

- **Gate:** provider-terms acceptance and legal/compliance uncertainty.
- **Blocker:** Workday documents tenant Recruiting APIs, but the present official evidence does not establish a universal anonymous collection right across customer career sites.
- **Fastest compliant path:** obtain an authorized employer tenant or Workday partner route and written confirmation of collection and display rights before activating an adapter.

## Evidence

- [LinkedIn API access](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)
- [LinkedIn Job Posting API](https://learn.microsoft.com/en-us/linkedin/talent/job-postings/api/sync-job-postings)
- [Workday REST API Explorer](https://developer.workday.com/rest-api-explorer)
- [Google JobPosting structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [Schema.org JobPosting](https://schema.org/JobPosting)

Interfaces and terms can change. Revalidate official evidence before resolving either gate or expanding the Company Career Site operating boundary.

