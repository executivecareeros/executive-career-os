import type { CardProps } from "@/types/design-system";

export function SectionCard({ children, className = "", id }: CardProps) {
  return <section id={id} className={`min-w-0 scroll-mt-24 rounded-2xl border border-[#e3e5e6] bg-white p-5 shadow-[0_12px_34px_rgba(28,35,42,0.05)] transition-colors duration-200 sm:p-6 ${className}`}>{children}</section>;
}
