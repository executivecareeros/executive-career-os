import Link from "next/link";
import { PageHeader } from "@/components/page-header";

const metrics = [
  { label: "New Opportunities", value: "0", note: "Today" },
  { label: "Qualified Roles", value: "0", note: "AI screened" },
  { label: "Applications", value: "0", note: "This week" },
  { label: "Interviews", value: "0", note: "Active" },
];

const pipeline = [
  { label: "Discovered", value: 0 },
  { label: "Scored", value: 0 },
  { label: "Ready", value: 0 },
  { label: "Applied", value: 0 },
  { label: "Interview", value: 0 },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10">
            <PageHeader
              eyebrow="Good afternoon, Cüneyt"
              title="Executive dashboard"
              description="Track opportunities, applications, companies, and AI recommendations from one place."
              actions={
                <>
                <Link href="/reports" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  View report
                </Link>
                <Link href="/opportunities" className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  Run career agent
                </Link>
                </>
              }
            />

            <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <p className="text-sm text-slate-400">{metric.label}</p>
                  <p className="mt-4 text-4xl font-semibold">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{metric.note}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Today&apos;s executive brief
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      Your search is ready to begin.
                    </h3>
                  </div>
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                    AI brief
                  </span>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <BriefCard
                    title="Market signal"
                    text="No market data yet. The first search run will identify active sectors and regions."
                  />
                  <BriefCard
                    title="Recommended focus"
                    text="Prioritize senior commercial roles in broadcast, telecom, enterprise software, and AI."
                  />
                  <BriefCard
                    title="Next action"
                    text="Connect the opportunity database and run the first scoring workflow."
                  />
                </div>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <p className="text-sm text-slate-400">Top opportunity</p>
                <div className="mt-8 flex min-h-52 items-center justify-center rounded-xl border border-dashed border-white/15">
                  <p className="max-w-xs text-center text-sm leading-6 text-slate-500">
                    The strongest opportunity will appear here after the first
                    AI scoring run.
                  </p>
                </div>
              </article>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Opportunity pipeline</p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    Executive application flow
                  </h3>
                </div>
                <p className="text-sm text-slate-500">
                  Discover → Score → Prepare → Apply → Interview
                </p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {pipeline.map((stage) => (
                  <div
                    key={stage.label}
                    className="rounded-xl border border-white/10 bg-slate-950/40 p-5"
                  >
                    <p className="text-sm text-slate-400">{stage.label}</p>
                    <p className="mt-3 text-3xl font-semibold">{stage.value}</p>
                  </div>
                ))}
              </div>
            </section>
    </div>
  );
}

function BriefCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
