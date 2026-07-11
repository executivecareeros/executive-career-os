import { BaseAgent } from "./base-agent";
import type { Agent, AgentContext, AgentRecommendation, AgentResult, AgentTask } from "./types";
import type { AgentEventBus } from "./events";

export type CareerPlan = { objective: string; tasks: AgentTask[] };
export class CareerAgent extends BaseAgent<CareerPlan, AgentResult[]> {
  readonly kind = "career" as const;
  constructor(private readonly agents: ReadonlyMap<string, Agent>, private readonly events: AgentEventBus) { super(); }
  async analyze(plan: CareerPlan, context: AgentContext) {
    const results: AgentResult[] = [];
    for (const task of plan.tasks) { const agent = this.agents.get(task.agent); if (!agent) continue; await this.events.publish({ id: `${context.runId}-${task.id}`, name: "task.started", payload: { task, runId: context.runId }, occurredAt: context.now }); const result = await agent.run(task, { ...context, requestedBy: "agent" }); results.push(result); await this.events.publish({ id: `${context.runId}-${task.id}-result`, name: result.status === "completed" ? "task.completed" : "task.failed", payload: result, occurredAt: context.now }); }
    return results;
  }
  async recommend(results: AgentResult[], context: AgentContext): Promise<AgentRecommendation[]> { void context; return results.flatMap((result) => result.recommendations); }
  async summarize(results: AgentResult[], context: AgentContext) { void context; return `${results.filter((result) => result.status === "completed").length} coordinated agent tasks completed.`; }
}
