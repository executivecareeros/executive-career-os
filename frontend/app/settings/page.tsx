import { cookies } from "next/headers";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { getLocale } from "@/lib/locale";
import { saveNotificationPreferences } from "./actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [locale, cookieStore, query] = await Promise.all([getLocale(), cookies(), searchParams]);
  const tr = locale === "tr";
  const enabled = cookieStore.get("orendalis-daily-summary")?.value === "enabled";
  return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-10">
    <PageHeader eyebrow={tr ? "Hesabın" : "Your account"} title={tr ? "Ayarlar" : "Settings"} description={tr ? "Dilini, gizlilik tercihlerini ve Atlas’ın sana nasıl ulaşacağını yönet." : "Manage your language, privacy choices, and how Atlas may contact you."}/>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      <SectionCard><h2 className="text-lg font-semibold">{tr ? "Dil" : "Language"}</h2><p className="mt-2 text-sm leading-6 text-[#6f757b]">{tr ? "Arayüz ve Atlas yanıtları seçtiğin dili kullanır. İş ilanlarının özgün dili korunur." : "The interface and Atlas guidance use your chosen language. Original job descriptions remain unchanged."}</p><div className="mt-5"><LanguageSwitcher locale={locale}/></div></SectionCard>
      <SectionCard><h2 className="text-lg font-semibold">{tr ? "Gizlilik ve erişim" : "Privacy and access"}</h2><p className="mt-2 text-sm leading-6 text-[#6f757b]">{tr ? "Kariyer kayıtların hesabına özeldir. Sen istemeden hiçbir fırsata başvuru yapılmaz." : "Your career records remain private to your account. Nothing is submitted without your action."}</p></SectionCard>
      <SectionCard className="md:col-span-2"><h2 className="text-lg font-semibold">{tr ? "Atlas bildirimleri" : "Atlas notifications"}</h2><p className="mt-2 text-sm leading-6 text-[#6f757b]">{tr ? "Gelecekte yeni fırsat özetleri almak isteyip istemediğini seç. Bu ayar bugün e-posta göndermez." : "Choose whether you want future summaries of new opportunities. This setting does not send email today."}</p>{query.saved === "1" && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{tr ? "Tercihin kaydedildi." : "Your preference was saved."}</p>}<form action={saveNotificationPreferences} className="mt-5"><label className="flex items-start gap-3"><input type="checkbox" name="dailySummary" defaultChecked={enabled} className="mt-1 size-4 accent-[#55778a]"/><span><strong className="block text-sm">{tr ? "Yeni fırsatlar için isteğe bağlı özet" : "Optional summary of new opportunities"}</strong><span className="mt-1 block text-xs leading-5 text-[#747a80]">{tr ? "Bildirim gönderimi başlatılmadan önce ayrıca doğrulanacaktır." : "Delivery will be verified separately before any notification is sent."}</span></span></label><button className="mt-5 rounded-xl bg-[#17191c] px-5 py-3 text-sm font-semibold text-white">{tr ? "Tercihi kaydet" : "Save preference"}</button></form></SectionCard>
    </div>
  </div>;
}
