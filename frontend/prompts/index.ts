import type { PromptId, PromptTemplate } from "./types";
const define = (id: PromptId, purpose: string): PromptTemplate => ({ id, version: "0.1.0-draft", purpose, system: "Draft architecture placeholder. No model is connected.", render: (variables) => `Objective: ${purpose}\nInputs: ${JSON.stringify(variables)}` });
export const promptLibrary: Readonly<Record<PromptId, PromptTemplate>> = {
  "opportunity-scoring": define("opportunity-scoring", "Assess an executive opportunity against an approved profile."),
  "company-research": define("company-research", "Structure reviewed company intelligence."),
  "application-review": define("application-review", "Review application readiness and next actions."),
  "cv-optimization": define("cv-optimization", "Recommend evidence-based CV positioning."),
  "interview-preparation": define("interview-preparation", "Prepare an executive interview brief."),
  "cover-letter-generation": define("cover-letter-generation", "Draft a role-specific executive cover letter."),
};
export type { PromptId, PromptTemplate } from "./types";
