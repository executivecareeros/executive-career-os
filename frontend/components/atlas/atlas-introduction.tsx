"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AtlasMark } from "./atlas-mark";
import type { Locale } from "@/lib/locale";

export function AtlasIntroduction({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setOpen(localStorage.getItem("orendalis-introduction-seen") !== "1"), 0); return () => window.clearTimeout(timer); }, []);
  const close = () => { localStorage.setItem("orendalis-introduction-seen", "1"); setOpen(false); };
  if (!open) return null;
  const tr = locale === "tr";
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/20 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="atlas-intro-title"><section className="w-full max-w-lg rounded-3xl border border-[#dfe2e3] bg-white p-7 text-[#17191c] shadow-2xl"><div className="flex items-center gap-3"><AtlasMark size={42}/><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#6f8796]">Atlas</p><h2 id="atlas-intro-title" className="text-xl font-semibold">{tr ? "Sana kısaca eşlik edeyim." : "Let me show you the essentials."}</h2></div></div><ol className="mt-6 space-y-3 text-sm leading-6 text-[#5f666d]"><li><strong className="text-[#17191c]">1.</strong> {tr ? "CV’ni yükleyebilir veya hemen iş arayabilirsin." : "Upload your CV, or search jobs immediately."}</li><li><strong className="text-[#17191c]">2.</strong> {tr ? "Atlas, paylaşmayı seçtiğin bilgilere göre fırsatları karşılaştırır." : "Atlas compares roles using only what you choose to share."}</li><li><strong className="text-[#17191c]">3.</strong> {tr ? "Kaydet, ilerle, izle veya geç. Karar sende." : "Save, pursue, watch, or skip. The decision remains yours."}</li></ol><div className="mt-7 flex gap-3"><Link href="/opportunities" onClick={close} className="flex-1 rounded-xl bg-[#17191c] px-4 py-3 text-center text-sm font-semibold text-white">{tr ? "İşleri gör" : "See jobs"}</Link><button onClick={close} className="rounded-xl border border-[#d9dcde] px-4 py-3 text-sm font-semibold">{tr ? "Şimdilik geç" : "Skip for now"}</button></div></section></div>;
}
