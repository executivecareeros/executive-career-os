"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";
import type { Locale } from "@/lib/locale";

export function PageContent({ children, locale = "en" }: Readonly<{ children: React.ReactNode; locale?: Locale }>) {
  const pathname = usePathname();

  return (
    <div key={pathname} data-atlas-safe-content className="page-enter pb-28 sm:pb-32">
      <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-6 lg:px-10">
        <Breadcrumbs locale={locale} />
      </div>
      {children}
    </div>
  );
}
