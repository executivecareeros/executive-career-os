# LinkedIn Talent Solutions / Apply Connect Partnership Application Package

## Status

Submitted through LinkedIn's official Talent Solutions Partner Request Form on 2026-07-18. LinkedIn confirmed receipt and stated that its Business Development team will contact Orendalis if it elects to proceed. No LinkedIn agreement, API access, commercial commitment, or data permission is implied.

## Applicant

| Field | Prepared response |
|---|---|
| Company | Orendalis |
| Website | https://www.orendalis.com |
| Product | Private executive career intelligence and decision-support platform |
| Contact | Cuneyt Sen — cuneyt.sen@orendalis.com |
| Legal entity | Founder to complete |
| Company LinkedIn ID | Founder to complete if available |
| Markets served | Global opportunity network; headquarters and current controlled validation in EMEA |
| Current customer volume | 0 external customers; pre-launch controlled founder validation |
| Active opportunity inventory reported | 29,401 at submission time |

## Partnership request

Orendalis requests a discovery conversation with LinkedIn Talent Solutions to determine whether an approved Jobs or Talent Solutions partnership can support a compliant, user-controlled executive opportunity experience.

The current Orendalis product does **not** scrape LinkedIn, automate LinkedIn accounts, store LinkedIn credentials or cookies, or bypass access controls. Executives can voluntarily import a LinkedIn job URL and visible details into a private workspace. Orendalis then prioritizes an employer or ATS record as the authoritative source wherever one can be identified through a public, approved route. LinkedIn remains the discovery source in provenance.

## Intended member value

- Reduce repeated searching across fragmented public job and employer systems.
- Preserve the member’s discovery source while resolving authoritative employer evidence.
- Deduplicate repeated observations into one private canonical opportunity.
- Explain confirmed, estimated, and unknown evidence without inventing facts.
- Support the member’s own Pursue, Watch, or Skip decision; Orendalis does not apply automatically.

## Requested LinkedIn guidance

1. Which approved LinkedIn Talent Solutions program, if any, is suitable for a candidate-side private opportunity intelligence product?
2. Whether a sanctioned job-discovery or job-reference interface is available for this use case.
3. Whether Apply Connect is applicable; current official documentation describes it primarily as an ATS-to-LinkedIn job-posting and applicant-delivery integration.
4. Permitted storage, provenance, refresh, display, deletion, and retention rules for any LinkedIn-supplied job fields.
5. Required member consent, customer terms, security review, certification, support, and audit controls.
6. Commercial prerequisites, minimum commitments, and approval stages.

## Technical readiness

Orendalis has a provider-neutral Opportunity Coverage Engine. A future approved LinkedIn adapter would be restricted to the exact program scope granted by LinkedIn and would pass through the same validation, normalization, canonical identity, conservative deduplication, source attribution, freshness, lifecycle, retry, monitoring, and quality controls as every other source.

Current safeguards:

- workspace-isolated storage and row-level access controls;
- private-by-default opportunity records;
- explicit user consent for imports;
- no LinkedIn authentication, cookie, or session storage;
- no background LinkedIn collection;
- no automated application submission;
- employer-controlled evidence takes precedence over job-board observations;
- uncertainty remains visible to the executive and Atlas;
- repeat imports are idempotent;
- outbound employer URLs are restricted to public HTTPS destinations with SSRF controls;
- secrets are excluded from client code, repositories, logs, and documentation.

## Proposed data flow if LinkedIn approves access

1. Executive gives informed consent or invokes an approved LinkedIn flow.
2. LinkedIn provides only the fields and identifiers authorized by the applicable program.
3. Orendalis records LinkedIn provenance and the authorization context.
4. The Coverage Engine normalizes and conservatively matches the observation.
5. Employer/ATS evidence is refreshed through separately approved public or authorized sources.
6. One canonical private opportunity is presented to the executive.
7. Atlas evaluates only attributable evidence and labels uncertainty.
8. Revocation, deletion, retention, and refresh follow LinkedIn’s approved requirements and Orendalis privacy controls.

## Apply Connect fit assessment

LinkedIn’s current official material describes Apply Connect as an ATS integration for real-time job posting, LinkedIn Apply, applicant delivery, and optional applicant notifications. It requires partner/customer configuration and acceptance of applicable LinkedIn Jobs terms. Orendalis is not currently an ATS posting customer jobs to LinkedIn, so suitability is **unconfirmed** and must be determined by LinkedIn before implementation.

No claim is made that Apply Connect grants a general job-discovery feed or permission to collect LinkedIn Jobs.

## Security and privacy evidence available for review

- architecture and data-flow description;
- access-control and workspace-isolation tests;
- URL and SSRF tests;
- provenance and deduplication tests;
- data minimization and consent language;
- incident, recovery, deletion, and change-management runbooks;
- subprocessor and retention register after legal review;
- penetration-test or independent security evidence when required by the partnership process.

## Questions requiring founder or legal completion before agreement or production access

- legal entity, registered address, and authorized signatory;
- commercial contact and technical contact;
- current customer and opportunity volume;
- target countries and regulatory scope;
- privacy notice, DPA, subprocessors, and retention commitments applicable to LinkedIn data;
- insurance, security certification, penetration testing, and business-continuity evidence requested by LinkedIn;
- any fee, minimum commitment, Jobs terms, partner agreement, or commercial promise.

## Founder agreement gate

The nonbinding partner inquiry is submitted. Do not accept LinkedIn API terms, a partner agreement, data restrictions, fees, minimum commitments, or production permissions until the founder has reviewed the requested permissions, data uses, cost, contractual commitments, rollback, and program fit.

## Submission evidence

- Official form: LinkedIn Talent Solutions Partner Request Form.
- Product classification: Job Board.
- Requested integration: Job Postings, with supporting text requesting guidance on Apply Connect or another sanctioned Talent Solutions interface if more appropriate.
- Customer statement: pre-launch, no external customers.
- LinkedIn response: partnership request received and queued for Business Development review; no response-time or approval commitment provided.

## Official references reviewed

- [LinkedIn Apply Connect prerequisites and feature availability](https://www.linkedin.com/help/recruiter/answer/a513223)
- [LinkedIn Apply Connect FAQ](https://www.linkedin.com/help/recruiter/answer/a1445778)
- [LinkedIn Apply Connect API overview](https://learn.microsoft.com/en-us/linkedin/talent/apply-connect/create-apply-connect-jobs)
- [LinkedIn Apply Connect migration and job matching](https://www.linkedin.com/help/recruiter/answer/a7173836)
- [LinkedIn ATS integration feature matrix](https://www.linkedin.com/help/recruiter/answer/a1463694)
