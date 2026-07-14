"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/lib/navigation";

const executiveLabels: Record<string, string> = {
  "/assistant": "Atlas",
  "/beta-workflow": "Decision Journey",
  "/companies": "Company Intelligence",
  "/workspace": "Career Memory",
  "/archive": "Career Ledger",
  "/productivity": "Today’s Brief",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const currentPage = executiveLabels[pathname] ?? navigationItems.find((item) => item.href === pathname)?.label;
  const isOpportunityDetail = pathname.startsWith("/opportunities/");
  const isCompanyDetail = pathname.startsWith("/companies/");

  if (pathname === "/") {
    return (
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <span aria-current="page">Today</span>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
      <Link href="/" className="transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        Today
      </Link>
      <span aria-hidden="true" className="text-slate-700">/</span>
      {isOpportunityDetail || isCompanyDetail ? <><Link href={isCompanyDetail ? "/companies" : "/opportunities"} className="transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{isCompanyDetail ? "Company Intelligence" : "Opportunities"}</Link><span aria-hidden="true" className="text-slate-700">/</span><span aria-current="page" className="text-slate-300">Details</span></> : <span aria-current="page" className="text-slate-300">{currentPage ?? "Page"}</span>}
    </nav>
  );
}
