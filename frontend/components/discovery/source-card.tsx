import type { DiscoveryHealth, DiscoverySource } from "@/lib/discovery";
import { StatusBadge } from "@/components/status-badge";

export function SourceCard({ source, health }: { source: DiscoverySource; health?: DiscoveryHealth }) {
  return <article className="rounded-xl border border-white/10 bg-slate-950/40 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium text-white">{source.name}</h3><p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{source.category}</p></div><StatusBadge tone={health?.status === "connected" ? "success" : health?.status === "disabled" ? "neutral" : "info"}>{health?.status ?? "available"}</StatusBadge></div><p className="mt-4 text-sm leading-6 text-slate-400">{health?.message ?? "Connector architecture stub; no live integration."}</p></article>;
}
