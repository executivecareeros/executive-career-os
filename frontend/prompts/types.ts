export type PromptId = "opportunity-scoring" | "company-research" | "application-review" | "cv-optimization" | "interview-preparation" | "cover-letter-generation";
export type PromptTemplate<TVariables extends Record<string, string> = Record<string, string>> = { id: PromptId; version: string; purpose: string; system: string; render: (variables: TVariables) => string };
