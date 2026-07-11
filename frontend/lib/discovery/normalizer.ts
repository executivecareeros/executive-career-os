import type { Opportunity } from "@/types/opportunity";
import type { ConnectorContext, DiscoveryJob, DiscoveryResult, OpportunityNormalizer, SourceReliability } from "./types";

export const NORMALIZATION_VERSION = "1.0.0";

/** Pure normalization boundary. Atlas receives only the resulting Opportunity. */
export class DefaultOpportunityNormalizer implements OpportunityNormalizer {
  readonly version = NORMALIZATION_VERSION;

  normalize(job: DiscoveryJob, context: ConnectorContext, reliability: SourceReliability): DiscoveryResult {
    const companyInitials = job.company.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 3).toUpperCase();
    const opportunity: Opportunity = {
      id: `discovered-${job.source}-${job.sourceId}`,
      companyName: job.company.name,
      companyInitials,
      jobTitle: job.title,
      location: job.location ?? "Not specified",
      country: job.country ?? job.company.country ?? "Not specified",
      workArrangement: "On-site",
      employmentType: "Full-time",
      industry: job.company.industry ?? "Not specified",
      companySize: job.company.size ?? "Not specified",
      source: job.source,
      sourceUrl: job.originalUrl,
      publishedAt: job.publishedAt ?? job.discoveredAt,
      discoveredAt: job.discoveredAt,
      salaryMin: job.salary?.minimum,
      salaryMax: job.salary?.maximum,
      salaryCurrency: job.salary?.currency,
      executiveFitScore: 0,
      strategicOpportunityScore: 0,
      overallScore: 0,
      confidenceScore: reliability.score,
      status: "Discovered",
      priority: "Low",
      travelRequirement: "Not assessed",
      summary: job.description ?? "Awaiting assessment.",
      keyResponsibilities: [], requiredSkills: [], preferredSkills: [], matchingStrengths: [], missingRequirements: [], riskFlags: [], exclusions: [],
      decisionRationale: "Awaiting Atlas assessment.", recommendedCVProfile: "Not assessed", coverLetterRecommended: false, notes: "",
    };

    return {
      job,
      normalizedOpportunity: opportunity,
      provenance: {
        source: job.source, connector: job.source, discoveredAt: job.discoveredAt, originalUrl: job.originalUrl,
        originalId: job.sourceId, normalizationVersion: this.version, importRunId: context.runId, confidence: reliability,
        evidence: [{ kind: "source-record", reference: job.sourceId, observedAt: job.discoveredAt }],
      },
      warnings: ["Demo normalization only; source record has not been externally verified."],
    };
  }
}
