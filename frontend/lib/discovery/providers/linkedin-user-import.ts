import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types.ts";

const LINKEDIN_HOSTS = new Set(["linkedin.com", "www.linkedin.com"]);
const linkedinJobPath = /^\/jobs\/view\/(?:[^/?#]*-)?(\d+)(?:\/)?$/i;
const labelled = (text: string, name: string) => text.match(new RegExp(`^\\s*${name}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim();

export type LinkedInVisibleDetails = {
  title?: string;
  company?: string;
  location?: string;
  employerUrl?: string;
  visibleText?: string;
};

export function parseLinkedInJobUrl(locator: string) {
  let url: URL;
  try { url = new URL(locator.trim()); } catch { throw new Error("Enter a valid LinkedIn job URL."); }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  const pathMatch = url.pathname.match(linkedinJobPath);
  const queryId = url.searchParams.get("currentJobId");
  const jobId = pathMatch?.[1] ?? (queryId && /^\d+$/.test(queryId) ? queryId : undefined);
  if (url.protocol !== "https:" || !LINKEDIN_HOSTS.has(host) || !jobId) throw new Error("Use a public LinkedIn job URL such as linkedin.com/jobs/view/1234567890.");
  return { url: `https://www.linkedin.com/jobs/view/${jobId}`, jobId };
}

export function extractVisibleLinkedInDetails(value: string): LinkedInVisibleDetails {
  const visibleText = value.trim();
  if (!visibleText) return {};
  const lines = visibleText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const externalUrl = [...visibleText.matchAll(/https:\/\/[^\s<>"']+/gi)]
    .map((match) => match[0].replace(/[),.;]+$/, ""))
    .find((candidate) => {
      try { return !LINKEDIN_HOSTS.has(new URL(candidate).hostname.toLowerCase()); } catch { return false; }
    });
  return {
    title: labelled(visibleText, "(?:role|title|position)") ?? lines[0],
    company: labelled(visibleText, "(?:company|employer)") ?? lines[1],
    location: labelled(visibleText, "location") ?? lines[2],
    employerUrl: labelled(visibleText, "(?:employer application|application|apply|source) url") ?? externalUrl,
    visibleText,
  };
}

export function resolveEmployerApplicationUrl(explicitUrl: string, visibleDetails: LinkedInVisibleDetails) {
  const candidate = explicitUrl.trim() || visibleDetails.employerUrl?.trim();
  if (!candidate) return undefined;
  let url: URL;
  try { url = new URL(candidate); } catch { throw new Error("The employer application URL is invalid."); }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:" || LINKEDIN_HOSTS.has(host) || url.username || url.password) throw new Error("Use a public HTTPS employer or ATS application URL.");
  url.hash = "";
  return url.toString();
}

export class LinkedInUserImportProvider implements OpportunityProvider {
  readonly id = "linkedin" as const;
  readonly source = { id: this.id, name: "LinkedIn discovery", category: "Job Board" as const, description: "A private observation supplied by the executive from a LinkedIn job page they chose to access.", capabilities: ["jobs", "companies"] as const };
  readonly reliability = { type: "Job Board" as const, rating: "low" as const, score: 35, rationale: "User-supplied visible LinkedIn details remain unverified until matched to an employer-controlled record.", assessedAt: new Date().toISOString() };

  constructor(readonly linkedInUrl: string, readonly jobId: string, readonly details: LinkedInVisibleDetails, readonly authoritative?: DiscoveryJob) {}

  async collect(request: ProviderCollectionRequest) {
    const discoveredAt = new Date().toISOString();
    const authoritative = this.authoritative;
    const title = authoritative?.title ?? this.details.title ?? `LinkedIn opportunity ${this.jobId}`;
    const companyName = authoritative?.company.name ?? this.details.company ?? "Employer not confirmed";
    const location = authoritative?.location ?? this.details.location ?? "Not specified";
    const job: DiscoveryJob = {
      sourceId: this.jobId,
      source: this.id,
      title,
      company: {
        sourceId: authoritative?.company.sourceId ?? companyName,
        canonicalKey: authoritative?.company.canonicalKey,
        name: companyName,
        website: authoritative?.company.website,
        country: authoritative?.company.country,
      },
      location,
      country: authoritative?.country,
      description: authoritative?.description ?? this.details.visibleText,
      originalUrl: this.linkedInUrl,
      publishedAt: authoritative?.publishedAt,
      discoveredAt,
      employmentType: authoritative?.employmentType,
      salary: authoritative?.salary,
      rawMetadata: {
        workArrangement: authoritative?.rawMetadata.workArrangement,
        visibility: "Private",
        verificationStatus: authoritative ? "Employer source matched" : "Unverified LinkedIn observation",
        userAuthorized: true,
        linkedInWasFetched: false,
      },
    };
    return { providerId: this.id, collectedAt: discoveredAt, jobs: [job].slice(0, request.maximumResults), sourceRevision: `user-import:${this.jobId}` } as const;
  }

  async health(): Promise<DiscoveryHealth> {
    return { source: this.id, status: "connected", checkedAt: new Date().toISOString(), message: "Ready for an explicit user-authorized import. LinkedIn is not fetched or automated." };
  }
}
