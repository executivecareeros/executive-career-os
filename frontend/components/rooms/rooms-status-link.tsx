import Link from "next/link";

export function RoomsStatusLink({ compact=false }: { compact?:boolean }) {
  return <Link href="/rooms" title="Executive Rooms" aria-label="Open Executive Rooms" className="group relative inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d7deea] bg-white px-3 py-2 text-sm font-semibold text-[#4f5d72] shadow-sm transition hover:border-[#9eb3ca] hover:bg-[#f8faff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5]">
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8"><path d="M5 6.5h14v9H9l-4 3v-12Z"/><path d="M8.5 10h7M8.5 12.7h4.5"/></svg>
    {!compact&&<span>Executive Rooms</span>}
  </Link>;
}
