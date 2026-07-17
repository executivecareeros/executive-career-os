# Relationship Model

Last updated: 2026-07-17 · Version: `orion-knowledge-graph-v1`

Canonical relationships are: Employer owns Opportunity; Opportunity has Executive Role, Location, Compensation, or required Skill; Employer belongs to Industry; Connector and Data Source supply Evidence; Evidence supports Entity; Atlas Insight references Evidence; Operational Observation validates Connector.

Every relationship has stable endpoints, first and last observation time, evidence IDs, and confidence with an explicit basis. Re-observation extends the evidence chain and observation window; it does not duplicate the edge. Relationships that cannot cite evidence are not created.

“Owns” means the employer is identified by the source as offering the opportunity; it does not assert legal ownership. “Belongs to Industry” requires an explicit classification. Similar-company, related-role, reporting-line, reputation, employment-outcome, and person-to-employer relationships remain outside M5 until evidence quality and a consuming use case are proven.
