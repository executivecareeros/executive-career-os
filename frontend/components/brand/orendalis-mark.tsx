export function OrendalisMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="orendalis-wordmark inline-flex items-center gap-3" aria-label="ORENDALIS">
      <svg aria-hidden="true" className="size-9 shrink-0" viewBox="0 0 96 96" fill="none">
        <rect width="96" height="96" rx="28" fill="#0B1220" />
        <path d="M61 23a29 29 0 1 0 8 43" stroke="#F7F9FC" strokeWidth="5" strokeLinecap="round" />
        <path d="M34 62 61 35" stroke="#6D8CFF" strokeWidth="5" strokeLinecap="round" />
        <path d="m51 33 13-1-1 13" stroke="#6D8CFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="34" cy="62" r="4" fill="#7DE2C6" />
      </svg>
      {!compact && <span className="text-[0.82rem] font-semibold uppercase tracking-[0.22em]">ORENDALIS</span>}
    </span>
  );
}
