import type { AgentTask } from "./types";
export type ScheduleFrequency = "hourly" | "daily" | "weekly" | "manual";
export type AgentSchedule = { id: string; agent: AgentTask["agent"]; frequency: ScheduleFrequency; enabled: boolean; nextRunAt?: string; taskFactory: () => AgentTask };
export interface AgentScheduler { register(schedule: AgentSchedule): void; unregister(id: string): void; list(): ReadonlyArray<AgentSchedule>; due(now: string): ReadonlyArray<AgentSchedule>; }
export class InMemoryAgentScheduler implements AgentScheduler { private schedules = new Map<string, AgentSchedule>(); register(s: AgentSchedule){this.schedules.set(s.id,s);} unregister(id:string){this.schedules.delete(id);} list(){return [...this.schedules.values()];} due(now:string){return this.list().filter((s)=>s.enabled&&s.frequency!=="manual"&&Boolean(s.nextRunAt&&s.nextRunAt<=now));} }
