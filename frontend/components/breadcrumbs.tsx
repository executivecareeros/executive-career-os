"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/lib/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const currentPage = navigationItems.find((item) => item.href === pathname);

  if (pathname === "/") {
    return (
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <span aria-current="page">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
      <Link href="/" className="transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        Dashboard
      </Link>
      <span aria-hidden="true" className="text-slate-700">/</span>
      <span aria-current="page" className="text-slate-300">{currentPage?.label ?? "Page"}</span>
    </nav>
  );
}
