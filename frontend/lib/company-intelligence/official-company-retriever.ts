import { extractOfficialCompanyFacts, type OfficialCompanyFacts } from "./official-company-facts.ts";
import { defaultPublicHostResolver, isPublicNetworkAddress, isSafePublicCareerUrl, type HostResolver } from "../discovery/providers/company-career-site.ts";

const maximumDocumentBytes = 2_000_000;
const requestTimeoutMs = 12_000;

export type OfficialCompanyRetrieval = OfficialCompanyFacts & {
  status: number;
  contentType: string;
  bytes: number;
  durationMs: number;
};

function officialHomepage(domain: string) {
  const normalized = domain.trim().replace(/^https?:\/\//i, "").split("/")[0];
  const url = new URL(`https://${normalized}/`);
  if (!isSafePublicCareerUrl(url)) throw Object.assign(new Error("Only verified public HTTPS company domains are supported."), { code: "UNSAFE_OFFICIAL_DOMAIN", retryable: false });
  return url;
}

const failure = (message: string, code: string, retryable: boolean) => Object.assign(new Error(message), { code, retryable });

/** Retrieve one verified official homepage. Redirects are rejected to prevent DNS and provenance boundary changes. */
export async function retrieveOfficialCompanyFacts(input: {
  officialDomain: string;
  observedAt?: string;
  fetcher?: typeof fetch;
  resolver?: HostResolver;
}): Promise<OfficialCompanyRetrieval> {
  const started = performance.now();
  const url = officialHomepage(input.officialDomain);
  const resolver = input.resolver ?? defaultPublicHostResolver;
  const addresses = await resolver(url.hostname);
  if (!addresses.length || addresses.some((address) => !isPublicNetworkAddress(address))) throw failure("The official company domain does not resolve exclusively to public network addresses.", "PRIVATE_OFFICIAL_DOMAIN_ADDRESS", false);
  const response = await (input.fetcher ?? fetch)(url, {
    headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "ORENDALIS-Company-Intelligence/1.0" },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (!response.ok) throw failure(`The official company website returned ${response.status}.`, "OFFICIAL_COMPANY_UNAVAILABLE", response.status >= 500 || response.status === 429);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) throw failure("The official company response is not HTML.", "UNSUPPORTED_OFFICIAL_COMPANY_CONTENT", false);
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > maximumDocumentBytes) throw failure("The official company response exceeds the safe extraction limit.", "OFFICIAL_COMPANY_DOCUMENT_TOO_LARGE", false);
  const html = await response.text();
  const bytes = new TextEncoder().encode(html).byteLength;
  if (bytes > maximumDocumentBytes) throw failure("The official company response exceeds the safe extraction limit.", "OFFICIAL_COMPANY_DOCUMENT_TOO_LARGE", false);
  const facts = extractOfficialCompanyFacts({ html, sourceUrl: url.toString(), expectedDomain: input.officialDomain, observedAt: input.observedAt ?? new Date().toISOString() });
  return { ...facts, status: response.status, contentType, bytes, durationMs: Math.round(performance.now() - started) };
}
