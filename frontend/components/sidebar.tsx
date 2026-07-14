"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { executiveNavigationItems, executiveUtilityItems, isNavigationItemActive, navigationItems } from "@/lib/navigation";
import { SectionCard } from "./section-card";
import { logoutAction } from "@/app/auth-actions";
import { OrendalisMark } from "@/components/brand/orendalis-mark";
import { AtlasMark } from "@/components/atlas/atlas-mark";
import type { Locale } from "@/lib/locale";

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
  locale?: Locale;
};

export function Sidebar({ mobile = false, onNavigate, locale = "en" }: SidebarProps) {
  const pathname = usePathname();
  const liveMode = process.env.NEXT_PUBLIC_DATA_ACCESS_MODE === "supabase";
  const primaryItems = liveMode ? executiveNavigationItems : navigationItems;
  const labels: Record<string, string> = locale === "tr" ? { Home: "Ana Sayfa", Jobs: "İşler", Companies: "Şirketler", Applications: "Başvurular", Profile: "Profil", Settings: "Ayarlar", "Founder Controls": "Kurucu Kontrolleri" } : {};

  return (
    <aside
      className={`${mobile ? "flex h-full" : "hidden h-screen lg:sticky lg:top-0 lg:flex"} atlas-scrollbar w-72 shrink-0 flex-col overflow-y-auto border-r border-[#e5e7e8] bg-white px-5 py-6`}
      aria-label="Application sidebar"
    >
      <Link
        href="/"
        onClick={onNavigate}
        className="group block rounded-lg text-[#17191c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8ea7b8]"
      >
        <OrendalisMark />
        <p className="mt-3 pl-12 text-[11px] leading-5 text-[#777f85]">Your private career office</p>
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8ea7b8] ${
                isActive
                  ? "bg-[#efe8dc] font-medium text-[#11161b]"
                  : "text-[#626970] hover:bg-[#f3f4f4] hover:text-[#17191c]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${isActive ? "bg-slate-950/10" : "bg-white/5"}`}
              >
                {item.marker}
              </span>
              {labels[item.label] ?? item.label}
            </Link>
          );
        })}
      </nav>

      {liveMode && (
        <nav className="mt-7 border-t border-[#e5e7e8] pt-5" aria-label="Workspace navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#606970]">Your private record</p>
          <div className="space-y-1">
            {executiveUtilityItems.map((item) => {
              const isActive = isNavigationItemActive(pathname, item.href);
              return (
                <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={isActive ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8ea7b8] ${isActive ? "bg-[#efe8dc] font-medium text-[#11161b]" : "text-[#747d84] hover:bg-white/[0.05] hover:text-[#f4f0e8]"}`}>
                  <span aria-hidden="true" className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${isActive ? "bg-slate-950/10" : "bg-white/5"}`}>{item.marker}</span>
                  {labels[item.label] ?? item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <SectionCard className="mt-6 p-4 sm:p-4">
        <div className="flex items-center gap-3"><AtlasMark/><p className="text-sm font-medium text-[#17191c]">{locale === "tr" ? "Atlas hazır" : "Atlas is ready"}</p></div>
        <p className="mt-1 text-xs leading-5 text-[#777f85]">
          {locale === "tr" ? "İkinci bir bakış istediğinde yanında." : "Available when you want a second perspective."}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <span
            className="h-2 w-2 rounded-full bg-emerald-300"
            aria-hidden="true"
          />
          {locale === "tr" ? "Sen hazır olduğunda" : "Ready when you are"}
        </div>
      </SectionCard>
      <form action={logoutAction} className="mt-3">
        <input type="hidden" name="next" value={pathname} />
        <button className="w-full rounded-xl px-4 py-2 text-left text-sm text-[#737980] transition hover:bg-[#f3f4f4] hover:text-[#17191c]">
          {locale === "tr" ? "Çıkış yap" : "Sign out"}
        </button>
      </form>
    </aside>
  );
}
