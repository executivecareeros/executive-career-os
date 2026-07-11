export function ScoreIndicator({ label, score, compact = false }: { label: string; score: number; compact?: boolean }) {
  return (
    <div aria-label={`${label}: ${score} out of 100`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`${compact ? "text-xs" : "text-sm"} text-slate-400`}>{label}</span>
        <strong className={`${compact ? "text-sm" : "text-lg"} text-white`}>{score}<span className="text-xs font-normal text-slate-500">/100</span></strong>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div className="h-full rounded-full bg-blue-400" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
