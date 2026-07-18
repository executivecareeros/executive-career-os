import type { CardProps } from "@/types/design-system";

export function SectionCard({ children, className = "", id }: CardProps) {
  return <section id={id} className={`min-w-0 scroll-mt-24 rounded-[1.4rem] border border-[#dfe5ee] bg-white p-5 shadow-[0_14px_40px_rgba(31,49,84,0.065)] transition-[border-color,box-shadow,transform] duration-200 hover:border-[#cbd5e5] sm:p-6 ${className}`}>{children}</section>;
}
