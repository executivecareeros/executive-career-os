import type { DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";
import { ProviderSdk } from "../provider-sdk.ts";
import { greenhouseProviderManifest } from "./manifests.ts";
import { plainText } from "./provider-utils.ts";
import { countryFromExplicitLocation } from "../country-normalization.ts";

type GreenhouseJob = {
  id: number;
  title: string;
  updated_at: string;
  absolute_url: string;
  location?: { name?: string };
  content?: string;
  departments?: Array<{ name?: string }>;
  offices?: Array<{ name?: string; location?: string }>;
};

type GreenhouseBoard = { name: string };
type GreenhouseJobs = { jobs: GreenhouseJob[]; meta?: { total?: number } };

const API_ORIGIN = "https://boards-api.greenhouse.io";
const BOARD_HOSTS = new Set(["boards.greenhouse.io", "job-boards.greenhouse.io", "boards.eu.greenhouse.io"]);

export function parseGreenhouseBoardToken(locator: string) {
  const value = locator.trim();
  if (/^[a-z0-9_-]+$/i.test(value)) return value;
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Enter a Greenhouse careers URL or board name."); }
  if (url.protocol !== "https:" || !BOARD_HOSTS.has(url.hostname.toLowerCase())) throw new Error("Only public Greenhouse careers URLs are supported.");
  const token = url.pathname.split("/").filter(Boolean)[0];
  if (!token || !/^[a-z0-9_-]+$/i.test(token)) throw new Error("The Greenhouse board name could not be identified.");
  return token;
}

export function countryFromGreenhouseLocation(value: string | undefined | null) {
  return countryFromExplicitLocation(value);
}

function countryFrom(job: GreenhouseJob) {
  const location = job.location?.name ?? job.offices?.map((office) => office.location).find(Boolean);
  return countryFromGreenhouseLocation(location);
}

export class GreenhouseOpportunityProvider implements OpportunityProvider {
  readonly id = greenhouseProviderManifest.identity.id;
  readonly sdk: ProviderSdk;
  readonly source;
  readonly reliability;

  constructor(readonly boardToken: string, fetcher: typeof fetch = fetch) {
    this.sdk = new ProviderSdk(greenhouseProviderManifest, fetcher);
    this.source = this.sdk.source;
    this.reliability = this.sdk.reliability;
  }

  private async get<T>(path: string): Promise<T> {
    return this.sdk.json<T>(`${API_ORIGIN}${path}`, "This Greenhouse careers board was not found.");
  }

  async collect(request: ProviderCollectionRequest) {
    const token = encodeURIComponent(this.boardToken);
    const [board, listing] = await Promise.all([this.get<GreenhouseBoard>(`/v1/boards/${token}`), this.get<GreenhouseJobs>(`/v1/boards/${token}/jobs?content=true`)]);
    const discoveredAt = new Date().toISOString();
    const jobs: DiscoveryJob[] = listing.jobs.map((job) => ({
      sourceId: `${this.boardToken}-${job.id}`,
      source: this.id,
      title: job.title,
      company: { sourceId: this.boardToken, canonicalKey: `greenhouse:${this.boardToken}`, name: board.name, careersUrl: `https://boards.greenhouse.io/${this.boardToken}`, country: countryFrom(job) },
      location: job.location?.name,
      country: countryFrom(job),
      description: plainText(job.content),
      originalUrl: job.absolute_url,
      publishedAt: job.updated_at,
      discoveredAt,
      rawMetadata: {
        boardToken: this.boardToken,
        departments: job.departments?.map((department) => department.name).filter(Boolean) ?? [],
        offices: job.offices?.map((office) => office.name).filter(Boolean) ?? [],
        workArrangement: /\bremote\b/i.test(job.location?.name ?? "") ? "Remote" : undefined,
      },
    }));
    return this.sdk.batch({ collectedAt: discoveredAt, jobs: jobs.slice(0, request.maximumResults), sourceRevision: `${this.boardToken}:${listing.meta?.total ?? jobs.length}` });
  }

  health() {
    return this.sdk.health(() => this.get<GreenhouseBoard>(`/v1/boards/${encodeURIComponent(this.boardToken)}`), "Public Greenhouse job board is available.", "Greenhouse is unavailable.");
  }
}
