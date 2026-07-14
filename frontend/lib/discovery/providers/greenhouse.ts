import type { DiscoveryHealth, DiscoveryJob, OpportunityProvider, ProviderCollectionRequest } from "../types";

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

function plainText(value?: string) {
  return value?.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, "\"").replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
}

function countryFrom(job: GreenhouseJob) {
  const location = job.location?.name ?? job.offices?.map((office) => office.location).find(Boolean);
  return location?.split(",").at(-1)?.trim();
}

export class GreenhouseOpportunityProvider implements OpportunityProvider {
  readonly id = "greenhouse" as const;
  readonly source = { id: this.id, name: "Greenhouse", category: "Corporate Website" as const, description: "Published employer opportunities from the Greenhouse Job Board API.", capabilities: ["jobs", "companies"] as const };
  readonly reliability = { type: "Corporate Website" as const, rating: "high" as const, score: 90, rationale: "Published directly through the employer's public Greenhouse job board.", assessedAt: new Date().toISOString() };

  constructor(readonly boardToken: string, private readonly fetcher: typeof fetch = fetch) {}

  private async get<T>(path: string): Promise<T> {
    const response = await this.fetcher(`${API_ORIGIN}${path}`, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(12_000) });
    if (!response.ok) {
      const error = Object.assign(new Error(response.status === 404 ? "This Greenhouse careers board was not found." : `Greenhouse returned ${response.status}.`), { code: response.status === 404 ? "BOARD_NOT_FOUND" : "GREENHOUSE_UNAVAILABLE", retryable: response.status >= 500 || response.status === 429 });
      throw error;
    }
    return response.json() as Promise<T>;
  }

  async collect(request: ProviderCollectionRequest) {
    const token = encodeURIComponent(this.boardToken);
    const [board, listing] = await Promise.all([this.get<GreenhouseBoard>(`/v1/boards/${token}`), this.get<GreenhouseJobs>(`/v1/boards/${token}/jobs?content=true`)]);
    const discoveredAt = new Date().toISOString();
    const jobs: DiscoveryJob[] = listing.jobs.map((job) => ({
      sourceId: `${this.boardToken}-${job.id}`,
      source: this.id,
      title: job.title,
      company: { sourceId: this.boardToken, name: board.name, country: countryFrom(job), website: `https://job-boards.greenhouse.io/${this.boardToken}` },
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
    return { providerId: this.id, collectedAt: discoveredAt, jobs: jobs.slice(0, request.maximumResults), sourceRevision: `${this.boardToken}:${listing.meta?.total ?? jobs.length}` } as const;
  }

  async health(): Promise<DiscoveryHealth> {
    const started = Date.now();
    try {
      await this.get<GreenhouseBoard>(`/v1/boards/${encodeURIComponent(this.boardToken)}`);
      return { source: this.id, status: "connected", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: "Public Greenhouse job board is available." };
    } catch (error) {
      return { source: this.id, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, message: error instanceof Error ? error.message : "Greenhouse is unavailable." };
    }
  }
}
