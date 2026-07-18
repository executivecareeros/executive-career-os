export function OrendalisMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="orendalis-wordmark inline-flex items-center gap-3" aria-label="ORENDALIS">
      <svg aria-hidden="true" className="size-9 shrink-0" viewBox="0 0 40 40" fill="none">
        <rect x="1" y="1" width="38" height="38" rx="12" fill="#0B1220" />
        <path d="M25.4 9.6A12.3 12.3 0 1 0 29 28.5" stroke="#F7F9FC" strokeWidth="2.25" strokeLinecap="round" />
        <path d="m14.3 26 11.1-11.1" stroke="#6D8CFF" strokeWidth="2.25" strokeLinecap="round" />
        <path d="m21.1 14.4 5.3-.5-.5 5.3" stroke="#6D8CFF" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14.3" cy="26" r="1.65" fill="#7DE2C6" />
      </svg>
      {!compact && <span className="text-[0.82rem] font-semibold uppercase tracking-[0.22em]">ORENDALIS</span>}
    </span>
  );
}
