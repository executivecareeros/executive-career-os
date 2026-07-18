"use client";

import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { PageContent } from "./page-content";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExecutiveCommandBar } from "./executive-command-bar";
import type { Locale } from "@/lib/locale";
import { ProductLearningTracker } from "./product-learning-tracker";

export function AppShell({ children, publicExperience = false, locale = "en", signedInName, signedInEmail }: Readonly<{ children: React.ReactNode; publicExperience?: boolean; locale?: Locale; signedInName?: string; signedInEmail?: string }>) {
  const menu = useMobileMenu();
  const pathname = usePathname();
  const [focusMode, setFocusMode] = useState(false);
  if ((pathname === "/" && publicExperience) || ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/auth/confirm", "/welcome", "/onboarding"].some((path) => pathname.startsWith(path))) return <>{children}</>;

  return (
    <div data-executive-shell className="min-h-screen bg-[#f5f7fb] text-[#0b1220] lg:flex">
      {signedInEmail && <ProductLearningTracker />}
      {!focusMode && <Sidebar locale={locale} />}

      <TopBar onOpenMenu={menu.open} menuOpen={menu.isOpen} locale={locale} signedInName={signedInName} signedInEmail={signedInEmail} />

      {menu.isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#07101f]/45 backdrop-blur-sm"
            onClick={menu.close}
            aria-label={locale === "tr" ? "Gezinme menüsünü kapat" : "Close navigation menu"}
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl">
            <Sidebar mobile onNavigate={menu.close} locale={locale} />
            <button
              type="button"
              onClick={menu.close}
              className="absolute right-4 top-4 rounded-lg p-2 text-[#5f6b7a] hover:bg-[#edf1f7] hover:text-[#0b1220] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5]"
              aria-label="Close navigation menu"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <ExecutiveCommandBar focusMode={focusMode} onToggleFocus={()=>setFocusMode(value=>!value)} locale={locale} signedInName={signedInName} signedInEmail={signedInEmail} />
        <PageContent locale={locale}>{children}</PageContent>
      </main>
    </div>
  );
}
