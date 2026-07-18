type TopBarProps = {
  onOpenMenu: () => void;
  menuOpen: boolean;
  locale?: import("@/lib/locale").Locale;
  signedInEmail?: string;
};
import { OrendalisMark } from "@/components/brand/orendalis-mark";
import Link from "next/link";

export function TopBar({ onOpenMenu, menuOpen, locale: _locale = "en", signedInEmail }: TopBarProps) {
  void _locale;
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dfe5ee] bg-white/85 px-5 text-[#0b1220] backdrop-blur-xl lg:hidden">
      <div className="flex min-w-0 items-center gap-3"><Link href="/" aria-label="ORENDALIS Home" className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5]"><OrendalisMark /></Link>{signedInEmail && <span className="max-w-[42vw] truncate rounded-full bg-[#edf1f7] px-3 py-1 text-xs font-medium text-[#4f5d72]" title={signedInEmail}>{signedInEmail}</span>}</div>
      <button type="button" onClick={onOpenMenu} className="rounded-xl border border-[#d7deea] bg-white px-3 py-2 text-sm text-[#4f5d72] shadow-sm hover:bg-[#f8faff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3457d5]" aria-label="Open navigation menu" aria-expanded={menuOpen}>
        <span aria-hidden="true">☰</span><span className="sr-only">Menu</span>
      </button>
    </header>
  );
}
