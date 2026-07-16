import Link from "next/link";
import {
  AuthField,
  AuthFrame,
  FormMessage,
  SubmitButton,
} from "@/components/auth/auth-frame";
import { loginAction } from "../auth-actions";
import { copy, getLocale } from "@/lib/locale";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const locale = await getLocale();
  const t = copy[locale];
  return (
    <AuthFrame
      locale={locale}
      eyebrow={locale === "tr" ? "Güvenli giriş" : "Private access"}
      title={t.welcome}
      description={t.loginBody}
      footer={
        <>
          {locale === "tr" ? "Orendalis’e ilk kez mi geliyorsun? " : "Entering Orendalis for the first time? "}
          <Link className="font-medium text-[#936b3f] hover:text-[#6f4d2d]" href="/register">
            {locale === "tr" ? "Davetini kabul et" : "Accept your invitation"}
          </Link>
        </>
      }
    >
      <FormMessage message={q.error} />
      <FormMessage
        tone="success"
        message={
          q.verification
            ? (locale === "tr" ? "Adresini doğrulamak için e-postanı kontrol et." : "Check your email to verify your address.")
            : q.reset
              ? (locale === "tr" ? "Parolan güncellendi." : "Your password was updated.")
              : q.verified
                ? (locale === "tr" ? "E-posta adresin doğrulandı. Şimdi giriş yapabilirsin." : "Email verified. You may now sign in.")
                : undefined
        }
      />
      <form action={loginAction} className="space-y-5">
        <input type="hidden" name="next" value={q.next ?? ""} />
        <AuthField
          label={locale === "tr" ? "E-posta adresi" : "Email address"}
          name="email"
          type="email"
          autoComplete="email"
        />
        <AuthField
          label={locale === "tr" ? "Parola" : "Password"}
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[#625d57]">
            <input
              name="remember"
              type="checkbox"
              className="accent-[#936b3f]"
            />
            {locale === "tr" ? "Beni hatırla" : "Remember me"}
          </label>
          <Link href="/forgot-password" className="font-medium text-[#936b3f]">
            {locale === "tr" ? "Parolanı mı unuttun?" : "Forgot password?"}
          </Link>
        </div>
        <SubmitButton>{locale === "tr" ? "Giriş yap" : "Sign in"}</SubmitButton>
      </form>
    </AuthFrame>
  );
}
