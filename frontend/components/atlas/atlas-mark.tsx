export function AtlasMark({ size = 34 }: { size?: number }) {
  return <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#edf3f5]" style={{ width: size, height: size }} aria-hidden="true"><svg viewBox="0 0 40 40" width={size * .7} height={size * .7} fill="none"><path d="M5 20c4.2-7 9.2-10.5 15-10.5S30.8 13 35 20c-4.2 7-9.2 10.5-15 10.5S9.2 27 5 20Z" stroke="#55778a" strokeWidth="1.8"/><circle cx="20" cy="20" r="4.2" fill="#55778a"/><path d="M20 4v3M20 33v3M4 20h3M33 20h3" stroke="#b08b57" strokeLinecap="round"/></svg></span>;
}
