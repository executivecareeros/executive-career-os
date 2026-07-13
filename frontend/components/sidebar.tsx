"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { executiveNavigationItems, executiveUtilityItems, isNavigationItemActive, navigationItems } from "@/lib/navigation";
import { SectionCard } from "./section-card";
import { logoutAction } from "@/app/auth-actions";

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const liveMode = process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase";
  const primaryItems = liveMode ? executiveNavigationItems : navigationItems;

  return (
    <aside
      className={`${mobile ? "flex h-full" : "hidden h-screen lg:sticky lg:top-0 lg:flex"} atlas-scrollbar w-72 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-slate-950 px-5 py-6`}
      aria-label="Application sidebar"
    >
      <Link
        href="/"
        onClick={onNavigate}
        className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 group-hover:text-slate-400">
          Orendalis
        </p>
        <p className="mt-2 text-xl font-semibold tracking-tight text-white">
          Executive Decision Intelligence
        </p>
      </Link>

      <nav className="mt-7 space-y-1" aria-label="Primary navigation">
        {primaryItems.map((item) => {
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

      {liveMode && (
        <nav className="mt-7 border-t border-white/10 pt-5" aria-label="Workspace navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-slate-600">Your account</p>
          <div className="space-y-1">
            {executiveUtilityItems.map((item) => {
              const isActive = isNavigationItemActive(pathname, item.href);
              return (
                <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={isActive ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${isActive ? "bg-white font-medium text-slate-950" : "text-slate-500 hover:bg-white/5 hover:text-white"}`}>
                  <span aria-hidden="true" className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${isActive ? "bg-slate-950/10" : "bg-white/5"}`}>{item.marker}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <SectionCard className="mt-6 p-4 sm:p-4">
        <p className="text-sm font-medium text-white">Atlas status</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Your confirmed career context is available.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <span
            className="h-2 w-2 rounded-full bg-emerald-300"
            aria-hidden="true"
          />
          Ready to advise
        </div>
      </SectionCard>
      <form action={logoutAction} className="mt-3">
        <input type="hidden" name="next" value={pathname} />
        <button className="w-full rounded-xl px-4 py-2 text-left text-sm text-slate-500 transition hover:bg-white/5 hover:text-white">
          Sign out
        </button>
      </form>
    </aside>
  );
}
