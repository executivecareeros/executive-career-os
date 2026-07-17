# Provenance Model

Last updated: 2026-07-17 · Version: `orion-knowledge-graph-v1`

Permanent provenance runs from connector and data source to evidence, then from evidence to supported entities and relationships. Each observation retains original source identity, observation time, normalization confidence, reproducibility, and refresh history through repeated evidence.

Connectors are evidence producers, not authoritative owners. Removal, failure, or replacement of a connector cannot erase historical graph evidence. An ATS board remains careers provenance and never becomes an official employer domain without separate employer-controlled evidence. Operational trust qualifies the connector observation; it does not rewrite the observed fact.

The current implementation is a deterministic projection. Durable graph storage is intentionally deferred until live projection volume and query needs justify a schema under the same contracts.
