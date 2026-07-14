import { cookies, headers } from "next/headers";

export type Locale = "en" | "tr";

export async function getLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("orendalis-language")?.value;
  if (cookieLocale === "tr" || cookieLocale === "en") return cookieLocale;
  const browserLanguage = (await headers()).get("accept-language")?.toLowerCase() ?? "";
  return browserLanguage.startsWith("tr") ? "tr" : "en";
}

export const copy = {
  en: {
    signIn: "Sign in", searchJobs: "Search jobs", uploadCv: "Upload your CV",
    hero: "Find your next executive opportunity.",
    heroBody: "Upload your CV, search executive jobs from across the market, and let Atlas help you discover the ones you should not miss.",
    atlasTitle: "Atlas noticed", atlasBody: "Atlas compares available roles with the experience and preferences you choose to share—then explains what deserves attention.",
    control: "You remain in control", controlBody: "Save, pursue, watch, or skip. Atlas offers a second perspective; every decision stays yours.",
    how: "A simpler way to search", steps: ["Bring your CV—or skip it for now.", "Search jobs with familiar filters.", "Review what Atlas found and decide."],
    final: "Ready to see what deserves your attention?", welcome: "Welcome back.",
    loginBody: "Search jobs, review Atlas recommendations, and continue where you left off.",
  },
  tr: {
    signIn: "Giriş yap", searchJobs: "İş ara", uploadCv: "CV’ni yükle",
    hero: "Bir sonraki yönetici fırsatını bul.",
    heroBody: "CV’ni yükle, piyasadaki yönetici pozisyonlarını tek yerde ara ve kaçırmaman gereken fırsatları Atlas ile keşfet.",
    atlasTitle: "Atlas’ın dikkatini çekti", atlasBody: "Atlas, mevcut rolleri paylaşmayı seçtiğin deneyim ve tercihlerle karşılaştırır; sonra hangilerinin neden önemli olduğunu açıklar.",
    control: "Kontrol sende", controlBody: "Kaydet, ilerle, izle veya geç. Atlas ikinci bir bakış sunar; kararı her zaman sen verirsin.",
    how: "İş aramanın daha sade yolu", steps: ["CV’ni yükle veya şimdilik geç.", "Tanıdık filtrelerle iş ara.", "Atlas’ın bulduklarını incele ve karar ver."],
    final: "Dikkatini hak eden fırsatları görmeye hazır mısın?", welcome: "Tekrar hoş geldin.",
    loginBody: "İş ara, Atlas önerilerini incele ve kaldığın yerden devam et.",
  },
} as const;
