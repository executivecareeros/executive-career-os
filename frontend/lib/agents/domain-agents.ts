import { BaseAgent } from "./base-agent";
import type { AgentContext, AgentKind, AgentRecommendation } from "./types";

export type AgentInput = { objective: string; entityIds?: string[] };
export type AgentAnalysis = { objective: string; observations: string[]; entityIds: string[] };

abstract class DomainAgent extends BaseAgent<AgentInput, AgentAnalysis> {
  abstract readonly kind: AgentKind;
  async analyze(payload: AgentInput, context: AgentContext) { void context; return { objective: payload.objective, observations: [], entityIds: payload.entityIds ?? [] }; }
  async recommend(analysis: AgentAnalysis, context: AgentContext): Promise<AgentRecommendation[]> { void analysis; void context; return []; }
  async summarize(analysis: AgentAnalysis, context: AgentContext) { void context; return `${this.kind} analysis prepared for: ${analysis.objective}. No intelligence provider is connected.`; }
}

export class OpportunityAgent extends DomainAgent { readonly kind = "opportunity" as const; }
export class CompanyAgent extends DomainAgent { readonly kind = "company" as const; }
export class ApplicationAgent extends DomainAgent { readonly kind = "application" as const; }
export class MarketAgent extends DomainAgent { readonly kind = "market" as const; }
