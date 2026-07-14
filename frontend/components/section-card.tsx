import type { CardProps } from "@/types/design-system";

export function SectionCard({ children, className = "", id }: CardProps) {
  return <section id={id} className={`min-w-0 scroll-mt-24 rounded-2xl border border-white/[0.08] bg-[#111821]/72 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-colors duration-200 sm:p-6 ${className}`}>{children}</section>;
}
