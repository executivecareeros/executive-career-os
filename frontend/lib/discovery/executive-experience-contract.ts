export const executiveExperienceContractVersion = "orion-executive-experience-v1" as const;

export const executiveExperienceObjectKinds = [
  "Recommendation", "Explanation", "Evidence Summary", "Confidence Statement", "Unknown Statement",
  "Conflict Statement", "Alternative Interpretation", "Suggested Next Action", "Investigation Request", "Decision Summary",
] as const;
export type ExecutiveExperienceObjectKind = (typeof executiveExperienceObjectKinds)[number];

export type ExperienceObjectDefinition = {
  kind: ExecutiveExperienceObjectKind;
  purpose: string;
  requiredFields: readonly string[];
  optionalFields: readonly string[];
  evidenceRequirements: string;
  unknownBehavior: string;
  renderingIndependence: string;
};

const renderingIndependence = "Semantic fields are ordered and rendered by the consuming channel; no field contains layout, color, component, or device instructions.";
export const executiveExperienceObjectRegistry: readonly ExperienceObjectDefinition[] = [
  { kind: "Recommendation", purpose: "State a justified course for executive consideration without taking decision authority.", requiredFields: ["statement", "evidenceIds", "confidence", "unknowns", "conflicts", "alternatives", "suggestedActions"], optionalFields: ["facts", "interpretations"], evidenceRequirements: "At least one traceable evidence reference and a non-Unknown confidence basis.", unknownBehavior: "Disclose all material Unknowns; withhold the recommendation if a decision gate fails.", renderingIndependence },
  { kind: "Explanation", purpose: "Separate observed facts from Orion's interpretation of them.", requiredFields: ["facts", "interpretations", "evidenceIds"], optionalFields: ["unknowns", "conflicts", "alternatives"], evidenceRequirements: "Every factual or interpretive claim cites the evidence set used.", unknownBehavior: "Missing facts remain Unknown and are not converted into interpretation.", renderingIndependence },
  { kind: "Evidence Summary", purpose: "Present the evidence supporting the interaction and its provenance boundary.", requiredFields: ["facts", "evidenceIds"], optionalFields: ["unknowns", "conflicts"], evidenceRequirements: "At least one factual statement and one traceable evidence reference.", unknownBehavior: "Absent evidence is listed as Unknown or requested; it is never implied.", renderingIndependence },
  { kind: "Confidence Statement", purpose: "Explain how strongly the evidence supports the communication.", requiredFields: ["confidence"], optionalFields: ["evidenceIds", "unknowns", "conflicts"], evidenceRequirements: "Confidence includes a level and plain-language basis; High or Medium requires evidence.", unknownBehavior: "Insufficient evidence produces Unknown confidence.", renderingIndependence },
  { kind: "Unknown Statement", purpose: "Make a material information gap and its decision impact visible.", requiredFields: ["unknowns", "requestedEvidence"], optionalFields: ["statement"], evidenceRequirements: "No evidence is invented; requested evidence states what could resolve the gap.", unknownBehavior: "Unknown remains explicit until reviewed evidence resolves it.", renderingIndependence },
  { kind: "Conflict Statement", purpose: "Expose unresolved contradictory claims and their decision impact.", requiredFields: ["conflicts", "evidenceIds"], optionalFields: ["alternatives", "requestedEvidence"], evidenceRequirements: "Conflicting claims retain their evidence references.", unknownBehavior: "An unresolved conflict cannot be silently selected or averaged.", renderingIndependence },
  { kind: "Alternative Interpretation", purpose: "Give a credible evidence-bounded reading that challenges the primary interpretation.", requiredFields: ["alternatives", "evidenceIds"], optionalFields: ["unknowns", "conflicts"], evidenceRequirements: "Alternatives cite their supporting evidence and limitations.", unknownBehavior: "Unsupported alternatives are omitted, not presented as possibilities.", renderingIndependence },
  { kind: "Suggested Next Action", purpose: "Offer a proportionate action that advances the executive's decision.", requiredFields: ["suggestedActions", "statement"], optionalFields: ["evidenceIds", "requestedEvidence"], evidenceRequirements: "The action is tied to evidence or to obtaining explicitly missing evidence.", unknownBehavior: "When uncertainty blocks action, request investigation instead of implying a recommendation.", renderingIndependence },
  { kind: "Investigation Request", purpose: "Request the minimum evidence needed to resolve a decision-relevant gap or conflict.", requiredFields: ["requestedEvidence", "statement"], optionalFields: ["unknowns", "conflicts"], evidenceRequirements: "The request identifies the gap, decision relevance, and evidence sought.", unknownBehavior: "The request preserves Unknown until evidence is reviewed.", renderingIndependence },
  { kind: "Decision Summary", purpose: "Record the executive's decision context without rewriting the preceding recommendation.", requiredFields: ["decision", "evidenceIds", "confidence", "unknowns", "conflicts"], optionalFields: ["suggestedActions", "alternatives"], evidenceRequirements: "References the evidence visible at decision time.", unknownBehavior: "Unresolved Unknowns and conflicts remain in the summary.", renderingIndependence },
] as const;

export type ExperienceConfidence = { level: "High" | "Medium" | "Low" | "Unknown"; score: number | null; basis: string };
export type ExecutiveExperienceObject = {
  id: string;
  version: typeof executiveExperienceContractVersion;
  kind: ExecutiveExperienceObjectKind;
  statement: string;
  facts: readonly string[];
  interpretations: readonly string[];
  evidenceIds: readonly string[];
  confidence: ExperienceConfidence | null;
  unknowns: readonly string[];
  conflicts: readonly string[];
  alternatives: readonly string[];
  suggestedActions: readonly string[];
  requestedEvidence: readonly string[];
  decision: string | null;
  generatedAt: string;
};

const hash = (value: string) => {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return (result >>> 0).toString(36);
};
const hasText = (values: readonly string[]) => values.length > 0 && values.every((value) => value.trim().length > 0);
const assertTimestamp = (value: string) => { if (Number.isNaN(Date.parse(value))) throw new Error("generatedAt must be a valid timestamp"); };

export function createExecutiveExperienceObject(input: Omit<ExecutiveExperienceObject, "id" | "version">): ExecutiveExperienceObject {
  assertTimestamp(input.generatedAt);
  if (!input.statement.trim()) throw new Error(`${input.kind} requires a statement`);
  if (input.confidence && (!input.confidence.basis.trim() || (input.confidence.score !== null && (input.confidence.score < 0 || input.confidence.score > 100)))) throw new Error("Confidence requires a basis and a score between 0 and 100 or null");
  if ((input.confidence?.level === "High" || input.confidence?.level === "Medium") && !input.evidenceIds.length) throw new Error("Measured confidence requires evidence");
  if (input.kind === "Recommendation" && (!input.evidenceIds.length || !input.confidence || input.confidence.level === "Unknown" || !hasText(input.suggestedActions))) throw new Error("Recommendation requires evidence, measured confidence, and a justified next action");
  if (input.kind === "Explanation" && (!hasText(input.facts) || !hasText(input.interpretations) || !input.evidenceIds.length)) throw new Error("Explanation requires separated facts, interpretations, and evidence");
  if (input.kind === "Evidence Summary" && (!hasText(input.facts) || !input.evidenceIds.length)) throw new Error("Evidence Summary requires facts and evidence");
  if (input.kind === "Confidence Statement" && !input.confidence) throw new Error("Confidence Statement requires confidence");
  if (input.kind === "Unknown Statement" && (!hasText(input.unknowns) || !hasText(input.requestedEvidence))) throw new Error("Unknown Statement requires Unknowns and requested evidence");
  if (input.kind === "Conflict Statement" && (input.conflicts.length < 2 || !input.evidenceIds.length)) throw new Error("Conflict Statement requires conflicting claims and evidence");
  if (input.kind === "Alternative Interpretation" && (!hasText(input.alternatives) || !input.evidenceIds.length)) throw new Error("Alternative Interpretation requires an evidence-backed alternative");
  if (input.kind === "Suggested Next Action" && !hasText(input.suggestedActions)) throw new Error("Suggested Next Action requires an action");
  if (input.kind === "Investigation Request" && !hasText(input.requestedEvidence)) throw new Error("Investigation Request requires requested evidence");
  if (input.kind === "Decision Summary" && (!input.decision?.trim() || !input.confidence || !input.evidenceIds.length)) throw new Error("Decision Summary requires a decision, evidence, and confidence");
  if (input.facts.some((fact) => input.interpretations.includes(fact))) throw new Error("Facts and interpretations must remain separate");
  return { ...input, id: `experience:${hash(`${input.kind}|${input.statement}|${input.generatedAt}`)}`, version: executiveExperienceContractVersion };
}

export const executiveJourneyIds = ["Opportunity Review", "Employer Review", "Compensation Review", "Recommendation Withheld", "Evidence Insufficient", "Conflict Detected", "Unknown Outcome"] as const;
export type ExecutiveJourneyId = (typeof executiveJourneyIds)[number];
export type ExecutiveJourneyDefinition = {
  id: ExecutiveJourneyId;
  inputs: readonly string[];
  requiredOutputs: readonly ExecutiveExperienceObjectKind[];
  mandatoryDisclosures: readonly ("Evidence" | "Confidence" | "Unknowns" | "Conflicts" | "Alternatives")[];
  decisionGates: readonly string[];
};

const fiveDecisionGates = ["Decision Quality", "Explainability", "Evidence", "Confidence", "Executive Trust"] as const;
export const executiveJourneyRegistry: readonly ExecutiveJourneyDefinition[] = [
  { id: "Opportunity Review", inputs: ["Canonical opportunity", "Opportunity Intelligence assessment"], requiredOutputs: ["Recommendation", "Explanation", "Evidence Summary", "Confidence Statement", "Suggested Next Action"], mandatoryDisclosures: ["Evidence", "Confidence", "Unknowns", "Conflicts", "Alternatives"], decisionGates: fiveDecisionGates },
  { id: "Employer Review", inputs: ["Canonical employer", "Employer Intelligence assessment"], requiredOutputs: ["Recommendation", "Explanation", "Evidence Summary", "Confidence Statement", "Suggested Next Action"], mandatoryDisclosures: ["Evidence", "Confidence", "Unknowns", "Conflicts", "Alternatives"], decisionGates: fiveDecisionGates },
  { id: "Compensation Review", inputs: ["Compensation evidence", "Compensation Intelligence assessment"], requiredOutputs: ["Recommendation", "Explanation", "Evidence Summary", "Confidence Statement", "Suggested Next Action"], mandatoryDisclosures: ["Evidence", "Confidence", "Unknowns", "Conflicts", "Alternatives"], decisionGates: fiveDecisionGates },
  { id: "Recommendation Withheld", inputs: ["Failed decision gate", "Available evidence"], requiredOutputs: ["Explanation", "Evidence Summary", "Confidence Statement", "Unknown Statement", "Investigation Request"], mandatoryDisclosures: ["Evidence", "Confidence", "Unknowns", "Conflicts", "Alternatives"], decisionGates: fiveDecisionGates },
  { id: "Evidence Insufficient", inputs: ["Available evidence", "Required evidence gaps"], requiredOutputs: ["Evidence Summary", "Confidence Statement", "Unknown Statement", "Investigation Request"], mandatoryDisclosures: ["Evidence", "Confidence", "Unknowns"], decisionGates: ["Evidence", "Confidence", "Executive Trust"] },
  { id: "Conflict Detected", inputs: ["Conflicting evidence claims"], requiredOutputs: ["Evidence Summary", "Confidence Statement", "Conflict Statement", "Alternative Interpretation", "Investigation Request"], mandatoryDisclosures: ["Evidence", "Confidence", "Unknowns", "Conflicts", "Alternatives"], decisionGates: ["Evidence", "Confidence", "Explainability", "Executive Trust"] },
  { id: "Unknown Outcome", inputs: ["Decision summary", "Unobserved outcome"], requiredOutputs: ["Decision Summary", "Confidence Statement", "Unknown Statement", "Suggested Next Action"], mandatoryDisclosures: ["Evidence", "Confidence", "Unknowns", "Conflicts"], decisionGates: ["Evidence", "Explainability", "Executive Trust"] },
] as const;

export type ExecutiveJourneyInteraction = { journey: ExecutiveJourneyId; objects: readonly ExecutiveExperienceObject[]; decisionGates: readonly { gate: string; passed: boolean }[] };

export function validateExecutiveJourney(interaction: ExecutiveJourneyInteraction) {
  const definition = executiveJourneyRegistry.find((journey) => journey.id === interaction.journey);
  if (!definition) throw new Error(`Unknown executive journey: ${interaction.journey}`);
  const kinds = new Set(interaction.objects.map((object) => object.kind));
  const missingOutputs = definition.requiredOutputs.filter((kind) => !kinds.has(kind));
  const missingGates = definition.decisionGates.filter((gate) => !interaction.decisionGates.some((result) => result.gate === gate));
  const evidenceVisible = interaction.objects.some((object) => object.evidenceIds.length > 0);
  const confidenceVisible = interaction.objects.some((object) => object.kind === "Confidence Statement" && object.confidence);
  const unknownsVisible = interaction.objects.some((object) => object.unknowns.length > 0) || !definition.mandatoryDisclosures.includes("Unknowns");
  const conflictsVisible = interaction.objects.some((object) => object.conflicts.length > 0) || !definition.mandatoryDisclosures.includes("Conflicts");
  const alternativesVisible = interaction.objects.some((object) => object.alternatives.length > 0) || !definition.mandatoryDisclosures.includes("Alternatives");
  const disclosureChecks = { Evidence: evidenceVisible, Confidence: Boolean(confidenceVisible), Unknowns: unknownsVisible, Conflicts: conflictsVisible, Alternatives: alternativesVisible };
  const missingDisclosures = definition.mandatoryDisclosures.filter((disclosure) => !disclosureChecks[disclosure]);
  const recommendationPresent = kinds.has("Recommendation");
  const gatesPassed = definition.decisionGates.every((gate) => interaction.decisionGates.find((result) => result.gate === gate)?.passed === true);
  const recommendationSafe = !recommendationPresent || gatesPassed;
  return { journey: interaction.journey, valid: !missingOutputs.length && !missingGates.length && !missingDisclosures.length && recommendationSafe, missingOutputs, missingGates, missingDisclosures, recommendationSafe };
}

export function evaluateExecutiveExperienceContract(interactions: readonly ExecutiveJourneyInteraction[]) {
  const results = interactions.map(validateExecutiveJourney);
  const objects = interactions.flatMap((interaction) => interaction.objects);
  const percentage = (part: number, total: number) => total ? Math.round(part / total * 1000) / 10 : 0;
  const disclosureTotal = interactions.reduce((total, interaction) => total + (executiveJourneyRegistry.find((journey) => journey.id === interaction.journey)?.mandatoryDisclosures.length ?? 0), 0);
  const disclosureMissing = results.reduce((total, result) => total + result.missingDisclosures.length, 0);
  return {
    version: executiveExperienceContractVersion,
    metrics: {
      experienceContractCoverage: percentage(new Set(objects.map((object) => object.kind)).size, executiveExperienceObjectKinds.length),
      journeyCoverage: percentage(new Set(interactions.map((interaction) => interaction.journey)).size, executiveJourneyIds.length),
      communicationConsistency: percentage(results.filter((result) => result.valid).length, results.length),
      disclosureCoverage: percentage(disclosureTotal - disclosureMissing, disclosureTotal),
      trustCommunicationReadiness: results.length === executiveJourneyIds.length && results.every((result) => result.valid) ? "Ready" : "Not Ready",
      futureUxReusePotential: executiveExperienceObjectRegistry.every((definition) => definition.renderingIndependence === renderingIndependence) ? "High" : "Needs Review",
    },
    results,
    unsupportedRecommendations: results.filter((result) => !result.recommendationSafe).length,
  };
}
