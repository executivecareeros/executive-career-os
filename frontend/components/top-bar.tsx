type TopBarProps = {
  onOpenMenu: () => void;
  menuOpen: boolean;
};

export function TopBar({ onOpenMenu, menuOpen }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/95 px-5 backdrop-blur lg:hidden">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Executive Career OS</p>
        <p className="mt-0.5 text-sm font-semibold text-white">Career Command Center</p>
      </div>
      <button type="button" onClick={onOpenMenu} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Open navigation menu" aria-expanded={menuOpen}>
        Menu
      </button>
    </header>
  );
}
