export function OrendalisMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="orendalis-wordmark inline-flex items-center gap-3" aria-label="ORENDALIS">
      <svg aria-hidden="true" className="size-9 shrink-0" viewBox="0 0 40 40" fill="none">
        <rect x="1" y="1" width="38" height="38" rx="12" fill="#0B1220" />
        <circle cx="20" cy="20" r="11.25" stroke="#F7F9FC" strokeWidth="2.15" />
        <path d="M13.7 24.6c3.8-1.1 7.2-3.4 9.8-6.7l3.1-3.9" stroke="#6D8CFF" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m22.4 13.9 4.8-.5-.5 4.8" stroke="#6D8CFF" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="13.5" cy="24.7" r="1.6" fill="#7DE2C6" />
      </svg>
      {!compact && <span className="text-[0.82rem] font-semibold uppercase tracking-[0.22em]">ORENDALIS</span>}
    </span>
  );
}
