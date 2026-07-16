import type { CardProps } from "@/types/design-system";

export function SectionCard({ children, className = "", id }: CardProps) {
  return <section id={id} className={`min-w-0 scroll-mt-24 rounded-[1.25rem] border border-[#e3ddd3] bg-[#fffdf9] p-5 shadow-[0_16px_44px_rgba(54,43,31,0.055)] transition-colors duration-200 sm:p-6 ${className}`}>{children}</section>;
}
