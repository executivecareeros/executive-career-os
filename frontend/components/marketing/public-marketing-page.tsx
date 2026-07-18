import Link from "next/link";
import { OrendalisMark } from "@/components/brand/orendalis-mark";

export function PublicMarketingPage({ eyebrow, title, introduction, sections }: { eyebrow: string; title: string; introduction: string; sections: readonly { title: string; body: string }[] }) {
  return <main className="min-h-screen bg-[#f5f7fb] text-[#0b1220]">
    <header className="border-b border-[#dfe5ee] bg-[#07101f] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10" aria-label="Primary navigation">
        <Link href="/" className="rounded-xl bg-white px-3 py-2 text-[#0b1220]"><OrendalisMark /></Link>
        <div className="flex items-center gap-2"><Link href="/login" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold">Sign in</Link><Link href="/register" className="hidden rounded-xl bg-[#6d8cff] px-4 py-2.5 text-sm font-semibold sm:inline-flex">Create your workspace</Link></div>
      </nav>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#8ea6ff]">{eyebrow}</p><h1 className="orendalis-display mt-5 max-w-4xl text-5xl leading-[1.04] tracking-[-.05em] sm:text-7xl">{title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-[#b8c2d4]">{introduction}</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#6d8cff] px-6 text-sm font-semibold">Create your private workspace</Link><Link href="/executive-jobs" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 text-sm font-semibold">Explore executive job search</Link></div></div>
    </header>
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10"><div className="grid gap-6 md:grid-cols-3">{sections.map((section) => <article key={section.title} className="rounded-2xl border border-[#dfe5ee] bg-white p-7 shadow-[0_16px_45px_rgba(31,49,84,.05)]"><h2 className="text-xl font-semibold tracking-[-.025em]">{section.title}</h2><p className="mt-4 text-sm leading-7 text-[#5f6b7a]">{section.body}</p></article>)}</div></section>
    <footer className="border-t border-[#dfe5ee] bg-white px-6 py-10 text-sm text-[#5f6b7a]"><nav className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-3" aria-label="Footer"><Link href="/">Home</Link><Link href="/executive-jobs">Executive jobs</Link><Link href="/executive-career-intelligence">Executive career intelligence</Link><Link href="/about">About</Link><Link href="/login">Sign in</Link></nav></footer>
  </main>;
}
