export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-8 py-10">

        <header className="mb-12">
          <h1 className="text-5xl font-bold">
            Executive Career OS
          </h1>

          <p className="mt-4 text-xl text-slate-400">
            The AI Operating System for Executive Careers
          </p>
        </header>

        <div className="grid grid-cols-4 gap-6">

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">
              New Opportunities
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              0
            </h2>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">
              Applications
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              0
            </h2>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">
              Interviews
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              0
            </h2>
          </div>

          <div className="rounded-xl bg-slate-900 p-6">
            <p className="text-slate-400">
              Companies Watching
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              0
            </h2>
          </div>

        </div>

        <section className="mt-12 rounded-xl bg-slate-900 p-8">

          <h2 className="text-2xl font-semibold">
            Welcome, Cüneyt
          </h2>

          <p className="mt-3 text-slate-400">
            Executive Career OS has been initialized successfully.
          </p>

        </section>

      </div>
    </main>
  );
}