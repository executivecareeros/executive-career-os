import Link from "next/link";
import { AuthField, AuthFrame, FormMessage, SubmitButton } from "@/components/auth/auth-frame";
import { getLocale } from "@/lib/locale";
import { registerAction } from "../auth-actions";

export default async function Register({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const locale = await getLocale();
  const tr = locale === "tr";
  const invite = q.invite?.trim();
  const invitedEmail = q.email?.trim().toLowerCase();
  return <AuthFrame locale={locale} eyebrow={tr ? "Yalnızca davetle" : "Invitation-only private beta"} title={invite ? (tr ? "Davetini kabul et" : "Accept your invitation") : (tr ? "Kurucu daveti gerekli" : "Founder invitation required")} description={invite ? (tr ? "Hesabını oluştur. Ardından CV’ni yükleyebilir veya doğrudan iş arayabilirsin." : "Create your account. Then upload your CV or go straight to job search.") : (tr ? "Özel beta döneminde kayıt için geçerli bir davet bağlantısı gerekir." : "A valid invitation link is required during private beta.")} footer={<>{tr ? "Zaten hesabın var mı? " : "Already have an account? "}<Link className="text-[#52758a]" href="/login">{tr ? "Giriş yap" : "Sign in"}</Link></>}>
    {invite ? <><FormMessage message={q.error}/><form action={registerAction} className="space-y-5"><input type="hidden" name="inviteToken" value={invite}/><AuthField label={tr ? "Davet edilen e-posta" : "Invited email address"} name="email" type="email" autoComplete="email" defaultValue={invitedEmail} readOnly={Boolean(invitedEmail)}/><AuthField label={tr ? "Parola" : "Password"} name="password" type="password" autoComplete="new-password"/><p className="text-xs text-[#747a80]">{tr ? "En az 8 karakter kullan. Devam etmeden önce e-postanı doğrulayacaksın." : "Use at least 8 characters. You will verify your email before continuing."}</p><SubmitButton>{tr ? "Hesabımı oluştur" : "Create account"}</SubmitButton></form></> : <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{tr ? "Kayıt, kurucu tarafından gönderilen bir davet olmadan devam edemez." : "Registration cannot continue without a founder-issued invitation."}</p>}
  </AuthFrame>;
}
