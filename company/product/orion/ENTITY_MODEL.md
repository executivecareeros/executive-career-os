# Entity Model

Last updated: 2026-07-17 · Version: `orion-knowledge-graph-v1`

| Entity | Justified purpose | Identity basis | Created only when |
|---|---|---|---|
| Employer | Organization offering work | provider canonical key or employer-controlled domain; otherwise source-scoped | employer name is observed |
| Opportunity | Canonical employment opening | existing canonical Opportunity ID | normalized observation exists |
| Executive Role | Reusable role concept | normalized observed title | title is observed |
| Location | Geographic fact | normalized explicit location | not “Not specified” |
| Compensation | Evidenced pay range | observed currency and bounds | at least one bound exists |
| Skill | Explicit requirement | normalized explicit skill | source/normalized record supplies it |
| Industry | Employer classification | normalized explicit industry | not “Not specified” |
| Connector | Collection mechanism | connector ID | evidence names the connector |
| Data Source | Origin ecosystem | source ID | evidence names the source |
| Evidence | Immutable observation | connector + source record + time + facts | an observation is projected |
| Certification | Connector contract result | certification evidence ID | certification evidence is supplied |
| Operational Observation | Connector behavior at a time | provider + measurement time | operations snapshot exists |
| Atlas Insight | Evidence-backed intelligence output | insight content + observation time | every cited evidence ID exists |

All entities carry first/last observation times, evidence IDs, explicit external identities, and evidenced aliases. Missing optional facts remain `null` or absent and never produce speculative nodes.
