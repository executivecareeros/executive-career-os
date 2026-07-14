import { redirect } from "next/navigation";
import { AuthField, AuthFrame, FormMessage } from "@/components/auth/auth-frame";
import { currentSession } from "@/lib/auth/session";
import { getLocale } from "@/lib/locale";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { onboardingAction } from "../auth-actions";

export default async function Onboarding({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [q, session, locale] = await Promise.all([searchParams, currentSession(), getLocale()]);
  if (!session) redirect("/login?next=/onboarding");
  const membership = await createServerSupabaseClient(session.accessToken).request<Array<{ id: string }>>("workspace_memberships?select=id&status=eq.Active&archived_at=is.null&limit=1");
  if (membership.data?.length) redirect("/");
  const tr = locale === "tr";
  return <AuthFrame locale={locale} eyebrow={tr ? "Orendalis’e hoş geldin" : "Welcome to Orendalis"} title={tr ? "Nasıl başlamak istersin?" : "How would you like to begin?"} description={tr ? "CV’ni yükle ve temel bilgileri Atlas hazırlasın veya doğrudan yönetici pozisyonlarını ara. Profilini daha sonra tamamlayabilirsin." : "Upload your CV and let Atlas prepare the basics, or go straight to executive job search. You can complete your profile later."}>
    <FormMessage message={q.error} />
    <form action={onboardingAction} className="space-y-5">
      <AuthField label={tr ? "Sana nasıl hitap edelim?" : "What should we call you?"} name="preferredName" autoComplete="given-name" />
      <input type="hidden" name="currentRole" value="To be confirmed" /><input type="hidden" name="country" value="Not provided" /><input type="hidden" name="preferredLanguage" value={locale === "tr" ? "Turkish" : "English"} /><input type="hidden" name="timezone" value="UTC" /><input type="hidden" name="careerAmbition" value="To be discovered progressively" /><input type="hidden" name="atlasPromiseAccepted" value="on" />
      <div className="grid gap-3"><button name="intent" value="upload" className="rounded-2xl bg-[#17191c] p-5 text-left text-white hover:bg-black"><strong className="text-base">{tr ? "CV’mi yükle" : "Upload my CV"}</strong><span className="mt-1 block text-sm text-white/70">{tr ? "Atlas, incelemen için özel bir taslak hazırlar." : "Atlas prepares a private draft for your review."}</span></button><button name="intent" value="skip" className="rounded-2xl border border-[#d9dcde] bg-white p-5 text-left text-[#202327] hover:bg-[#f7f8f8]"><strong className="text-base">{tr ? "Şimdilik geç" : "Skip for now"}</strong><span className="mt-1 block text-sm text-[#6c7278]">{tr ? "Doğrudan yönetici pozisyonlarını ara." : "Go directly to executive job search."}</span></button></div>
      <p className="text-xs leading-5 text-[#7a8086]">{tr ? "Atlas önerilerini açıklar, geçmişini sessizce değiştirmez ve her kararı sana bırakır." : "Atlas explains its recommendations, never silently changes your history, and leaves every decision with you."}</p>
    </form>
  </AuthFrame>;
}
