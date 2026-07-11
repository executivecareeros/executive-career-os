"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavigationItemActive, navigationItems } from "@/lib/navigation";
import { SectionCard } from "./section-card";

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${mobile ? "flex h-full" : "hidden min-h-screen lg:flex"} w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950 px-6 py-8`}
      aria-label="Application sidebar"
    >
      <Link href="/" onClick={onNavigate} className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 group-hover:text-slate-400">
          Executive Career OS
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Career Command Center
        </p>
      </Link>

      <nav className="mt-10 space-y-2" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const isActive = isNavigationItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isActive
                  ? "bg-white font-medium text-slate-950"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${isActive ? "bg-slate-950/10" : "bg-white/5"}`}
              >
                {item.marker}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <SectionCard className="mt-auto p-5 sm:p-5">
        <p className="text-sm font-medium text-white">Agent status</p>
        <p className="mt-2 text-sm text-slate-400">
          Waiting for the first opportunity search.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
          System ready
        </div>
      </SectionCard>
    </aside>
  );
}
