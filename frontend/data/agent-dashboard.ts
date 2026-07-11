import type { AgentKind, AgentPriority, AgentStatus } from "@/lib/agents";
export type AgentHealthRecord = { agent: AgentKind; label: string; status: AgentStatus; lastRun?: string; nextRun?: string; memoryEntries: number };
export type AgentTaskSummary = { id:string; title:string; agent:AgentKind; priority:AgentPriority; state:"pending"|"completed"; scheduledFor?:string };
export const agentHealth:AgentHealthRecord[]=[
  {agent:"career",label:"Career Agent",status:"idle",lastRun:"Not run",nextRun:"Manual only",memoryEntries:4},
  {agent:"opportunity",label:"Opportunity Agent",status:"scheduled",lastRun:"Architecture demo · 2h ago",nextRun:"Hourly demo · 42m",memoryEntries:12},
  {agent:"company",label:"Company Agent",status:"idle",lastRun:"Architecture demo · yesterday",nextRun:"Daily demo · tomorrow",memoryEntries:8},
  {agent:"application",label:"Application Agent",status:"scheduled",lastRun:"Architecture demo · 1h ago",nextRun:"Hourly demo · 18m",memoryEntries:15},
  {agent:"market",label:"Market Agent",status:"paused",lastRun:"Never",nextRun:"Weekly demo · Monday",memoryEntries:0},
];
export const agentTasks:AgentTaskSummary[]=[{id:"task-1",title:"Review overdue demo actions",agent:"application",priority:"high",state:"pending",scheduledFor:"Today · 16:00"},{id:"task-2",title:"Refresh opportunity assessment queue",agent:"opportunity",priority:"medium",state:"pending",scheduledFor:"Today · 17:00"},{id:"task-3",title:"Summarize company monitoring",agent:"company",priority:"low",state:"completed"}];
export const mockRecommendations=[{id:"rec-1",title:"Review one blocked demo application",agent:"Application Agent",priority:"High"},{id:"rec-2",title:"Reassess the highest-ranked demo opportunity",agent:"Opportunity Agent",priority:"Medium"}];
