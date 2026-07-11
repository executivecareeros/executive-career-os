import type { AgentKind, AgentLog, AgentResult, AgentTask } from "./types";

export type AgentEventMap = {
  "task.created": AgentTask;
  "task.started": { task: AgentTask; runId: string };
  "task.completed": AgentResult;
  "task.failed": AgentResult;
  "agent.status.changed": { agent: AgentKind; previous: string; current: string; occurredAt: string };
  "agent.log.created": AgentLog;
  "memory.updated": { agent: AgentKind; key: string; occurredAt: string };
  "recommendation.created": { recommendationId: string; agent: AgentKind; occurredAt: string };
};

export type AgentEventName = keyof AgentEventMap;
export type AgentEvent<TName extends AgentEventName = AgentEventName> = {
  id: string;
  name: TName;
  payload: AgentEventMap[TName];
  occurredAt: string;
  correlationId?: string;
};

export interface AgentEventBus {
  publish<TName extends AgentEventName>(event: AgentEvent<TName>): Promise<void>;
  subscribe<TName extends AgentEventName>(name: TName, handler: (event: AgentEvent<TName>) => void | Promise<void>): () => void;
}

export class InMemoryAgentEventBus implements AgentEventBus {
  private handlers = new Map<AgentEventName, Set<(event: AgentEvent) => void | Promise<void>>>();
  async publish<TName extends AgentEventName>(event: AgentEvent<TName>) { for (const handler of this.handlers.get(event.name) ?? []) await handler(event as AgentEvent); }
  subscribe<TName extends AgentEventName>(name: TName, handler: (event: AgentEvent<TName>) => void | Promise<void>) {
    const handlers = this.handlers.get(name) ?? new Set();
    const wrapped = handler as (event: AgentEvent) => void | Promise<void>;
    handlers.add(wrapped); this.handlers.set(name, handlers);
    return () => handlers.delete(wrapped);
  }
}
