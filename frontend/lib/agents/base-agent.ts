import type { Agent, AgentContext, AgentKind, AgentRecommendation, AgentResult, AgentStatus, AgentTask } from "./types";

export abstract class BaseAgent<TPayload, TAnalysis> implements Agent<TPayload, TAnalysis> {
  status: AgentStatus = "idle";
  abstract readonly kind: AgentKind;
  abstract analyze(payload: TPayload, context: AgentContext): Promise<TAnalysis>;
  abstract recommend(analysis: TAnalysis, context: AgentContext): Promise<AgentRecommendation[]>;
  abstract summarize(analysis: TAnalysis, context: AgentContext): Promise<string>;
  async run(task: AgentTask<TPayload>, context: AgentContext): Promise<AgentResult<TAnalysis>> {
    const startedAt = context.now; this.status = "running";
    try { const data = await this.analyze(task.payload, context); const recommendations = await this.recommend(data, context); const summary = await this.summarize(data, context); this.status = "completed"; return { taskId: task.id, agent: this.kind, status: "completed", data, recommendations, summary, startedAt, completedAt: context.now }; }
    catch (error) { this.status = "failed"; return { taskId: task.id, agent: this.kind, status: "failed", recommendations: [], summary: "Agent run failed.", startedAt, completedAt: context.now, error: error instanceof Error ? error.message : "Unknown error" }; }
  }
}
