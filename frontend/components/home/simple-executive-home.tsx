import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { SecondaryButton } from "@/components/secondary-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseBetaWorkflowRepository } from "@/lib/beta/repository";
import { loadLatestCollectedDecision } from "@/lib/live-collected-decision";
import type { Locale } from "@/lib/locale";
import type { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";

type Resolved = NonNullable<Awaited<ReturnType<typeof resolveAuthenticatedRepositoryContext>>>;

export async function SimpleExecutiveHome({ resolved, locale }: { resolved: Resolved; locale: Locale }) {
  const tr = locale === "tr";
  let update: "quiet" | "recommendation" | "saved" | "active" = "quiet";
  let opportunityTitle = "";
  let companyName = "";
  let opportunityId = "";

  try {
    const client = createServerSupabaseClient(resolved.accessToken);
    const [view, decision] = await Promise.all([
      new SupabaseBetaWorkflowRepository(client, resolved.context).load(),
      loadLatestCollectedDecision(client, resolved.context.workspace!.workspaceId),
    ]);
    opportunityTitle = decision?.title ?? safeText(view.opportunity?.title);
    companyName = decision?.companyName ?? safeText(view.opportunity?.companyName);
    opportunityId = decision?.opportunityId ?? "";
    const action = decision?.action ?? view.selectedDecisionAction;
    if (action === "Pursue") update = "active";
    else if (action === "Watch") update = "saved";
    else if (view.opportunity && !action) update = "recommendation";
  } catch {
    update = "quiet";
  }

  const atlas = atlasCopy(update, tr, opportunityTitle, companyName);
  return <main className="mx-auto max-w-7xl px-5 py-8 text-[#17191c] sm:px-6 lg:px-10">
    <PageHeader eyebrow={tr ? "Ana Sayfa" : "Home"} title={tr ? "Bir sonraki fırsatını bul." : "Find your next opportunity."} description={tr ? "Yönetici rollerini ara veya Atlas'ın deneyimine göre öne çıkardıklarını incele." : "Search executive jobs, or review the opportunities Atlas has surfaced for your experience."} actions={<SecondaryButton href="/import">{tr ? "CV yükle" : "Upload CV"}</SecondaryButton>} />

    <form action="/opportunities" className="mt-7 flex max-w-4xl flex-col gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 shadow-sm sm:flex-row">
      <label className="sr-only" htmlFor="home-job-search">{tr ? "Yönetici işi ara" : "Search executive jobs"}</label>
      <input id="home-job-search" name="q" type="search" placeholder={tr ? "Rol, şirket veya konum ara" : "Search by role, company, or location"} className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#d9dcde] bg-white px-4 text-[#17191c] placeholder:text-[#92999f]"/>
      <button className="rounded-xl bg-[#17191c] px-6 py-3 text-sm font-semibold text-white hover:bg-black">{tr ? "İş ara" : "Search jobs"}</button>
    </form>

    <section className="mt-7 rounded-2xl border border-[#dce4e7] bg-[#f4f8f8] p-5 sm:p-6" aria-labelledby="atlas-update-title">
      <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#587585]">Atlas</p>
      <h2 id="atlas-update-title" className="mt-2 text-xl font-semibold">{atlas.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f686e]">{atlas.detail}</p>
      <div className="mt-4"><PrimaryButton href={atlas.href}>{atlas.action}</PrimaryButton></div>
    </section>

    <div className="mt-7 grid gap-5 md:grid-cols-3">
      <HomeCard title={tr ? "Yeni öneriler" : "New recommendations"} detail={update === "recommendation" ? (tr ? "Atlas'ın incelemeye değer bulduğu bir rol var." : "Atlas found a role worth reviewing.") : (tr ? "Güçlü bir eşleşme bulunduğunda burada görünür." : "Strong new matches will appear here.")} href="/opportunities" action={tr ? "Atlas'ın bulduklarını gör" : "See what Atlas found"}/>
      <HomeCard title={tr ? "Kaydedilen işler" : "Saved jobs"} detail={update === "saved" && opportunityTitle ? `${opportunityTitle}${companyName ? ` · ${companyName}` : ""}` : (tr ? "Takip etmek istediğin işler burada kalır." : "Jobs you want to watch will stay here.")} href={opportunityId ? `/opportunities/${encodeURIComponent(opportunityId)}` : "/opportunities"} action={tr ? "Kaydedilenleri gör" : "View saved jobs"}/>
      <HomeCard title={tr ? "Aktif başvurular" : "Active applications"} detail={update === "active" && opportunityTitle ? `${opportunityTitle}${companyName ? ` · ${companyName}` : ""}` : (tr ? "İlerletmeyi seçtiğin fırsatlar burada görünür." : "Opportunities you choose to pursue will appear here.")} href="/applications" action={tr ? "Başvuruları gör" : "View applications"}/>
    </div>
  </main>;
}

function HomeCard({ title, detail, href, action }: { title: string; detail: string; href: string; action: string }) {
  return <section className="flex min-h-48 flex-col rounded-2xl border border-[#e3e5e6] bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-3 flex-1 text-sm leading-6 text-[#697076]">{detail}</p><div className="mt-5"><SecondaryButton href={href}>{action}</SecondaryButton></div></section>;
}

function atlasCopy(state: "quiet" | "recommendation" | "saved" | "active", tr: boolean, title: string, company: string) {
  const role = title ? `${title}${company ? ` · ${company}` : ""}` : "";
  if (state === "active") return { title: tr ? "Aktif fırsatın için bir sonraki adım hazır." : "Your next step is ready for an active opportunity.", detail: role || (tr ? "Şirketi incele ve başvuru hazırlığını tamamla." : "Review the company and prepare your application."), href: "/applications", action: tr ? "Sonraki adımı gör" : "See next step" };
  if (state === "saved") return { title: tr ? "Kaydettiğin fırsat düzenli biçimde takip ediliyor." : "Your saved opportunity is organized and ready to revisit.", detail: role || (tr ? "Önemli bilgiler değiştiğinde farkı açıkça görebilirsin." : "You will be able to see clearly when important information changes."), href: "/opportunities", action: tr ? "Kaydedilen işi gör" : "Review saved job" };
  if (state === "recommendation") return { title: tr ? "İncelemeye değer bir fırsat buldum." : "I found an opportunity worth reviewing.", detail: role || (tr ? "Neden uygun olabileceğini ve başvurmadan önce neyi kontrol etmen gerektiğini göstereceğim." : "I’ll show why it may fit and what to check before applying."), href: "/opportunities", action: tr ? "Atlas'ın bulduğunu gör" : "See what Atlas found" };
  return { title: tr ? "Henüz güçlü bir yeni eşleşme bulamadım." : "I do not yet have a strong new match.", detail: tr ? "Tüm işleri arayabilir veya daha iyi öneriler için CV'ni yükleyebilirsin." : "You can search all jobs now, or upload your CV for more relevant recommendations.", href: "/opportunities", action: tr ? "Tüm işleri ara" : "Search all jobs" };
}

function safeText(value: unknown) { return typeof value === "string" ? value : ""; }
