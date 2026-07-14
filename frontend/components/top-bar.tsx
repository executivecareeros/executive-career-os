type TopBarProps = {
  onOpenMenu: () => void;
  menuOpen: boolean;
};
import { OrendalisMark } from "@/components/brand/orendalis-mark";

export function TopBar({ onOpenMenu, menuOpen }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0a1016]/95 px-5 text-[#efe7d8] backdrop-blur lg:hidden">
      <OrendalisMark />
      <button type="button" onClick={onOpenMenu} className="rounded-full border border-white/10 px-3 py-2 text-sm text-[#c7c1b7] hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8ea7b8]" aria-label="Open navigation menu" aria-expanded={menuOpen}>
        <span aria-hidden="true">☰</span><span className="sr-only">Menu</span>
      </button>
    </header>
  );
}
