import type { DiscoveryJob } from "./types";

export type IndustryClassification = {
  value: string;
  source: "Verified provider metadata" | "Employer evidence" | "Unknown";
  confidence: number;
  fingerprint: string;
};

function normalized(value: unknown) {
  return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function fingerprint(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 0x01000193) >>> 0; }
  return `industry-v1:${hash.toString(16).padStart(8, "0")}`;
}

/** Evidence-bound classification. Role copy is never treated as evidence of an employer's industry. */
export function classifyOpportunityIndustry(job: DiscoveryJob): IndustryClassification {
  const providerIndustry = job.company.industry ?? job.rawMetadata.industry;
  const explicit = normalized(providerIndustry);
  const hasExplicit = explicit && !["not specified", "unknown", "other", "n a"].includes(explicit);
  if (hasExplicit) return { value: String(providerIndustry).trim(), source: "Verified provider metadata", confidence: 100, fingerprint: fingerprint(explicit) };

  const evidence = normalized([job.company.name, job.sourceId].join(" "));
  return { value: "Not specified", source: "Unknown", confidence: 0, fingerprint: fingerprint(evidence) };
}
