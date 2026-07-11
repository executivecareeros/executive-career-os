"use client";

import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { PageContent } from "./page-content";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExecutiveCommandBar } from "./executive-command-bar";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const menu = useMobileMenu();
  const pathname = usePathname();
  const [focusMode, setFocusMode] = useState(false);
  if (["/login", "/register", "/forgot-password", "/reset-password", "/welcome", "/onboarding"].some((path) => pathname.startsWith(path))) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 text-white lg:flex">
      {!focusMode && <Sidebar />}

      <TopBar onOpenMenu={menu.open} menuOpen={menu.isOpen} />

      {menu.isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={menu.close}
            aria-label="Close navigation menu"
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <Sidebar mobile onNavigate={menu.close} />
            <button
              type="button"
              onClick={menu.close}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Close navigation menu"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <ExecutiveCommandBar focusMode={focusMode} onToggleFocus={()=>setFocusMode(value=>!value)} />
        <PageContent>{children}</PageContent>
      </main>
    </div>
  );
}
