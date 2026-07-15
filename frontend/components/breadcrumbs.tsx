"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/lib/navigation";
import type { Locale } from "@/lib/locale";

const executiveLabels: Record<string, string> = {
  "/assistant": "Atlas",
  "/beta-workflow": "Decision Journey",
  "/companies": "Company Intelligence",
  "/workspace": "Career Memory",
  "/archive": "Career Ledger",
  "/productivity": "Today’s Brief",
};

export function Breadcrumbs({ locale = "en" }: { locale?: Locale }) {
  const pathname = usePathname();
  const tr = locale === "tr";
  const currentPage = executiveLabels[pathname] ?? navigationItems.find((item) => item.href === pathname)?.label;
  const isOpportunityDetail = pathname.startsWith("/opportunities/");
  const isCompanyDetail = pathname.startsWith("/companies/");

  if (pathname === "/") {
    return (
      <nav aria-label={tr ? "İçerik yolu" : "Breadcrumb"} className="text-xs text-slate-500">
        <span aria-current="page">{tr ? "Bugün" : "Today"}</span>
      </nav>
    );
  }

  return (
    <nav aria-label={tr ? "İçerik yolu" : "Breadcrumb"} className="flex items-center gap-2 text-xs text-slate-500">
      <Link href="/" className="transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        {tr ? "Bugün" : "Today"}
      </Link>
      <span aria-hidden="true" className="text-slate-700">/</span>
      {isOpportunityDetail || isCompanyDetail ? <><Link href={isCompanyDetail ? "/companies" : "/opportunities"} className="transition hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{isCompanyDetail ? (tr ? "Şirketler" : "Companies") : (tr ? "İşler" : "Jobs")}</Link><span aria-hidden="true" className="text-slate-700">/</span><span aria-current="page" className="text-slate-300">{tr ? "Ayrıntılar" : "Details"}</span></> : <span aria-current="page" className="text-slate-300">{tr ? translatePage(currentPage) : currentPage ?? "Page"}</span>}
    </nav>
  );
}

function translatePage(page?: string) {
  const labels: Record<string, string> = { Home: "Ana Sayfa", Jobs: "İşler", Companies: "Şirketler", Applications: "Başvurular", Profile: "Profil", Settings: "Ayarlar", Atlas: "Atlas", "Decision Journey": "Karar Yolculuğu", "Company Intelligence": "Şirketler", "Career Memory": "Kariyer Kaydı", "Career Ledger": "Kariyer Günlüğü", "Today’s Brief": "Bugünün Özeti" };
  return page ? labels[page] ?? page : "Sayfa";
}
