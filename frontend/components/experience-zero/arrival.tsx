import Link from "next/link";
import { OrendalisMark } from "@/components/brand/orendalis-mark";
import { AtlasMark } from "@/components/atlas/atlas-mark";
import type { Locale } from "@/lib/locale";

const principles = [
  ["One opportunity universe", "Search executive roles across a growing, verified network without visiting platform after platform."],
  ["A recommendation you can audit", "Atlas separates confirmed evidence, interpretation, and unknowns before you decide."],
  ["Your career memory", "Keep your experience, decisions, applications, and next actions connected in one private workspace."],
] as const;

const journey = [
  ["Bring your experience", "Upload your CV or build your profile manually. You review every fact before it becomes part of your private record."],
  ["See what fits", "Search the Opportunity Universe and let your background, preferences, and work authorization shape the order."],
  ["Decide with Atlas", "Understand the evidence for and against an opportunity, the unknowns that matter, and the next question worth asking."],
] as const;

export function ExperienceZeroArrival({ locale: _locale }: { locale: Locale }) {
  void _locale;
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#0b1220]">
      <section className="orendalis-grid relative overflow-hidden bg-[#07101f] text-white">
        <div className="pointer-events-none absolute -right-40 -top-56 size-[38rem] rounded-full bg-[#3457d5]/30 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-72 left-1/3 size-[34rem] rounded-full bg-[#2bc6a2]/15 blur-[110px]" />
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10" aria-label="Primary navigation">
          <Link href="/" className="rounded-xl bg-white px-3 py-2 text-[#0b1220] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d8cff]"><OrendalisMark /></Link>
          <div className="flex items-center gap-2">
            <Link href="#film" className="hidden px-3 py-2 text-sm font-semibold text-[#b8c2d4] transition hover:text-white md:inline-flex">Watch the film</Link>
            <Link href="#how-it-works" className="hidden px-3 py-2 text-sm font-semibold text-[#b8c2d4] transition hover:text-white lg:inline-flex">How it works</Link>
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8ea6ff]">Sign in</Link>
            <Link href="/register" className="hidden min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1220] shadow-lg shadow-black/10 transition hover:-translate-y-px hover:bg-[#f4f7ff] sm:inline-flex">Create your workspace</Link>
          </div>
        </nav>

        <div className="relative mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-14 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="orendalis-reveal">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#8ea6ff]">Executive career intelligence</p>
            <h1 className="orendalis-display orendalis-gradient-text mt-6 max-w-4xl text-5xl leading-[1.01] tracking-[-.055em] sm:text-7xl lg:text-[5.25rem]">Your next move deserves more than a job search.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#b8c2d4] sm:text-xl">ORENDALIS brings executive opportunities, company evidence, and your career context together—then Atlas helps you decide what is genuinely worth your attention.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#6d8cff] px-6 text-sm font-semibold text-white shadow-[0_14px_38px_rgba(77,111,230,.32)] transition hover:-translate-y-px hover:bg-[#7c98ff]">Create my private workspace</Link>
              <Link href="#film" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[.06] px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/[.11]">Watch the 58-second film</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#97a4b8]">
              <span>Private by design</span><span>Evidence before opinion</span><span>Your judgment stays yours</span>
            </div>
          </div>

          <aside className="orendalis-reveal orendalis-delay-2 relative" aria-label="Atlas executive briefing preview">
            <div className="orendalis-glass rounded-[1.75rem] p-3 text-[#0b1220]">
              <div className="rounded-[1.35rem] bg-white p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><AtlasMark/><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#3457d5]">Atlas briefing</p><p className="mt-1 text-xs text-[#788396]">Evidence-backed · Updated when facts change</p></div></div><span className="rounded-full bg-[#e8faf4] px-3 py-1 text-[11px] font-semibold text-[#187b64]">Ready</span></div>
                <div className="mt-8 border-l-2 border-[#6d8cff] pl-5"><p className="text-sm font-semibold text-[#3457d5]">Opportunity in focus</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">A role aligned with your next leadership chapter.</h2><p className="mt-3 text-sm leading-6 text-[#5f6b7a]">Atlas shows why it fits, what remains unknown, and which question should be answered before you act.</p></div>
                <div className="mt-7 grid gap-3 sm:grid-cols-3"><BriefingMetric label="Fit" value="Explained"/><BriefingMetric label="Evidence" value="Visible"/><BriefingMetric label="Unknowns" value="Explicit"/></div>
                <Link href="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#3457d5]">Build my private briefing <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="film" className="scroll-mt-8 border-b border-[#dfe5ee] bg-[#0b1220] px-6 py-20 text-white sm:px-10 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8ea6ff]">The ORENDALIS story · Episode 1</p>
              <h2 className="orendalis-display mt-4 text-4xl leading-tight tracking-[-.045em] sm:text-5xl">The executive hiring process is broken.</h2>
              <p className="mt-6 text-base leading-7 text-[#b8c2d4]">Executive opportunities are everywhere. The context required to make a confident career decision is not. This is why ORENDALIS exists.</p>
              <p className="mt-5 text-sm leading-6 text-[#8f9db2]">Watch with sound or muted. English subtitles are already included in the film.</p>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-black shadow-[0_28px_90px_rgba(0,0,0,.35)]">
              <video className="aspect-video w-full bg-black" controls playsInline preload="metadata" poster="/media/orendalis-episode-1-poster.png" aria-label="ORENDALIS Episode 1: The executive hiring process is broken">
                <source src="/media/orendalis-episode-1.mp4" type="video/mp4" />
                Your browser does not support the ORENDALIS launch film.
              </video>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-8 border-b border-[#dfe5ee] bg-white px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#3457d5]">One calm place to decide</p><h2 className="orendalis-display mt-4 max-w-3xl text-4xl leading-tight tracking-[-.045em] sm:text-5xl">Less searching. Better judgment. A career record that gets more valuable over time.</h2><div className="mt-14 grid gap-6 md:grid-cols-3">{principles.map(([title, body], index) => <article key={title} className="rounded-2xl border border-[#dfe5ee] bg-[#f8faff] p-6"><span className="text-xs font-bold text-[#3457d5]">0{index + 1}</span><h3 className="mt-5 text-lg font-semibold tracking-[-.02em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#5f6b7a]">{body}</p></article>)}</div></div>
      </section>

      <section className="bg-[#f5f7fb] px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#3457d5]">How ORENDALIS works</p>
          <h2 className="orendalis-display mt-4 max-w-3xl text-4xl leading-tight tracking-[-.045em] sm:text-5xl">From experience to a decision worth making.</h2>
          <ol className="mt-14 grid gap-6 lg:grid-cols-3">{journey.map(([title, body], index) => <li key={title} className="relative overflow-hidden rounded-2xl border border-[#dfe5ee] bg-white p-7 shadow-[0_16px_45px_rgba(31,49,84,.05)]"><span className="text-5xl font-semibold tracking-[-.06em] text-[#dce4ff]">{index + 1}</span><h3 className="mt-8 text-xl font-semibold tracking-[-.025em]">{title}</h3><p className="mt-4 text-sm leading-7 text-[#5f6b7a]">{body}</p></li>)}</ol>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#0b1220] px-6 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[#18243a]">Create my account</Link><Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#cfd7e5] bg-white px-6 text-sm font-semibold text-[#263246] transition hover:border-[#9cadd0]">I already have an account</Link></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div><AtlasMark size={52}/><p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-[#3457d5]">Trust is a product feature</p><h2 className="orendalis-display mt-4 text-4xl tracking-[-.04em]">Atlas explains. You decide.</h2></div>
        <div className="rounded-3xl border border-[#dfe5ee] bg-white p-8 shadow-[0_18px_55px_rgba(31,49,84,.07)]"><p className="text-xl leading-9 text-[#263246]">Every material recommendation distinguishes what is confirmed, what is interpreted, and what is still unknown. No invented certainty. No hidden score deciding your future.</p></div>
      </section>

      <section className="bg-[#0b1220] px-6 py-20 text-center text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#8ea6ff]">Your private career office</p><h2 className="orendalis-display mx-auto mt-4 max-w-2xl text-4xl tracking-[-.04em]">Start with your experience. Reach the opportunities that matter.</h2><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/register" className="rounded-xl bg-[#6d8cff] px-6 py-3 text-sm font-semibold text-white">Create your workspace</Link><Link href="/login" className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white">Sign in</Link></div><nav className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[#97a4b8]" aria-label="Learn more"><Link className="hover:text-white" href="/executive-jobs">Executive jobs</Link><Link className="hover:text-white" href="/executive-career-intelligence">Executive career intelligence</Link><Link className="hover:text-white" href="/about">About ORENDALIS</Link></nav></section>
    </main>
  );
}

function BriefingMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f5f7fb] p-3"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#788396]">{label}</p><p className="mt-1 text-sm font-semibold text-[#172238]">{value}</p></div>;
}
