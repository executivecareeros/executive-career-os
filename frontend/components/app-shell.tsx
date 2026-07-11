"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-white lg:flex">
      <Sidebar />

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/95 px-5 backdrop-blur lg:hidden">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Executive Career OS
          </p>
          <p className="mt-0.5 text-sm font-semibold">Career Command Center</p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          Menu
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <Sidebar mobile onNavigate={() => setMenuOpen(false)} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Close navigation menu"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
