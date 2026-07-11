import type { StatusTone } from "@/types/design-system";

const toneStyles: Record<StatusTone, string> = {
  neutral: "border-white/10 bg-white/5 text-slate-300",
  info: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
};

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: StatusTone }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${toneStyles[tone]}`}>{children}</span>;
}
