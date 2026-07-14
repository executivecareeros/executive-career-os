import { DefaultOpportunityNormalizer } from "./normalizer";
import type { ConnectorContext, DiscoveryConfiguration, DiscoveryConnector, DiscoveryHealth, DiscoveryJob, DiscoveryResult, DiscoverySource, DiscoverySourceKind, OpportunityProvider, ProviderCollectionRequest, SourceReliability, SourceReliabilityType } from "./types";

type ConnectorDefinition = { id: DiscoverySourceKind; name: string; category: SourceReliabilityType };

const definitions: readonly ConnectorDefinition[] = [
  { id: "linkedin", name: "LinkedIn", category: "Job Board" }, { id: "indeed", name: "Indeed", category: "Job Board" },
  { id: "glassdoor", name: "Glassdoor", category: "Job Board" }, { id: "stepstone", name: "StepStone", category: "Job Board" },
  { id: "wellfound", name: "Wellfound", category: "Job Board" }, { id: "greenhouse", name: "Greenhouse", category: "Corporate Website" },
  { id: "lever", name: "Lever", category: "Corporate Website" }, { id: "workday", name: "Workday", category: "Corporate Website" },
  { id: "sap-successfactors", name: "SAP SuccessFactors", category: "Corporate Website" }, { id: "smartrecruiters", name: "SmartRecruiters", category: "Corporate Website" },
  { id: "ashby", name: "Ashby", category: "Corporate Website" }, { id: "icims", name: "ICIMS", category: "Corporate Website" },
  { id: "recruitee", name: "Recruitee", category: "Corporate Website" }, { id: "personio", name: "Personio", category: "Verified Feed" },
  { id: "workable", name: "Workable", category: "Corporate Website" },
  { id: "corporate-career-site", name: "Corporate Career Site", category: "Corporate Website" }, { id: "executive-search-firm", name: "Executive Search Firm", category: "Executive Search Firm" },
  { id: "manual-import", name: "Manual Import", category: "Manual Import" }, { id: "csv-import", name: "CSV Import", category: "Manual Import" },
  { id: "rss-feed", name: "RSS Feed", category: "Verified Feed" },
];

const normalizer = new DefaultOpportunityNormalizer();

/** Architecture stub: all methods operate locally and never contact a source. */
export class DiscoveryConnectorStub implements DiscoveryConnector {
  readonly id: DiscoverySourceKind;
  readonly source: DiscoverySource;
  private status: DiscoveryHealth["status"] = "available";

  constructor(definition: ConnectorDefinition) {
    this.id = definition.id;
    this.source = { id: definition.id, name: definition.name, category: definition.category, description: `${definition.name} discovery adapter placeholder.`, capabilities: ["jobs", "companies"] };
  }

  async connect(configuration: DiscoveryConfiguration): Promise<DiscoveryHealth> { void configuration; this.status = "connected"; return this.health(); }
  async discover(context: ConnectorContext): Promise<readonly DiscoveryJob[]> {
    return [{ sourceId: `demo-${this.id}-001`, source: this.id, title: "Demonstration executive opportunity", company: { sourceId: `demo-company-${this.id}`, name: "Demonstration Company" }, discoveredAt: context.requestedAt, rawMetadata: { demo: true } }];
  }
  async normalize(job: DiscoveryJob, context: ConnectorContext): Promise<DiscoveryResult> {
    return normalizer.normalize(job, context, { type: this.source.category, rating: "moderate", score: 50, rationale: "Demonstration rating pending verification.", assessedAt: context.requestedAt });
  }
  async health(): Promise<DiscoveryHealth> { return { source: this.id, status: this.status, checkedAt: "2026-07-11T09:00:00.000Z", message: "Architecture stub; no live connection configured." }; }
  async disconnect(): Promise<void> { this.status = "available"; }
}

/** Adapts any approved connector to the collection-only provider boundary. */
export class ConnectorOpportunityProvider implements OpportunityProvider {
  readonly id: DiscoverySourceKind;
  readonly source: DiscoverySource;
  constructor(private readonly connector: DiscoveryConnector, readonly reliability: SourceReliability) {
    this.id = connector.id;
    this.source = connector.source;
  }
  async collect(request: ProviderCollectionRequest) {
    const configuration: DiscoveryConfiguration = { source: this.id, enabled: true, priority: 1, maximumResults: request.maximumResults, filters: request.filters };
    const jobs = await this.connector.discover({ configuration, runId: request.runId, requestedAt: request.requestedAt });
    return { providerId: this.id, collectedAt: new Date().toISOString(), jobs } as const;
  }
  health() { return this.connector.health(); }
}

export const discoveryConnectors: readonly DiscoveryConnector[] = definitions.map((definition) => new DiscoveryConnectorStub(definition));
export const discoverySources: readonly DiscoverySource[] = discoveryConnectors.map((connector) => connector.source);

const connector = (id: DiscoverySourceKind) => discoveryConnectors.find((item) => item.id === id)!;
export const linkedinConnector = connector("linkedin");
export const indeedConnector = connector("indeed");
export const glassdoorConnector = connector("glassdoor");
export const stepStoneConnector = connector("stepstone");
export const wellfoundConnector = connector("wellfound");
export const greenhouseConnector = connector("greenhouse");
export const leverConnector = connector("lever");
export const workdayConnector = connector("workday");
export const sapSuccessFactorsConnector = connector("sap-successfactors");
export const smartRecruitersConnector = connector("smartrecruiters");
export const ashbyConnector = connector("ashby");
export const icimsConnector = connector("icims");
export const corporateCareerSiteConnector = connector("corporate-career-site");
export const executiveSearchFirmConnector = connector("executive-search-firm");
export const manualImportConnector = connector("manual-import");
export const csvImportConnector = connector("csv-import");
export const rssFeedConnector = connector("rss-feed");
