import type { DiscoveryJob } from "./types";

export type IndustryClassification = {
  value: string;
  source: "Verified provider metadata" | "Employer evidence" | "Unknown";
  confidence: number;
  fingerprint: string;
};

const RULES: readonly [string, readonly string[]][] = [
  ["Enterprise Software", ["enterprise software", "saas", "cloud platform", "software platform", "developer platform"]],
  ["Artificial Intelligence", ["artificial intelligence", "machine learning", "generative ai", "ai platform"]],
  ["Cybersecurity", ["cybersecurity", "cyber security", "information security", "identity security"]],
  ["Financial Services", ["financial services", "fintech", "banking", "payments", "insurance"]],
  ["Healthcare", ["healthcare", "health care", "medtech", "biotechnology", "pharmaceutical"]],
  ["Telecommunications", ["telecommunications", "telecom", "connectivity", "network operator"]],
  ["Media & Entertainment", ["media technology", "broadcast", "streaming", "entertainment"]],
  ["Professional Services", ["consulting", "professional services", "advisory services"]],
  ["Manufacturing", ["manufacturing", "industrial automation", "automotive", "aerospace"]],
  ["Retail & Consumer", ["retail", "consumer goods", "ecommerce", "e-commerce"]],
  ["Energy", ["renewable energy", "energy", "utilities", "oil and gas"]],
  ["Education", ["education technology", "edtech", "higher education", "learning platform"]],
];

function normalized(value: unknown) {
  return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function fingerprint(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 0x01000193) >>> 0; }
  return `industry-v1:${hash.toString(16).padStart(8, "0")}`;
}

/** Evidence-bound classification. It never infers beyond provider or employer-published text. */
export function classifyOpportunityIndustry(job: DiscoveryJob): IndustryClassification {
  const explicit = normalized(job.company.industry);
  const hasExplicit = explicit && !["not specified", "unknown", "other", "n a"].includes(explicit);
  if (hasExplicit) return { value: String(job.company.industry).trim(), source: "Verified provider metadata", confidence: 100, fingerprint: fingerprint(explicit) };

  const evidence = normalized([job.company.name, job.description, job.rawMetadata.industry, job.rawMetadata.department, job.rawMetadata.function].join(" "));
  for (const [industry, terms] of RULES) {
    if (terms.some((term) => evidence.includes(normalized(term)))) return { value: industry, source: "Employer evidence", confidence: 80, fingerprint: fingerprint(`${industry}:${evidence}`) };
  }
  return { value: "Not specified", source: "Unknown", confidence: 0, fingerprint: fingerprint(evidence) };
}
