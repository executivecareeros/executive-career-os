export type ProviderExpansionCandidate = {
  id: string;
  name: string;
  accessMethod: string;
  expectedUniqueInventory: number;
  demandCoverage: number;
  geographyCoverage: number;
  sourceReliability: number;
  accessConfidence: number;
  duplicateRisk: number;
  effort: number;
  founderGate: boolean;
  nextAction: string;
};

export type RankedProviderExpansion = ProviderExpansionCandidate & { priorityScore: number };

const clamp = (value: number) => Math.max(0, Math.min(100, value));

/** Ranks sources by expected unique executive value, not provider fame or raw record volume. */
export function rankProviderExpansion(candidates: readonly ProviderExpansionCandidate[]): RankedProviderExpansion[] {
  return candidates.map(candidate => ({
    ...candidate,
    priorityScore: Math.round(
      candidate.expectedUniqueInventory * .30 +
      candidate.demandCoverage * .20 +
      candidate.geographyCoverage * .15 +
      candidate.sourceReliability * .15 +
      candidate.accessConfidence * .15 -
      candidate.duplicateRisk * .03 -
      candidate.effort * .02,
    ),
  })).sort((left, right) => right.priorityScore - left.priorityScore || left.name.localeCompare(right.name));
}

export const sourceExpansionRoadmap = rankProviderExpansion([
  { id: "smartrecruiters", name: "SmartRecruiters", accessMethod: "Official public employer Posting API", expectedUniqueInventory: 88, demandCoverage: 85, geographyCoverage: 90, sourceReliability: 90, accessConfidence: 95, duplicateRisk: 45, effort: 20, founderGate: false, nextAction: "Activate a verified employer cohort in isolated staging and record first-run and replay evidence." },
  { id: "teamtailor", name: "Teamtailor", accessMethod: "Authorized employer or partner feed", expectedUniqueInventory: 78, demandCoverage: 75, geographyCoverage: 88, sourceReliability: 90, accessConfidence: 55, duplicateRisk: 35, effort: 45, founderGate: true, nextAction: "Obtain an authorized feed or partner credential before implementation." },
  { id: "workday", name: "Workday", accessMethod: "Authorized tenant or provider-confirmed interface", expectedUniqueInventory: 96, demandCoverage: 95, geographyCoverage: 95, sourceReliability: 90, accessConfidence: 25, duplicateRisk: 55, effort: 90, founderGate: true, nextAction: "Secure a compliant tenant or partnership path and confirm collection rights." },
  { id: "icims", name: "iCIMS", accessMethod: "Authorized employer integration", expectedUniqueInventory: 84, demandCoverage: 88, geographyCoverage: 80, sourceReliability: 88, accessConfidence: 35, duplicateRisk: 50, effort: 75, founderGate: true, nextAction: "Qualify an employer-authorized integration and contractual access basis." },
  { id: "sap-successfactors", name: "SAP SuccessFactors", accessMethod: "Authorized employer OData integration", expectedUniqueInventory: 85, demandCoverage: 90, geographyCoverage: 92, sourceReliability: 88, accessConfidence: 30, duplicateRisk: 50, effort: 85, founderGate: true, nextAction: "Obtain an authorized tenant and validate data-use terms." },
  { id: "oracle-recruiting", name: "Oracle Recruiting / Taleo", accessMethod: "Authorized employer integration", expectedUniqueInventory: 82, demandCoverage: 85, geographyCoverage: 88, sourceReliability: 85, accessConfidence: 30, duplicateRisk: 55, effort: 85, founderGate: true, nextAction: "Identify an authorized employer tenant and supported publication interface." },
  { id: "bamboohr", name: "BambooHR", accessMethod: "Employer-published feed or authorized API", expectedUniqueInventory: 64, demandCoverage: 62, geographyCoverage: 70, sourceReliability: 82, accessConfidence: 60, duplicateRisk: 35, effort: 45, founderGate: false, nextAction: "Validate the public employer feed pattern and add the reusable adapter." },
  { id: "jobvite", name: "Jobvite", accessMethod: "Employer-published feed or authorized integration", expectedUniqueInventory: 66, demandCoverage: 68, geographyCoverage: 68, sourceReliability: 82, accessConfidence: 50, duplicateRisk: 40, effort: 55, founderGate: false, nextAction: "Qualify an employer-scoped publication endpoint and implement if permitted." },
  { id: "public-institutional", name: "Public and International Institution Feeds", accessMethod: "Official public APIs, XML, JSON, or RSS", expectedUniqueInventory: 58, demandCoverage: 50, geographyCoverage: 82, sourceReliability: 95, accessConfidence: 90, duplicateRisk: 15, effort: 40, founderGate: false, nextAction: "Select the highest-demand official feed and implement the structured-feed adapter." },
  { id: "executive-search-partners", name: "Executive Search Partner Feeds", accessMethod: "Contracted partner feed", expectedUniqueInventory: 72, demandCoverage: 82, geographyCoverage: 75, sourceReliability: 92, accessConfidence: 35, duplicateRisk: 20, effort: 55, founderGate: true, nextAction: "Secure the first partner agreement and define confidential-data handling." },
].map(candidate => ({ ...candidate, expectedUniqueInventory: clamp(candidate.expectedUniqueInventory), demandCoverage: clamp(candidate.demandCoverage), geographyCoverage: clamp(candidate.geographyCoverage), sourceReliability: clamp(candidate.sourceReliability), accessConfidence: clamp(candidate.accessConfidence), duplicateRisk: clamp(candidate.duplicateRisk), effort: clamp(candidate.effort) })));
