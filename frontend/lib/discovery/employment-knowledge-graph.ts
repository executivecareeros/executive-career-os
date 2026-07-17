import type { Opportunity } from "@/types/opportunity";
import type { ConnectorOperationsSnapshot } from "./connector-operations.ts";
import type { DiscoveryEvidence, DiscoveryResult, SourceReliability } from "./types.ts";

export const employmentKnowledgeGraphVersion = "orion-knowledge-graph-v1" as const;

export const knowledgeEntityKinds = [
  "Employer", "Opportunity", "ExecutiveRole", "Location", "Compensation", "Skill", "Industry",
  "Connector", "DataSource", "Evidence", "Certification", "OperationalObservation", "AtlasInsight",
] as const;
export type KnowledgeEntityKind = (typeof knowledgeEntityKinds)[number];

export const knowledgeRelationshipKinds = [
  "EMPLOYER_OWNS_OPPORTUNITY", "OPPORTUNITY_HAS_ROLE", "OPPORTUNITY_LOCATED_IN",
  "OPPORTUNITY_OFFERS_COMPENSATION", "OPPORTUNITY_REQUIRES_SKILL", "EMPLOYER_BELONGS_TO_INDUSTRY",
  "CONNECTOR_SUPPLIES_EVIDENCE", "DATA_SOURCE_SUPPLIES_EVIDENCE", "EVIDENCE_SUPPORTS_ENTITY",
  "ATLAS_INSIGHT_REFERENCES_EVIDENCE", "OPERATIONAL_OBSERVATION_VALIDATES_CONNECTOR",
] as const;
export type KnowledgeRelationshipKind = (typeof knowledgeRelationshipKinds)[number];

export type KnowledgeConfidence = {
  score: number;
  rating: "Very Low" | "Low" | "Moderate" | "High" | "Very High";
  basis: string;
};

export type ExternalIdentity = {
  namespace: string;
  value: string;
  evidenceIds: readonly string[];
};

export type KnowledgeEntity = {
  id: string;
  kind: KnowledgeEntityKind;
  label: string;
  attributes: Readonly<Record<string, string | number | boolean | null>>;
  externalIdentities: readonly ExternalIdentity[];
  aliases: readonly { value: string; evidenceIds: readonly string[] }[];
  firstObservedAt: string;
  lastObservedAt: string;
  evidenceIds: readonly string[];
};

export type KnowledgeEvidence = {
  id: string;
  sourceRecordId: string;
  connectorId: string;
  dataSourceId: string;
  observedAt: string;
  recordedAt: string;
  confidence: KnowledgeConfidence;
  reproducible: boolean;
  reproductionReference: string | null;
  facts: Readonly<Record<string, string | number | boolean | null>>;
};

export type KnowledgeRelationship = {
  id: string;
  kind: KnowledgeRelationshipKind;
  fromEntityId: string;
  toEntityId: string;
  firstObservedAt: string;
  lastObservedAt: string;
  evidenceIds: readonly string[];
  confidence: KnowledgeConfidence;
};

export type KnowledgeAssertion = {
  id: string;
  entityId: string;
  field: string;
  values: readonly { value: string | number | boolean | null; evidenceIds: readonly string[]; confidence: KnowledgeConfidence }[];
  state: "Supported" | "Conflicted" | "Unknown";
};

export type IdentityDecision = {
  id: string;
  entityKind: "Employer" | "Opportunity";
  candidates: readonly string[];
  decision: "Merged" | "Kept Separate" | "Pending Evidence";
  evidenceIds: readonly string[];
  reason: string;
  decidedAt: string;
};

export type EmploymentKnowledgeGraph = {
  version: typeof employmentKnowledgeGraphVersion;
  generatedAt: string;
  entities: readonly KnowledgeEntity[];
  relationships: readonly KnowledgeRelationship[];
  evidence: readonly KnowledgeEvidence[];
  assertions: readonly KnowledgeAssertion[];
  identityHistory: readonly IdentityDecision[];
};

export type CertificationObservation = {
  providerId: string;
  certificationId: string;
  status: "Passed" | "Failed" | "Unknown";
  frameworkVersion: string;
  observedAt: string;
  evidenceReference: string;
};

type MutableGraph = {
  entities: Map<string, KnowledgeEntity>;
  relationships: Map<string, KnowledgeRelationship>;
  evidence: Map<string, KnowledgeEvidence>;
  assertions: Map<string, KnowledgeAssertion>;
  identityHistory: Map<string, IdentityDecision>;
};

const normalize = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
const hash = (value: string) => {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return (result >>> 0).toString(36);
};
const stableId = (prefix: string, value: string) => `${prefix}:${hash(value)}`;
const unique = <T>(values: readonly T[]) => [...new Set(values)];
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const confidence = (score: number, basis: string): KnowledgeConfidence => ({
  score: clamp(score),
  rating: score >= 90 ? "Very High" : score >= 75 ? "High" : score >= 50 ? "Moderate" : score >= 25 ? "Low" : "Very Low",
  basis,
});

const emptyGraph = (): MutableGraph => ({ entities: new Map(), relationships: new Map(), evidence: new Map(), assertions: new Map(), identityHistory: new Map() });

const addEvidence = (graph: MutableGraph, input: Omit<KnowledgeEvidence, "id">) => {
  const id = stableId("evidence", `${input.connectorId}|${input.sourceRecordId}|${input.observedAt}|${JSON.stringify(input.facts)}`);
  if (!graph.evidence.has(id)) graph.evidence.set(id, { id, ...input });
  return id;
};

const addEntity = (graph: MutableGraph, input: Omit<KnowledgeEntity, "evidenceIds"> & { evidenceIds: readonly string[] }) => {
  const existing = graph.entities.get(input.id);
  graph.entities.set(input.id, existing ? {
    ...existing,
    label: input.label || existing.label,
    attributes: { ...existing.attributes, ...input.attributes },
    externalIdentities: [...existing.externalIdentities, ...input.externalIdentities].filter((identity, index, all) => all.findIndex((candidate) => candidate.namespace === identity.namespace && candidate.value === identity.value) === index),
    aliases: [...existing.aliases, ...input.aliases].filter((alias, index, all) => all.findIndex((candidate) => candidate.value === alias.value) === index),
    firstObservedAt: existing.firstObservedAt < input.firstObservedAt ? existing.firstObservedAt : input.firstObservedAt,
    lastObservedAt: existing.lastObservedAt > input.lastObservedAt ? existing.lastObservedAt : input.lastObservedAt,
    evidenceIds: unique([...existing.evidenceIds, ...input.evidenceIds]),
  } : input);
  return input.id;
};

const addRelationship = (graph: MutableGraph, input: Omit<KnowledgeRelationship, "id">) => {
  const id = stableId("relationship", `${input.kind}|${input.fromEntityId}|${input.toEntityId}`);
  const existing = graph.relationships.get(id);
  graph.relationships.set(id, existing ? {
    ...existing,
    firstObservedAt: existing.firstObservedAt < input.firstObservedAt ? existing.firstObservedAt : input.firstObservedAt,
    lastObservedAt: existing.lastObservedAt > input.lastObservedAt ? existing.lastObservedAt : input.lastObservedAt,
    evidenceIds: unique([...existing.evidenceIds, ...input.evidenceIds]),
    confidence: existing.confidence.score >= input.confidence.score ? existing.confidence : input.confidence,
  } : { id, ...input });
  return id;
};

const addAssertion = (graph: MutableGraph, entityId: string, field: string, value: string | number | boolean | null, evidenceId: string, assertionConfidence: KnowledgeConfidence) => {
  const id = stableId("assertion", `${entityId}|${field}`);
  const existing = graph.assertions.get(id);
  const values = existing ? [...existing.values] : [];
  const matched = values.find((candidate) => candidate.value === value);
  const nextValues = matched
    ? values.map((candidate) => candidate === matched ? { ...candidate, evidenceIds: unique([...candidate.evidenceIds, evidenceId]), confidence: candidate.confidence.score >= assertionConfidence.score ? candidate.confidence : assertionConfidence } : candidate)
    : [...values, { value, evidenceIds: [evidenceId], confidence: assertionConfidence }];
  graph.assertions.set(id, { id, entityId, field, values: nextValues, state: nextValues.length > 1 ? "Conflicted" : value === null ? "Unknown" : "Supported" });
};

const sourceEvidenceFacts = (result: DiscoveryResult) => ({
  title: result.job.title,
  employer: result.job.company.name,
  location: result.job.location ?? null,
  country: result.job.country ?? result.job.company.country ?? null,
  publishedAt: result.job.publishedAt ?? null,
  originalUrl: result.job.originalUrl ?? null,
});

function employerIdentity(opportunity: Opportunity, result: DiscoveryResult) {
  if (opportunity.companyProfile?.canonicalKey) return { id: stableId("employer", `canonical-key|${opportunity.companyProfile.canonicalKey}`), basis: "Provider-supplied canonical employer key" };
  if (opportunity.employerDomain) return { id: stableId("employer", `verified-domain|${opportunity.employerDomain}`), basis: "Employer-controlled domain" };
  return { id: stableId("employer", `source-scoped|${result.provenance.source}|${result.provenance.originalId}|${normalize(opportunity.companyName)}`), basis: "Source-scoped identity; cross-source merge requires more evidence" };
}

export function projectDiscoveryResult(graph: MutableGraph, result: DiscoveryResult, recordedAt = result.provenance.discoveredAt) {
  const opportunity = result.normalizedOpportunity;
  const evidenceId = addEvidence(graph, {
    sourceRecordId: result.provenance.originalId,
    connectorId: result.provenance.connector,
    dataSourceId: result.provenance.source,
    observedAt: result.provenance.discoveredAt,
    recordedAt,
    confidence: confidence(result.provenance.confidence.score, result.provenance.confidence.rationale),
    reproducible: Boolean(result.provenance.originalUrl),
    reproductionReference: result.provenance.originalUrl ?? null,
    facts: sourceEvidenceFacts(result),
  });
  const entityConfidence = confidence(result.provenance.confidence.score, "Derived from immutable connector provenance");
  const connectorId = stableId("connector", result.provenance.connector);
  const dataSourceId = stableId("data-source", result.provenance.source);
  const evidenceEntityId = `entity:${evidenceId}`;
  const employer = employerIdentity(opportunity, result);
  const opportunityId = stableId("opportunity", opportunity.id);
  const roleId = stableId("role", normalize(opportunity.jobTitle));

  addEntity(graph, { id: connectorId, kind: "Connector", label: result.provenance.connector, attributes: {}, externalIdentities: [], aliases: [], firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId] });
  addEntity(graph, { id: dataSourceId, kind: "DataSource", label: String(result.provenance.source), attributes: { reliabilityType: result.provenance.confidence.type }, externalIdentities: [], aliases: [], firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId] });
  addEntity(graph, { id: evidenceEntityId, kind: "Evidence", label: `Observation ${result.provenance.originalId}`, attributes: { reproducible: Boolean(result.provenance.originalUrl) }, externalIdentities: [{ namespace: result.provenance.source, value: result.provenance.originalId, evidenceIds: [evidenceId] }], aliases: [], firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId] });
  addEntity(graph, { id: employer.id, kind: "Employer", label: opportunity.companyName, attributes: { officialDomain: opportunity.employerDomain ?? null, industry: opportunity.companyProfile?.industry ?? null, identityBasis: employer.basis }, externalIdentities: opportunity.companyProfile?.canonicalKey ? [{ namespace: result.provenance.source, value: opportunity.companyProfile.canonicalKey, evidenceIds: [evidenceId] }] : [], aliases: [], firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId] });
  addEntity(graph, { id: opportunityId, kind: "Opportunity", label: `${opportunity.jobTitle} at ${opportunity.companyName}`, attributes: { status: opportunity.status, canonicalUrl: opportunity.canonicalUrl ?? null, freshness: opportunity.freshness?.status ?? "Unknown" }, externalIdentities: [{ namespace: result.provenance.source, value: result.provenance.originalId, evidenceIds: [evidenceId] }], aliases: [], firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId] });
  addEntity(graph, { id: roleId, kind: "ExecutiveRole", label: opportunity.jobTitle, attributes: { normalizedTitle: opportunity.normalizedTitle ?? normalize(opportunity.jobTitle) }, externalIdentities: [], aliases: [], firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId] });

  const relationship = (kind: KnowledgeRelationshipKind, fromEntityId: string, toEntityId: string) => addRelationship(graph, { kind, fromEntityId, toEntityId, firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId], confidence: entityConfidence });
  relationship("CONNECTOR_SUPPLIES_EVIDENCE", connectorId, evidenceEntityId);
  relationship("DATA_SOURCE_SUPPLIES_EVIDENCE", dataSourceId, evidenceEntityId);
  relationship("EVIDENCE_SUPPORTS_ENTITY", evidenceEntityId, opportunityId);
  relationship("EVIDENCE_SUPPORTS_ENTITY", evidenceEntityId, employer.id);
  relationship("EMPLOYER_OWNS_OPPORTUNITY", employer.id, opportunityId);
  relationship("OPPORTUNITY_HAS_ROLE", opportunityId, roleId);

  const optionalEntity = (kind: KnowledgeEntityKind, label: string, attributes: KnowledgeEntity["attributes"], relationKind: KnowledgeRelationshipKind) => {
    const id = stableId(normalize(kind), normalize(label));
    addEntity(graph, { id, kind, label, attributes, externalIdentities: [], aliases: [], firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId] });
    relationship(relationKind, opportunityId, id);
  };
  if (opportunity.location !== "Not specified") optionalEntity("Location", opportunity.location, { country: opportunity.country === "Not specified" ? null : opportunity.country }, "OPPORTUNITY_LOCATED_IN");
  if (opportunity.salaryMin !== undefined || opportunity.salaryMax !== undefined) optionalEntity("Compensation", `${opportunity.salaryCurrency ?? "Unknown"} ${opportunity.salaryMin ?? "Unknown"}–${opportunity.salaryMax ?? "Unknown"}`, { minimum: opportunity.salaryMin ?? null, maximum: opportunity.salaryMax ?? null, currency: opportunity.salaryCurrency ?? null }, "OPPORTUNITY_OFFERS_COMPENSATION");
  for (const skill of opportunity.requiredSkills) optionalEntity("Skill", skill, {}, "OPPORTUNITY_REQUIRES_SKILL");
  if (opportunity.industry !== "Not specified") {
    const industryId = stableId("industry", normalize(opportunity.industry));
    addEntity(graph, { id: industryId, kind: "Industry", label: opportunity.industry, attributes: {}, externalIdentities: [], aliases: [], firstObservedAt: result.provenance.discoveredAt, lastObservedAt: result.provenance.discoveredAt, evidenceIds: [evidenceId] });
    relationship("EMPLOYER_BELONGS_TO_INDUSTRY", employer.id, industryId);
  }

  addAssertion(graph, opportunityId, "title", opportunity.jobTitle, evidenceId, entityConfidence);
  addAssertion(graph, opportunityId, "location", opportunity.location === "Not specified" ? null : opportunity.location, evidenceId, entityConfidence);
  addAssertion(graph, employer.id, "name", opportunity.companyName, evidenceId, entityConfidence);
  for (const sourceEvidence of result.provenance.evidence) addSourceEvidenceReference(graph, result, sourceEvidence, evidenceId);
  return { opportunityId, employerId: employer.id, evidenceId };
}

function addSourceEvidenceReference(graph: MutableGraph, result: DiscoveryResult, sourceEvidence: DiscoveryEvidence, parentEvidenceId: string) {
  const id = addEvidence(graph, { sourceRecordId: sourceEvidence.reference, connectorId: result.provenance.connector, dataSourceId: result.provenance.source, observedAt: sourceEvidence.observedAt, recordedAt: sourceEvidence.observedAt, confidence: confidence(result.provenance.confidence.score, sourceEvidence.description ?? result.provenance.confidence.rationale), reproducible: sourceEvidence.kind === "source-url", reproductionReference: sourceEvidence.kind === "source-url" ? sourceEvidence.reference : null, facts: { kind: sourceEvidence.kind, parentEvidenceId } });
  return id;
}

export function addOperationalObservation(graph: MutableGraph, snapshot: ConnectorOperationsSnapshot) {
  const evidenceId = addEvidence(graph, { sourceRecordId: `${snapshot.providerId}:${snapshot.measuredAt}`, connectorId: snapshot.providerId, dataSourceId: "orion-operations", observedAt: snapshot.measuredAt, recordedAt: snapshot.measuredAt, confidence: confidence(snapshot.operationalTrust.score ?? 0, snapshot.operationalTrust.confidence), reproducible: true, reproductionReference: "immutable connector operations snapshot", facts: { health: snapshot.health, status: snapshot.status, operationalTrust: snapshot.operationalTrust.score, certification: snapshot.certificationStatus } });
  const connectorId = stableId("connector", snapshot.providerId);
  const observationId = stableId("operational-observation", `${snapshot.providerId}|${snapshot.measuredAt}`);
  addEntity(graph, { id: connectorId, kind: "Connector", label: snapshot.providerId, attributes: {}, externalIdentities: [], aliases: [], firstObservedAt: snapshot.measuredAt, lastObservedAt: snapshot.measuredAt, evidenceIds: [evidenceId] });
  addEntity(graph, { id: observationId, kind: "OperationalObservation", label: `${snapshot.providerId} operations at ${snapshot.measuredAt}`, attributes: { health: snapshot.health, trust: snapshot.operationalTrust.score }, externalIdentities: [], aliases: [], firstObservedAt: snapshot.measuredAt, lastObservedAt: snapshot.measuredAt, evidenceIds: [evidenceId] });
  addRelationship(graph, { kind: "OPERATIONAL_OBSERVATION_VALIDATES_CONNECTOR", fromEntityId: observationId, toEntityId: connectorId, firstObservedAt: snapshot.measuredAt, lastObservedAt: snapshot.measuredAt, evidenceIds: [evidenceId], confidence: confidence(snapshot.operationalTrust.score ?? 0, snapshot.operationalTrust.confidence) });
  return observationId;
}

export function addCertificationObservation(graph: MutableGraph, observation: CertificationObservation) {
  const evidenceId = addEvidence(graph, { sourceRecordId: observation.certificationId, connectorId: observation.providerId, dataSourceId: "orion-certification", observedAt: observation.observedAt, recordedAt: observation.observedAt, confidence: confidence(observation.status === "Passed" ? 100 : observation.status === "Failed" ? 100 : 0, "Immutable certification result"), reproducible: true, reproductionReference: observation.evidenceReference, facts: { status: observation.status, frameworkVersion: observation.frameworkVersion } });
  const certificationId = stableId("certification", observation.certificationId);
  addEntity(graph, { id: certificationId, kind: "Certification", label: `${observation.providerId} certification`, attributes: { status: observation.status, frameworkVersion: observation.frameworkVersion }, externalIdentities: [{ namespace: "orion-certification", value: observation.certificationId, evidenceIds: [evidenceId] }], aliases: [], firstObservedAt: observation.observedAt, lastObservedAt: observation.observedAt, evidenceIds: [evidenceId] });
  return certificationId;
}

export function recordIdentityDecision(graph: MutableGraph, input: Omit<IdentityDecision, "id">) {
  if (input.decision === "Merged" && !input.evidenceIds.length) throw new Error("Identity merges require evidence");
  const id = stableId("identity-decision", `${input.entityKind}|${input.candidates.join("|")}|${input.decidedAt}`);
  graph.identityHistory.set(id, { id, ...input });
  return id;
}

export function createAtlasInsight(graph: MutableGraph, input: { label: string; insight: string; evidenceIds: readonly string[]; observedAt: string; confidenceScore: number }) {
  if (!input.evidenceIds.length || input.evidenceIds.some((id) => !graph.evidence.has(id))) throw new Error("Atlas insights require existing graph evidence");
  const id = stableId("atlas-insight", `${input.label}|${input.observedAt}|${input.insight}`);
  addEntity(graph, { id, kind: "AtlasInsight", label: input.label, attributes: { insight: input.insight }, externalIdentities: [], aliases: [], firstObservedAt: input.observedAt, lastObservedAt: input.observedAt, evidenceIds: input.evidenceIds });
  for (const evidenceId of input.evidenceIds) addRelationship(graph, { kind: "ATLAS_INSIGHT_REFERENCES_EVIDENCE", fromEntityId: id, toEntityId: `entity:${evidenceId}`, firstObservedAt: input.observedAt, lastObservedAt: input.observedAt, evidenceIds: [evidenceId], confidence: confidence(input.confidenceScore, "Atlas insight confidence bounded by cited graph evidence") });
  return id;
}

export function buildEmploymentKnowledgeGraph(input: { discoveryResults?: readonly DiscoveryResult[]; operations?: readonly ConnectorOperationsSnapshot[]; certifications?: readonly CertificationObservation[]; generatedAt: string }): EmploymentKnowledgeGraph {
  const graph = emptyGraph();
  for (const result of input.discoveryResults ?? []) projectDiscoveryResult(graph, result, input.generatedAt);
  for (const snapshot of input.operations ?? []) addOperationalObservation(graph, snapshot);
  for (const certification of input.certifications ?? []) addCertificationObservation(graph, certification);
  return finalizeEmploymentKnowledgeGraph(graph, input.generatedAt);
}

export function finalizeEmploymentKnowledgeGraph(graph: MutableGraph, generatedAt: string): EmploymentKnowledgeGraph {
  const sort = <T extends { id: string }>(values: Iterable<T>) => [...values].sort((a, b) => a.id.localeCompare(b.id));
  return { version: employmentKnowledgeGraphVersion, generatedAt, entities: sort(graph.entities.values()), relationships: sort(graph.relationships.values()), evidence: sort(graph.evidence.values()), assertions: sort(graph.assertions.values()), identityHistory: sort(graph.identityHistory.values()) };
}

export type AtlasKnowledgeView = {
  version: typeof employmentKnowledgeGraphVersion;
  entities: readonly KnowledgeEntity[];
  relationships: readonly KnowledgeRelationship[];
  assertions: readonly KnowledgeAssertion[];
  evidence: readonly Pick<KnowledgeEvidence, "id" | "connectorId" | "dataSourceId" | "observedAt" | "confidence" | "reproducible">[];
};

/** Atlas receives graph truth only. Raw connector payloads and records are deliberately absent. */
export function buildAtlasKnowledgeView(graph: EmploymentKnowledgeGraph): AtlasKnowledgeView {
  return { version: graph.version, entities: graph.entities, relationships: graph.relationships, assertions: graph.assertions, evidence: graph.evidence.map(({ id, connectorId, dataSourceId, observedAt, confidence: evidenceConfidence, reproducible }) => ({ id, connectorId, dataSourceId, observedAt, confidence: evidenceConfidence, reproducible })) };
}

export function measureKnowledgeGraph(graph: EmploymentKnowledgeGraph) {
  const requiredKinds: readonly KnowledgeEntityKind[] = ["Employer", "Opportunity", "ExecutiveRole", "Connector", "DataSource", "Evidence"];
  const requiredRelationships: readonly KnowledgeRelationshipKind[] = ["EMPLOYER_OWNS_OPPORTUNITY", "OPPORTUNITY_HAS_ROLE", "CONNECTOR_SUPPLIES_EVIDENCE", "DATA_SOURCE_SUPPLIES_EVIDENCE", "EVIDENCE_SUPPORTS_ENTITY"];
  const percentage = (count: number, total: number) => total ? Math.round(count / total * 1000) / 10 : 0;
  const entityCoverage = percentage(requiredKinds.filter((kind) => graph.entities.some((entity) => entity.kind === kind)).length, requiredKinds.length);
  const relationshipCoverage = percentage(requiredRelationships.filter((kind) => graph.relationships.some((relationship) => relationship.kind === kind)).length, requiredRelationships.length);
  const evidenceCoverage = percentage(graph.entities.filter((entity) => entity.evidenceIds.length).length, graph.entities.length);
  const provenanceCoverage = percentage(graph.evidence.filter((item) => item.connectorId && item.dataSourceId && item.observedAt).length, graph.evidence.length);
  const conflictResolutionCoverage = percentage(graph.assertions.filter((assertion) => assertion.state !== "Conflicted" || assertion.values.every((value) => value.evidenceIds.length)).length, graph.assertions.length);
  const atlasKnowledgeReadiness = Math.min(entityCoverage, relationshipCoverage, evidenceCoverage, provenanceCoverage);
  return { knowledgeGraphCoverage: Math.round((entityCoverage + relationshipCoverage + evidenceCoverage + provenanceCoverage) / 4 * 10) / 10, entityCoverage, relationshipCoverage, evidenceCoverage, provenanceCoverage, conflictResolutionCoverage, atlasKnowledgeReadiness, futureIntelligenceLeverage: atlasKnowledgeReadiness === 100 ? "High" : atlasKnowledgeReadiness >= 75 ? "Moderate" : "Foundational" };
}

export type KnowledgeGraphBuilder = ReturnType<typeof createKnowledgeGraphBuilder>;
export function createKnowledgeGraphBuilder() {
  const graph = emptyGraph();
  return {
    projectDiscoveryResult: (result: DiscoveryResult, recordedAt?: string) => projectDiscoveryResult(graph, result, recordedAt),
    addOperationalObservation: (snapshot: ConnectorOperationsSnapshot) => addOperationalObservation(graph, snapshot),
    addCertificationObservation: (observation: CertificationObservation) => addCertificationObservation(graph, observation),
    recordIdentityDecision: (decision: Omit<IdentityDecision, "id">) => recordIdentityDecision(graph, decision),
    createAtlasInsight: (input: Parameters<typeof createAtlasInsight>[1]) => createAtlasInsight(graph, input),
    finalize: (generatedAt: string) => finalizeEmploymentKnowledgeGraph(graph, generatedAt),
  };
}

export function reliabilityAsKnowledgeConfidence(reliability: SourceReliability) {
  return confidence(reliability.score, reliability.rationale);
}
