import Link from "next/link";
import { OrendalisMark } from "@/components/brand/orendalis-mark";

export function ExperienceZeroArrival() {
  return (
    <main className="orendalis-arrival min-h-screen overflow-hidden text-[#f4f0e8]">
      <nav className="relative z-10 mx-auto flex max-w-[90rem] items-center justify-between px-6 py-7 sm:px-10 lg:px-16" aria-label="Primary navigation">
        <Link href="/" className="text-[#efe7d8]"><OrendalisMark /></Link>
        <Link href="/login" className="orendalis-text-link">Private access <span aria-hidden="true">↗</span></Link>
      </nav>

      <section className="relative mx-auto flex min-h-[calc(100vh-92px)] max-w-[90rem] items-center px-6 pb-20 sm:px-10 lg:px-16">
        <div className="orendalis-horizon" aria-hidden="true" />
        <div className="relative z-10 max-w-5xl py-16 sm:py-24">
          <p className="orendalis-eyebrow orendalis-reveal">A private place for consequential careers</p>
          <h1 className="orendalis-display orendalis-reveal orendalis-delay-1 mt-7 max-w-4xl text-5xl leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[6.6rem]">
            Your career carries more than ambition.
          </h1>
          <p className="orendalis-reveal orendalis-delay-2 mt-8 max-w-2xl text-lg leading-8 text-[#b8b2a8] sm:text-xl">
            It carries people, promises, years of judgment—and decisions that cannot be delegated. Orendalis gives that responsibility a private place to think.
          </p>
          <div className="orendalis-reveal orendalis-delay-3 mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/login" className="orendalis-primary-action">Enter Orendalis <span aria-hidden="true">→</span></Link>
            <a href="#promise" className="orendalis-secondary-action">Read the Orendalis promise</a>
          </div>
        </div>
        <p className="absolute bottom-8 right-6 hidden text-[0.65rem] uppercase tracking-[0.28em] text-[#77746e] sm:block lg:right-16">Discretion · Perspective · Agency</p>
      </section>

      <section id="promise" className="border-y border-white/[0.08] bg-[#0d1218] px-6 py-24 sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <p className="orendalis-eyebrow">The private side of leadership</p>
          <div>
            <h2 className="orendalis-display text-4xl leading-tight tracking-[-0.035em] sm:text-6xl">Responsibility is public. Uncertainty rarely is.</h2>
            <div className="mt-10 grid gap-7 text-base leading-7 text-[#aaa59c] sm:grid-cols-2">
              <p>Senior careers are shaped in the quiet moments between what is expected and what is true: when ambition meets family, purpose meets risk, and opportunity meets identity.</p>
              <p>Orendalis preserves the evidence, questions the assumptions, and keeps each decision connected to the life it is meant to serve.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#b7925d]/25 bg-[#111821] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div><p className="orendalis-eyebrow text-[#c8a978]">Atlas</p><p className="mt-5 text-sm leading-6 text-[#858b91]">Your judgment remains yours.</p></div>
            <div><h2 className="orendalis-display text-4xl leading-tight tracking-[-0.035em] sm:text-6xl">A trusted second mind for decisions that cannot be delegated.</h2><p className="mt-7 max-w-2xl text-lg leading-8 text-[#aeb3b8]">Atlas does not perform certainty. It distinguishes what is known, what is estimated, and what still deserves a conversation—then helps you decide with your eyes open.</p></div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.08] px-6 py-24 text-center sm:px-10 lg:py-32">
        <p className="orendalis-eyebrow">The Orendalis promise</p>
        <blockquote className="orendalis-display mx-auto mt-8 max-w-4xl text-3xl leading-tight tracking-[-0.025em] sm:text-5xl">“Your career is not a pipeline. It is a life in motion—and its most important decisions deserve memory, perspective, and care.”</blockquote>
        <Link href="/login" className="orendalis-primary-action mt-12">Return to your private career office <span aria-hidden="true">→</span></Link>
      </section>
      <footer className="mx-auto flex max-w-[90rem] flex-col gap-4 border-t border-white/[0.08] px-6 py-8 text-xs text-[#77746e] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16"><OrendalisMark compact /><p>Built for decisions with consequences.</p></footer>
    </main>
  );
}
