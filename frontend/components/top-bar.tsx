type TopBarProps = {
  onOpenMenu: () => void;
  menuOpen: boolean;
  locale?: import("@/lib/locale").Locale;
  signedInEmail?: string;
};
import { OrendalisMark } from "@/components/brand/orendalis-mark";

export function TopBar({ onOpenMenu, menuOpen, locale = "en", signedInEmail }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e5e7e8] bg-white/95 px-5 text-[#17191c] backdrop-blur lg:hidden">
      <div className="flex min-w-0 items-center gap-3"><OrendalisMark />{signedInEmail && <span className="max-w-[42vw] truncate rounded-full bg-[#f3eee7] px-3 py-1 text-xs font-medium text-[#55504a]" title={signedInEmail}>{signedInEmail}</span>}</div>
      <button type="button" onClick={onOpenMenu} className="rounded-full border border-[#d8d0c5] px-3 py-2 text-sm text-[#4b5056] hover:bg-[#faf6ef] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#936b3f]" aria-label={locale === "tr" ? "Gezinme menüsünü aç" : "Open navigation menu"} aria-expanded={menuOpen}>
        <span aria-hidden="true">☰</span><span className="sr-only">{locale === "tr" ? "Menü" : "Menu"}</span>
      </button>
    </header>
  );
}
