export function OrendalisMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3" aria-label="Orendalis">
      <svg aria-hidden="true" className="size-9 shrink-0" viewBox="0 0 40 40" fill="none">
        <rect x="1.25" y="1.25" width="37.5" height="37.5" rx="18.75" fill="#22211F" />
        <path d="M10.75 25.3 20 15.4l9.25 9.9" stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.25 25.3h13.5" stroke="#B88855" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="15.4" r="1.75" fill="#B88855" />
      </svg>
      {!compact && <span className="text-[0.84rem] font-semibold uppercase tracking-[0.25em]">Orendalis</span>}
    </span>
  );
}
