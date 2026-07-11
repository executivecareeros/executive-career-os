"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs } from "./breadcrumbs";

export function PageContent({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-6 lg:px-10">
        <Breadcrumbs />
      </div>
      {children}
    </div>
  );
}
