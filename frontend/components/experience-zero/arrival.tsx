import Link from "next/link";
import { OrendalisMark } from "@/components/brand/orendalis-mark";

export function ExperienceZeroArrival() {
  return (
    <main className="min-h-screen bg-white text-[#17191c]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10" aria-label="Primary navigation">
        <Link href="/" className="text-[#17191c]"><OrendalisMark /></Link>
        <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-[#4b5056] hover:bg-[#f3f4f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7894a6]">Sign in</Link>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-16 px-6 py-16 sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#6f8796]">Executive opportunities, made clearer</p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-.05em] text-[#15171a] sm:text-7xl">Find the next role worth your attention.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#62676d]">Search executive opportunities in one place. Atlas quietly learns what matters to you and explains which roles deserve a closer look.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/login?next=/import" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#17191c] px-6 text-sm font-semibold text-white hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7894a6]">Upload your CV</Link>
            <Link href="/login?next=/opportunities" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d9dcde] px-6 text-sm font-semibold text-[#272a2e] hover:bg-[#f6f7f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7894a6]">Search executive jobs</Link>
          </div>
          <p className="mt-5 text-sm text-[#858a90]">Private by design. Your judgment always remains yours.</p>
        </div>

        <aside className="rounded-[2rem] border border-[#e3e5e6] bg-[#f7f8f8] p-6 shadow-[0_30px_80px_rgba(28,35,42,.08)] sm:p-8" aria-label="How Orendalis works">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[.04]">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7692a3]">Atlas noticed</p>
            <p className="mt-4 text-xl font-semibold leading-7">Seven roles match the leadership scope you described.</p>
            <p className="mt-3 text-sm leading-6 text-[#6a7076]">Two deserve attention today. One may conflict with your location preference.</p>
            <Link href="/login?next=/opportunities" className="mt-6 inline-flex text-sm font-semibold text-[#426b84]">Review recommendations →</Link>
          </div>
          <ol className="mt-7 grid gap-3 text-sm text-[#555b61] sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <li><strong className="block text-[#1e2125]">1. Upload</strong><span className="mt-1 block">Bring your CV.</span></li>
            <li><strong className="block text-[#1e2125]">2. Search</strong><span className="mt-1 block">Use familiar filters.</span></li>
            <li><strong className="block text-[#1e2125]">3. Decide</strong><span className="mt-1 block">Atlas explains the fit.</span></li>
          </ol>
        </aside>
      </section>
    </main>
  );
}
