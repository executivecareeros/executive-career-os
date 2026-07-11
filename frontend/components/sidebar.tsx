"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavigationItemActive, navigationItems } from "@/lib/navigation";
import { SectionCard } from "./section-card";
import { logoutAction } from "@/app/auth-actions";

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${mobile ? "flex h-full" : "hidden h-screen lg:sticky lg:top-0 lg:flex"} atlas-scrollbar w-72 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-slate-950 px-5 py-6`}
      aria-label="Application sidebar"
    >
      <Link href="/" onClick={onNavigate} className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 group-hover:text-slate-400">
          Executive Career OS
        </p>
        <p className="mt-2 text-xl font-semibold tracking-tight text-white">
          Atlas Executive OS
        </p>
      </Link>

      <nav className="mt-7 space-y-1" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const isActive = isNavigationItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
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

      <SectionCard className="mt-6 p-4 sm:p-4">
        <p className="text-sm font-medium text-white">Workspace health</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Memory, reasoning, and productivity systems ready.</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
          System ready
        </div>
      </SectionCard>
      <form action={logoutAction} className="mt-3">
        <button className="w-full rounded-xl px-4 py-2 text-left text-sm text-slate-500 transition hover:bg-white/5 hover:text-white">Sign out</button>
      </form>
    </aside>
  );
}
