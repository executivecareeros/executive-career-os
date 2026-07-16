export function AtlasMark({ size = 34 }: { size?: number }) {
  return <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#f0e5d7]" style={{ width: size, height: size }} aria-hidden="true"><svg viewBox="0 0 40 40" width={size * .7} height={size * .7} fill="none"><path d="M8 26 20 13l12 13" stroke="#4a433b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 26h18" stroke="#936b3f" strokeWidth="1.8" strokeLinecap="round"/><circle cx="20" cy="13" r="2.25" fill="#936b3f"/></svg></span>;
}
