import type { Opportunity } from "@/types/opportunity";

export type GeographicProfile = {
  homeCountry?: string;
  citizenships: string[];
  workAuthorizations: string[];
  preferredCountries: string[];
  excludedCountries: string[];
  remotePreference?: "worldwide" | "emea" | "eu" | "country" | "unknown";
  relocationWillingness?: "yes" | "no" | "unknown";
  sponsorshipRequired?: boolean;
};

export type Eligibility = "Eligible" | "Probably eligible" | "Eligibility unknown" | "Relocation or sponsorship required" | "Not currently eligible";

const normalize = (value: string) => value.trim().toLowerCase();
const countryOf = (opportunity: Opportunity) => normalize(`${opportunity.country} ${opportunity.location}`);

export function classifyGeographicEligibility(opportunity: Opportunity, profile: GeographicProfile): Eligibility {
  const place = countryOf(opportunity);
  const work = normalize(`${opportunity.workArrangement} ${opportunity.location}`);
  const worldwide = /worldwide|global|anywhere|international/.test(place);
  const emea = /emea|europe|european|eu|european union/.test(place);
  const turkey = /türkiye|turkey|istanbul|ankara/.test(place);
  const usOnly = /(^|\s)(us|usa|united states|u\.s\.)($|\s|-)/.test(place) && !worldwide && !emea;
  if (profile.excludedCountries.some(country => place.includes(normalize(country)))) return "Not currently eligible";
  if (worldwide && opportunity.workArrangement === "Remote") return "Eligible";
  if (turkey && profile.homeCountry && normalize(profile.homeCountry) === "türkiye") return "Eligible";
  if (emea && profile.workAuthorizations.some(item => /eu|europe/.test(normalize(item)))) return "Eligible";
  if (usOnly && profile.workAuthorizations.some(item => /us|united states/.test(normalize(item)))) return "Eligible";
  if (usOnly && opportunity.summary.toLowerCase().match(/sponsor|visa/)) return "Relocation or sponsorship required";
  if (usOnly) return "Eligibility unknown";
  if (opportunity.workArrangement === "Remote" && /remote/.test(work)) return "Probably eligible";
  return "Eligibility unknown";
}

export function geographicPriority(eligibility: Eligibility) {
  return ({ Eligible: 7, "Probably eligible": 6, "Relocation or sponsorship required": 4, "Eligibility unknown": 2, "Not currently eligible": 0 } as Record<Eligibility, number>)[eligibility];
}

export function opportunityConfidence(opportunity: Opportunity, profile: GeographicProfile) {
  const eligibility = classifyGeographicEligibility(opportunity, profile);
  const professional = Math.max(0, Math.min(100, opportunity.overallScore ?? opportunity.confidenceScore ?? 0));
  return Math.round(geographicPriority(eligibility) * 10 + professional * 0.3 + (opportunity.freshness?.status === "Fresh" ? 5 : 0));
}

export function sortForExecutive(opportunities: Opportunity[], profile: GeographicProfile) {
  return [...opportunities].sort((a, b) => opportunityConfidence(b, profile) - opportunityConfidence(a, profile));
}

export function confidenceLabel(eligibility: Eligibility, score: number) {
  if (eligibility === "Not currently eligible") return "Not currently eligible";
  if (eligibility === "Relocation or sponsorship required") return "Stretch or relocation option";
  if (eligibility === "Eligibility unknown") return "Eligibility unclear";
  if (score >= 85) return "Excellent opportunity";
  if (score >= 70) return "Strong opportunity";
  if (score >= 50) return "Worth reviewing";
  return "Possible fit";
}

export const founderGeographicProfile: GeographicProfile = {
  homeCountry: "Türkiye",
  citizenships: ["European Union", "Türkiye"],
  workAuthorizations: ["European Union", "Türkiye"],
  preferredCountries: [],
  excludedCountries: [],
  remotePreference: "unknown",
  relocationWillingness: "unknown",
};
