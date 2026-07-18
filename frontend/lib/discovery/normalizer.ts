import type { Opportunity } from "@/types/opportunity";
import type { ConnectorContext, DiscoveryJob, DiscoveryResult, OpportunityNormalizer, SourceReliability } from "./types";
import { classifyOpportunityIndustry } from "./industry-classification.ts";
import { extractPublishedCompensation } from "./published-compensation.ts";
import { canonicalCountry } from "./country-normalization.ts";

export const NORMALIZATION_VERSION = "1.1.0";

export function opportunityContentFingerprint(job: DiscoveryJob) {
  const value = [job.title, job.company.canonicalKey ?? job.company.name, job.location, job.country, job.description, job.employmentType, job.publishedAt]
    .map((part) => String(part ?? "").normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase()).join("\u001f");
  const fnv = (seed: number) => { let hash = seed >>> 0; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 0x01000193) >>> 0; } return hash.toString(16).padStart(8, "0"); };
  return `fnv1a32x2:${fnv(0x811c9dc5)}${fnv(0x9e3779b9)}`;
}

/** Pure normalization boundary. Atlas receives only the resulting Opportunity. */
export class DefaultOpportunityNormalizer implements OpportunityNormalizer {
  readonly version = NORMALIZATION_VERSION;

  normalize(job: DiscoveryJob, context: ConnectorContext, reliability: SourceReliability): DiscoveryResult {
    const companyInitials = job.company.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 3).toUpperCase();
    const sourceKind = reliability.type === "Job Board" ? "Job Board" : reliability.type === "Executive Search Firm" ? "Recruiter" : reliability.type === "Manual Import" ? "Manual" : "Employer";
    const staleAfterHours = reliability.type === "Manual Import" ? 336 : reliability.type === "Executive Search Firm" ? 72 : 36;
    const workArrangement = job.rawMetadata.workArrangement === "Remote" || job.rawMetadata.workArrangement === "Hybrid" || job.rawMetadata.workArrangement === "On-site" ? job.rawMetadata.workArrangement : "Unknown";
    const employmentType = job.employmentType === "Full-time" || job.employmentType === "Contract" || job.employmentType === "Interim" ? job.employmentType : "Unknown";
    const canonicalUrl = job.originalUrl?.replace(/[?#].*$/, "");
    const industry = classifyOpportunityIndustry(job);
    const compensation = job.salary ?? extractPublishedCompensation(job.description);
    let employerDomain: string | undefined;
    // An ATS posting URL identifies the publishing system, not the employer.
    // Only an employer-controlled website may establish employerDomain.
    try { employerDomain = job.company.website ? new URL(job.company.website).hostname.toLowerCase().replace(/^www\./, "") : undefined; } catch { /* Unknown remains explicit. */ }
    const country = canonicalCountry(job.country ?? job.company.country) ?? "Not specified";
    const opportunity: Opportunity = {
      id: `discovered-${job.source}-${job.sourceId}`,
      externalIds: [job.sourceId],
      normalizedTitle: job.title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim(),
      canonicalUrl,
      employerDomain,
      companyName: job.company.name,
      companyInitials,
      contentFingerprint: opportunityContentFingerprint(job),
      atlasAnalysisStatus: "Pending",
      jobTitle: job.title,
      location: job.location ?? "Not specified",
      country,
      workArrangement,
      employmentType,
      industry: industry.value,
      industryClassification: { source: industry.source, confidence: industry.confidence, fingerprint: industry.fingerprint },
      companySize: job.company.size ?? "Not specified",
      source: job.source,
      sourceUrl: job.originalUrl,
      visibility: "Private",
      verificationStatus: job.rawMetadata.verificationStatus === "Employer source matched" ? "Employer source matched" : job.rawMetadata.verificationStatus === "Unverified LinkedIn observation" ? "Unverified LinkedIn observation" : undefined,
      sources: [{ id: job.source, name: job.source, kind: sourceKind, originalId: job.sourceId, originalUrl: job.originalUrl, collectedAt: job.discoveredAt, confidence: reliability.score >= 75 ? "High" : reliability.score >= 50 ? "Medium" : "Low", firstSeenAt: job.discoveredAt, lastSeenAt: job.discoveredAt, lastFetchedAt: job.discoveredAt, lastVerifiedAt: job.discoveredAt, status: "Active", fetchStatus: "Succeeded", parserVersion: this.version }],
      lastObservedAt: job.discoveredAt,
      freshness: { status: "Fresh", lastObservedAt: job.discoveredAt, ageHours: 0, staleAfterHours },
      lifecycle: [{ status: "Discovered", occurredAt: job.discoveredAt, reason: `Collected from ${job.source}`, source: "System" }],
      companyProfile: { canonicalKey: job.company.canonicalKey, name: job.company.name, website: job.company.website, careersUrl: job.company.careersUrl, industry: job.company.industry, size: job.company.size, evidenceStatus: job.company.website || job.company.careersUrl || job.company.industry || job.company.size ? "Partial" : "Unknown" },
      publishedAt: job.publishedAt ?? job.discoveredAt,
      discoveredAt: job.discoveredAt,
      salaryMin: compensation?.minimum,
      salaryMax: compensation?.maximum,
      salaryCurrency: compensation?.currency,
      salaryDisclosure: compensation?.minimum !== undefined && compensation?.maximum !== undefined ? "Published range" : compensation?.minimum !== undefined ? "Published minimum" : compensation?.maximum !== undefined ? "Published maximum" : "Not disclosed",
      executiveFitScore: 0,
      strategicOpportunityScore: 0,
      overallScore: 0,
      confidenceScore: reliability.score,
      canonicalizationConfidence: reliability.score,
      completenessScore: Math.round([job.title, job.company.name, job.location, job.country, job.description, job.originalUrl, job.publishedAt].filter(Boolean).length / 7 * 100),
      legitimacyState: reliability.score >= 75 ? "Verified" : reliability.score >= 50 ? "Probable" : "Unverified",
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
      warnings: reliability.score < 75 ? ["Source record requires additional verification before executive action."] : [],
    };
  }
}
