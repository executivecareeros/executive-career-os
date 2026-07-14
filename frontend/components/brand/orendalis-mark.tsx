export function OrendalisMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3" aria-label="Orendalis">
      <svg aria-hidden="true" className="size-9 shrink-0" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeOpacity=".42" />
        <path d="M9.5 21.5C13.4 16.1 17 13.4 20 13.4s6.6 2.7 10.5 8.1C26.6 26.9 23 29.6 20 29.6s-6.6-2.7-10.5-8.1Z" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="20" cy="21.5" r="3.2" fill="currentColor" />
      </svg>
      {!compact && <span className="text-[0.82rem] font-semibold uppercase tracking-[0.28em]">Orendalis</span>}
    </span>
  );
}
