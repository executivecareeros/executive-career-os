"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/locale";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return <div className="inline-flex rounded-full border border-[#d9dcde] bg-white p-1" aria-label={locale === "tr" ? "Dil seçimi" : "Language selection"}>
    {(["en", "tr"] as const).map((language) => <a key={language} href={`${pathname}?lang=${language}`} hrefLang={language} aria-current={locale === language ? "true" : undefined} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${locale === language ? "bg-[#17191c] text-white" : "text-[#687078] hover:bg-[#f3f4f4]"}`}>{language === "en" ? "EN" : "TR"}</a>)}
  </div>;
}
