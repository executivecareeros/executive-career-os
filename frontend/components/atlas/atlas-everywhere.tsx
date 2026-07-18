"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { atlasHandoffHref, resolveAtlasPageContext } from "@/lib/atlas/page-context";
import { AtlasMark } from "./atlas-mark";

export function AtlasEverywhere() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/assistant")) return null;
  const context = resolveAtlasPageContext(pathname);

  return (
    <aside data-atlas-dock className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-7 sm:right-7" aria-label="Atlas contextual guidance">
      {open && (
        <section className="w-[min(24rem,calc(100vw-2rem))] rounded-3xl border border-[#dbe2ee] bg-white p-5 text-[#0b1220] shadow-[0_24px_70px_rgba(15,30,60,.18)]" aria-live="polite">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3"><AtlasMark size={38}/><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#3457d5]">Atlas · {context.label}</p><p className="mt-1 text-xs text-[#778398]">Evidence first. You decide.</p></div></div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-[#68758a] hover:bg-[#f0f3f8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5]" aria-label="Close Atlas guidance">✕</button>
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-[-.025em]">{context.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#5f6b7a]">{context.summary}</p>
          <div className="mt-4 grid gap-2">{context.prompts.map(prompt => <Link key={prompt} href={`${atlasHandoffHref(pathname)}&prompt=${encodeURIComponent(prompt)}`} className="rounded-xl border border-[#e2e7ef] bg-[#f8faff] px-3 py-2 text-left text-sm text-[#35445d] transition hover:border-[#9fb2df] hover:bg-[#f1f5ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5]">{prompt}<span aria-hidden="true" className="float-right text-[#3457d5]">→</span></Link>)}</div>
          <Link href={atlasHandoffHref(pathname)} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#17233b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2446bd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d8cff]">Continue with Atlas</Link>
        </section>
      )}
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="group relative inline-flex size-14 items-center justify-center rounded-full border border-[#d7dfec] bg-white text-sm font-semibold text-[#17233b] shadow-[0_12px_36px_rgba(15,30,60,.16)] transition hover:-translate-y-0.5 hover:border-[#aebfe5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5] sm:h-auto sm:w-auto sm:gap-3 sm:px-4 sm:py-3">
        <AtlasMark size={30}/><span className="sr-only sm:not-sr-only">{open ? "Close Atlas" : "Ask Atlas"}</span><span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-emerald-500 sm:static" aria-label="Atlas ready"/>
      </button>
    </aside>
  );
}
